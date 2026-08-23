import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { RateEngine } from '../services/rateEngine';

const prisma = new PrismaClient();

export class RateCardController {
  // Fetch all rate cards (Intra and Inter for B2B & B2C)
  public static async getRateCards(req: Request, res: Response) {
    try {
      const rateCards = await prisma.rateCard.findMany({
        orderBy: [{ orderType: 'asc' }, { zoneType: 'asc' }],
      });
      return res.json({ rateCards });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching rate cards' });
    }
  }

  // Update Rate Card rules dynamically (Admin only)
  public static async updateRateCard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { baseWeight, baseRate, perKgRate, minCharge, codSurcharge } = req.body;

      const rateCard = await prisma.rateCard.update({
        where: { id },
        data: {
          baseWeight: parseFloat(baseWeight),
          baseRate: parseFloat(baseRate),
          perKgRate: parseFloat(perKgRate),
          minCharge: parseFloat(minCharge),
          codSurcharge: parseFloat(codSurcharge),
        },
      });

      return res.json({ message: 'Rate card updated successfully', rateCard });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error updating rate card' });
    }
  }

  // Calculate live rate preview for frontend order creation modal
  public static async calculateRatePreview(req: Request, res: Response) {
    try {
      const {
        length,
        width,
        height,
        actualWeight,
        pickupPincode,
        dropPincode,
        orderType = 'B2C',
        paymentType = 'PREPAID',
      } = req.body;

      if (!length || !width || !height || !actualWeight || !pickupPincode || !dropPincode) {
        return res.status(400).json({
          message: 'Package dimensions (L, W, H), actual weight, pickup pincode, and drop pincode are required.',
        });
      }

      const calculation = await RateEngine.calculateOrderRate({
        length: parseFloat(length),
        width: parseFloat(width),
        height: parseFloat(height),
        actualWeight: parseFloat(actualWeight),
        pickupPincode,
        dropPincode,
        orderType,
        paymentType,
      });

      return res.json({ success: true, calculation });
    } catch (err: any) {
      return res.status(400).json({ message: err.message || 'Rate calculation failed' });
    }
  }
}
