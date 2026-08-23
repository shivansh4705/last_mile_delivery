import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing tables
  await prisma.notification.deleteMany();
  await prisma.orderTrackingHistory.deleteMany();
  await prisma.order.deleteMany();
  await prisma.rateCard.deleteMany();
  await prisma.area.deleteMany();
  await prisma.user.deleteMany();
  await prisma.zone.deleteMany();

  // 1. Create Zones
  const zoneNorth = await prisma.zone.create({
    data: {
      name: 'North Metro Zone',
      code: 'ZONE-NORTH',
      description: 'Capital region, Delhi NCR and northern territories',
    },
  });

  const zoneSouth = await prisma.zone.create({
    data: {
      name: 'South Tech Hub',
      code: 'ZONE-SOUTH',
      description: 'Tech corridors including Bengaluru and Southern hubs',
    },
  });

  const zoneWest = await prisma.zone.create({
    data: {
      name: 'West Commercial Zone',
      code: 'ZONE-WEST',
      description: 'Financial hub, Mumbai Metropolitan region',
    },
  });

  const zoneEast = await prisma.zone.create({
    data: {
      name: 'East Logistics Park',
      code: 'ZONE-EAST',
      description: 'Eastern port logistics and industrial corridor',
    },
  });

  console.log('✅ Created 4 Zones');

  // 2. Create Areas with Pincodes
  const areasData = [
    // North Zone
    { name: 'Connaught Place', pincode: '110001', city: 'Delhi', zoneId: zoneNorth.id },
    { name: 'Daryaganj', pincode: '110002', city: 'Delhi', zoneId: zoneNorth.id },
    { name: 'Okhla Industrial Area', pincode: '110020', city: 'Delhi', zoneId: zoneNorth.id },
    { name: 'Gurugram Cyber City', pincode: '122002', city: 'Gurugram', zoneId: zoneNorth.id },

    // South Zone
    { name: 'MG Road Central', pincode: '560001', city: 'Bengaluru', zoneId: zoneSouth.id },
    { name: 'Indiranagar Hub', pincode: '560038', city: 'Bengaluru', zoneId: zoneSouth.id },
    { name: 'Electronic City Phase 1', pincode: '560100', city: 'Bengaluru', zoneId: zoneSouth.id },
    { name: 'Whitefield IT Park', pincode: '560066', city: 'Bengaluru', zoneId: zoneSouth.id },

    // West Zone
    { name: 'Fort Business District', pincode: '400001', city: 'Mumbai', zoneId: zoneWest.id },
    { name: 'Bandra West Suburb', pincode: '400050', city: 'Mumbai', zoneId: zoneWest.id },
    { name: 'Powai Knowledge Park', pincode: '400076', city: 'Mumbai', zoneId: zoneWest.id },

    // East Zone
    { name: 'BBD Bagh Commercial', pincode: '700001', city: 'Kolkata', zoneId: zoneEast.id },
    { name: 'Salt Lake Sector V', pincode: '700091', city: 'Kolkata', zoneId: zoneEast.id },
    { name: 'New Town Logistics', pincode: '700156', city: 'Kolkata', zoneId: zoneEast.id },
  ];

  for (const area of areasData) {
    await prisma.area.create({ data: area });
  }
  console.log(`✅ Created ${areasData.length} Area Pincode mappings`);

  // 3. Create Configurable Rate Cards
  const rateCardsData = [
    {
      orderType: 'B2C',
      zoneType: 'INTRA',
      baseWeight: 1.0,  // 1 kg
      baseRate: 5.0,    // $5.00 base rate
      perKgRate: 1.5,   // $1.50 per additional kg
      minCharge: 5.0,   // $5.00 minimum
      codSurcharge: 2.0 // $2.00 COD fee
    },
    {
      orderType: 'B2C',
      zoneType: 'INTER',
      baseWeight: 1.0,  // 1 kg
      baseRate: 12.0,   // $12.00 base rate
      perKgRate: 3.0,   // $3.00 per additional kg
      minCharge: 12.0,
      codSurcharge: 3.5 // $3.50 COD fee
    },
    {
      orderType: 'B2B',
      zoneType: 'INTRA',
      baseWeight: 5.0,  // 5 kg
      baseRate: 18.0,   // $18.00 base rate
      perKgRate: 1.0,   // $1.00 per additional kg
      minCharge: 18.0,
      codSurcharge: 5.0 // $5.00 COD fee
    },
    {
      orderType: 'B2B',
      zoneType: 'INTER',
      baseWeight: 5.0,  // 5 kg
      baseRate: 40.0,   // $40.00 base rate
      perKgRate: 2.2,   // $2.20 per additional kg
      minCharge: 40.0,
      codSurcharge: 10.0 // $10.00 COD fee
    },
  ];

  for (const rc of rateCardsData) {
    await prisma.rateCard.create({ data: rc });
  }
  console.log('✅ Created Rate Cards for B2B & B2C (Intra & Inter)');

  // 4. Create Users (Admin, Agents, Customers)
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Operations Admin',
      email: 'admin@delivery.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+1-800-555-0199',
    },
  });

  const agentNorth = await prisma.user.create({
    data: {
      name: 'Vikram Singh (Agent North)',
      email: 'agent.north@delivery.com',
      password: hashedPassword,
      role: 'AGENT',
      phone: '+91-98765-43210',
      currentLat: 28.6139,
      currentLng: 77.2090,
      currentZoneId: zoneNorth.id,
      isAvailable: true,
    },
  });

  const agentSouth = await prisma.user.create({
    data: {
      name: 'Priya Sharma (Agent South)',
      email: 'agent.south@delivery.com',
      password: hashedPassword,
      role: 'AGENT',
      phone: '+91-98765-43211',
      currentLat: 12.9716,
      currentLng: 77.5946,
      currentZoneId: zoneSouth.id,
      isAvailable: true,
    },
  });

  const agentWest = await prisma.user.create({
    data: {
      name: 'Rahul Mehta (Agent West)',
      email: 'agent.west@delivery.com',
      password: hashedPassword,
      role: 'AGENT',
      phone: '+91-98765-43212',
      currentLat: 19.0760,
      currentLng: 72.8777,
      currentZoneId: zoneWest.id,
      isAvailable: true,
    },
  });

  const customerB2C = await prisma.user.create({
    data: {
      name: 'John Doe (B2C Customer)',
      email: 'john.b2c@customer.com',
      password: hashedPassword,
      role: 'CUSTOMER',
      phone: '+1-555-0144',
    },
  });

  const customerB2B = await prisma.user.create({
    data: {
      name: 'Acme Logistics Enterprise',
      email: 'acme.b2b@enterprise.com',
      password: hashedPassword,
      role: 'CUSTOMER',
      phone: '+1-555-0188',
    },
  });

  console.log('✅ Created Admin, 3 Delivery Agents, and 2 Customers');

  // 5. Create Initial Seed Orders
  const order1 = await prisma.order.create({
    data: {
      trackingNumber: 'TRK-9001-B2C',
      customerId: customerB2C.id,
      agentId: agentNorth.id,
      orderType: 'B2C',
      paymentType: 'COD',
      pickupAddress: 'Block B, Connaught Place, New Delhi',
      pickupPincode: '110001',
      pickupZoneId: zoneNorth.id,
      pickupLat: 28.6315,
      pickupLng: 77.2167,
      dropAddress: 'Sector 4, Okhla Industrial Area, New Delhi',
      dropPincode: '110020',
      dropZoneId: zoneNorth.id,
      dropLat: 28.5355,
      dropLng: 77.2711,
      length: 30,
      width: 20,
      height: 15,
      actualWeight: 1.2,
      volumetricWeight: (30 * 20 * 15) / 5000, // 1.8 kg
      chargeableWeight: 1.8,
      baseCharge: 5.0,
      weightCharge: (1.8 - 1.0) * 1.5, // 0.8 * 1.5 = $1.20
      codSurcharge: 2.0,
      totalCharge: 5.0 + 1.2 + 2.0, // $8.20
      status: 'IN_TRANSIT',
      deliveryDate: new Date(Date.now() + 86400000),
      scheduledSlot: '10:00 AM - 02:00 PM',
    },
  });

  await prisma.orderTrackingHistory.createMany({
    data: [
      {
        orderId: order1.id,
        status: 'CREATED',
        actorId: customerB2C.id,
        actorRole: 'CUSTOMER',
        actorName: customerB2C.name,
        notes: 'Order placed by customer via web portal',
      },
      {
        orderId: order1.id,
        status: 'ASSIGNED',
        actorId: admin.id,
        actorRole: 'SYSTEM',
        actorName: 'Auto-Assignment Engine',
        notes: `Assigned to nearest available agent ${agentNorth.name} (Zone: ${zoneNorth.name})`,
      },
      {
        orderId: order1.id,
        status: 'PICKED_UP',
        actorId: agentNorth.id,
        actorRole: 'AGENT',
        actorName: agentNorth.name,
        location: 'Connaught Place Pickup Hub',
        notes: 'Package inspected and loaded into delivery vehicle',
      },
      {
        orderId: order1.id,
        status: 'IN_TRANSIT',
        actorId: agentNorth.id,
        actorRole: 'AGENT',
        actorName: agentNorth.name,
        location: 'Outer Ring Road Expressway',
        notes: 'En route to destination delivery center',
      },
    ],
  });

  const order2 = await prisma.order.create({
    data: {
      trackingNumber: 'TRK-9002-B2B',
      customerId: customerB2B.id,
      agentId: agentSouth.id,
      orderType: 'B2B',
      paymentType: 'PREPAID',
      pickupAddress: 'MG Road Commerce Tower, Bengaluru',
      pickupPincode: '560001',
      pickupZoneId: zoneSouth.id,
      dropAddress: 'Sector V, Salt Lake City, Kolkata',
      dropPincode: '700091',
      dropZoneId: zoneEast.id,
      length: 50,
      width: 40,
      height: 30,
      actualWeight: 10.0,
      volumetricWeight: (50 * 40 * 30) / 5000, // 12.0 kg
      chargeableWeight: 12.0,
      baseCharge: 40.0,
      weightCharge: (12.0 - 5.0) * 2.2, // 7 * 2.2 = $15.40
      codSurcharge: 0.0,
      totalCharge: 40.0 + 15.4, // $55.40
      status: 'OUT_FOR_DELIVERY',
      deliveryDate: new Date(),
      scheduledSlot: '02:00 PM - 06:00 PM',
    },
  });

  await prisma.orderTrackingHistory.createMany({
    data: [
      {
        orderId: order2.id,
        status: 'CREATED',
        actorId: customerB2B.id,
        actorRole: 'CUSTOMER',
        actorName: customerB2B.name,
        notes: 'Bulk commercial order placed',
      },
      {
        orderId: order2.id,
        status: 'ASSIGNED',
        actorId: agentSouth.id,
        actorRole: 'AGENT',
        actorName: agentSouth.name,
        notes: 'Assigned agent for express inter-zone transit',
      },
      {
        orderId: order2.id,
        status: 'OUT_FOR_DELIVERY',
        actorId: agentSouth.id,
        actorRole: 'AGENT',
        actorName: agentSouth.name,
        notes: 'Agent out for final delivery attempt',
      },
    ],
  });

  // Order 3: Failed delivery order waiting for reschedule
  const order3 = await prisma.order.create({
    data: {
      trackingNumber: 'TRK-9003-FAILED',
      customerId: customerB2C.id,
      agentId: agentWest.id,
      orderType: 'B2C',
      paymentType: 'COD',
      pickupAddress: 'Bandra West Shopping Hub, Mumbai',
      pickupPincode: '400050',
      pickupZoneId: zoneWest.id,
      dropAddress: 'Powai Hiranandani Complex, Mumbai',
      dropPincode: '400076',
      dropZoneId: zoneWest.id,
      length: 25,
      width: 20,
      height: 10,
      actualWeight: 2.0,
      volumetricWeight: 1.0,
      chargeableWeight: 2.0,
      baseCharge: 5.0,
      weightCharge: (2.0 - 1.0) * 1.5,
      codSurcharge: 2.0,
      totalCharge: 8.5,
      status: 'FAILED',
      failureReason: 'Customer premises locked / Customer unavailable',
      deliveryDate: new Date(Date.now() - 86400000),
    },
  });

  await prisma.orderTrackingHistory.createMany({
    data: [
      {
        orderId: order3.id,
        status: 'CREATED',
        actorId: customerB2C.id,
        actorRole: 'CUSTOMER',
        actorName: customerB2C.name,
        notes: 'Order submitted',
      },
      {
        orderId: order3.id,
        status: 'OUT_FOR_DELIVERY',
        actorId: agentWest.id,
        actorRole: 'AGENT',
        actorName: agentWest.name,
        notes: 'Dispatched for delivery',
      },
      {
        orderId: order3.id,
        status: 'FAILED',
        actorId: agentWest.id,
        actorRole: 'AGENT',
        actorName: agentWest.name,
        notes: 'Attempt failed: Customer premises locked. Notification dispatched to customer for rescheduling.',
      },
    ],
  });

  console.log('✅ Created 3 sample Orders with complete Tracking Timelines');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
