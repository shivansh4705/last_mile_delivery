import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RateCalculationInput {
  length: number;       // cm
  width: number;        // cm
  height: number;       // cm
  actualWeight: number; // kg
  pickupPincode: string;
  dropPincode: string;
  orderType: 'B2B' | 'B2C';
  paymentType: 'PREPAID' | 'COD';
}

export interface RateCalculationOutput {
  volumetricWeight: number;
  chargeableWeight: number;
  actualWeight: number;
  pickupZone: { id: string; name: string; code: string } | null;
  dropZone: { id: string; name: string; code: string } | null;
  zoneType: 'INTRA' | 'INTER';
  baseCharge: number;
  weightCharge: number;
  codSurcharge: number;
  totalCharge: number;
  appliedRateCard: {
    baseWeight: number;
    baseRate: number;
    perKgRate: number;
    minCharge: number;
    codSurcharge: number;
  };
}

export class RateEngine {
  /**
   * Calculates volumetric weight in kg from dimensions in cm: (L * W * H) / 5000
   */
  public static calculateVolumetricWeight(length: number, width: number, height: number): number {
    if (length <= 0 || width <= 0 || height <= 0) return 0;
    const vol = (length * width * height) / 5000;
    return parseFloat(vol.toFixed(2));
  }

  /**
   * Detect zone from database by area pincode
   */
  public static async detectZoneByPincode(pincode: string) {
    const area = await prisma.area.findFirst({
      where: { pincode: pincode.trim() },
      include: { zone: true },
    });
    return area ? area.zone : null;
  }

  /**
   * Main Pricing Engine Calculation method
   */
  public static async calculateOrderRate(input: RateCalculationInput): Promise<RateCalculationOutput> {
    const { length, width, height, actualWeight, pickupPincode, dropPincode, orderType, paymentType } = input;

    // 1. Calculate Volumetric and Chargeable Weight
    const volumetricWeight = this.calculateVolumetricWeight(length, width, height);
    const chargeableWeight = parseFloat(Math.max(actualWeight, volumetricWeight).toFixed(2));

    // 2. Zone Detection
    const pickupZone = await this.detectZoneByPincode(pickupPincode);
    const dropZone = await this.detectZoneByPincode(dropPincode);

    // Determine Intra vs Inter zone
    const isIntra = pickupZone && dropZone && pickupZone.id === dropZone.id;
    const zoneType: 'INTRA' | 'INTER' = isIntra ? 'INTRA' : 'INTER';

    // 3. Fetch Admin Configured Rate Card from DB
    const rateCard = await prisma.rateCard.findUnique({
      where: {
        orderType_zoneType: {
          orderType,
          zoneType,
        },
      },
    });

    if (!rateCard) {
      throw new Error(`Rate card configuration missing for Order Type: ${orderType}, Zone Type: ${zoneType}`);
    }

    // 4. Calculate Charges
    const baseCharge = rateCard.baseRate;
    const extraWeight = Math.max(0, chargeableWeight - rateCard.baseWeight);
    const weightCharge = parseFloat((extraWeight * rateCard.perKgRate).toFixed(2));
    
    // Check minimum charge threshold
    const subtotal = Math.max(rateCard.minCharge, baseCharge + weightCharge);

    // 5. COD Surcharge
    const codSurcharge = paymentType === 'COD' ? rateCard.codSurcharge : 0;

    const totalCharge = parseFloat((subtotal + codSurcharge).toFixed(2));

    return {
      volumetricWeight,
      chargeableWeight,
      actualWeight,
      pickupZone: pickupZone ? { id: pickupZone.id, name: pickupZone.name, code: pickupZone.code } : null,
      dropZone: dropZone ? { id: dropZone.id, name: dropZone.name, code: dropZone.code } : null,
      zoneType,
      baseCharge: parseFloat(baseCharge.toFixed(2)),
      weightCharge: parseFloat(weightCharge.toFixed(2)),
      codSurcharge: parseFloat(codSurcharge.toFixed(2)),
      totalCharge,
      appliedRateCard: {
        baseWeight: rateCard.baseWeight,
        baseRate: rateCard.baseRate,
        perKgRate: rateCard.perKgRate,
        minCharge: rateCard.minCharge,
        codSurcharge: rateCard.codSurcharge,
      },
    };
  }
}
