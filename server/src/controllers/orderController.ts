import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { RateEngine } from '../services/rateEngine';
import { AssignmentEngine } from '../services/assignmentEngine';
import { NotificationEngine } from '../services/notificationEngine';

const prisma = new PrismaClient();

export class OrderController {
  // 1. Create Order (Customer or Admin on behalf of Customer)
  public static async createOrder(req: AuthRequest, res: Response) {
    try {
      const {
        customerId, // Provided if Admin creates on customer's behalf, else req.user.id
        orderType = 'B2C',
        paymentType = 'PREPAID',
        pickupAddress,
        pickupPincode,
        dropAddress,
        dropPincode,
        length,
        width,
        height,
        actualWeight,
        deliveryDate,
        scheduledSlot,
        autoAssign = true,
      } = req.body;

      const targetCustomerId = req.user?.role === 'ADMIN' && customerId ? customerId : req.user?.id;

      if (!targetCustomerId) {
        return res.status(400).json({ message: 'Customer ID is required.' });
      }

      if (!pickupAddress || !pickupPincode || !dropAddress || !dropPincode || !length || !width || !height || !actualWeight) {
        return res.status(400).json({ message: 'All pickup/drop addresses, pincodes, dimensions, and actual weight are required.' });
      }

      // Calculate rates dynamically using Rate Engine
      const rateCalc = await RateEngine.calculateOrderRate({
        length: parseFloat(length),
        width: parseFloat(width),
        height: parseFloat(height),
        actualWeight: parseFloat(actualWeight),
        pickupPincode,
        dropPincode,
        orderType,
        paymentType,
      });

      // Generate Unique Tracking Number
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      const trackingNumber = `TRK-${randomCode}-${orderType}`;

      const order = await prisma.order.create({
        data: {
          trackingNumber,
          customerId: targetCustomerId,
          orderType,
          paymentType,
          pickupAddress,
          pickupPincode,
          pickupZoneId: rateCalc.pickupZone?.id || null,
          dropAddress,
          dropPincode,
          dropZoneId: rateCalc.dropZone?.id || null,
          length: parseFloat(length),
          width: parseFloat(width),
          height: parseFloat(height),
          actualWeight: parseFloat(actualWeight),
          volumetricWeight: rateCalc.volumetricWeight,
          chargeableWeight: rateCalc.chargeableWeight,
          baseCharge: rateCalc.baseCharge,
          weightCharge: rateCalc.weightCharge,
          codSurcharge: rateCalc.codSurcharge,
          totalCharge: rateCalc.totalCharge,
          status: 'CREATED',
          deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(Date.now() + 86400000),
          scheduledSlot: scheduledSlot || '09:00 AM - 05:00 PM',
        },
      });

      // Log Immutable Tracking History for Creation
      await prisma.orderTrackingHistory.create({
        data: {
          orderId: order.id,
          status: 'CREATED',
          actorId: req.user?.id,
          actorRole: req.user?.role || 'CUSTOMER',
          actorName: req.user?.name || 'Customer',
          notes: `Order created with ${paymentType} payment. Total charge: $${rateCalc.totalCharge.toFixed(2)} (Chargeable weight: ${rateCalc.chargeableWeight}kg)`,
        },
      });

      // Trigger Notification
      await NotificationEngine.notifyStatusChange(order.id, 'CREATED', req.user?.name || 'Customer');

      // Trigger Auto-Assignment if requested
      if (autoAssign) {
        await AssignmentEngine.autoAssignAgent(order.id, 'System Auto-Assignment');
      }

      const freshOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          agent: { select: { id: true, name: true, phone: true } },
          pickupZone: true,
          dropZone: true,
          trackingHistory: { orderBy: { createdAt: 'desc' } },
        },
      });

      return res.status(201).json({
        message: 'Order created successfully',
        order: freshOrder,
        rateBreakdown: rateCalc,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error creating order' });
    }
  }

  // 2. Fetch Orders (Role specific with Admin filtering by status/zone/agent)
  public static async getOrders(req: AuthRequest, res: Response) {
    try {
      const { status, zoneId, agentId, customerId, search } = req.query;

      const where: any = {};

      // Filter by role scope
      if (req.user?.role === 'CUSTOMER') {
        where.customerId = req.user.id;
      } else if (req.user?.role === 'AGENT') {
        where.agentId = req.user.id;
      }

      // Admin Filters
      if (status) where.status = String(status);
      if (zoneId) {
        where.OR = [
          { pickupZoneId: String(zoneId) },
          { dropZoneId: String(zoneId) },
        ];
      }
      if (agentId) where.agentId = String(agentId);
      if (customerId && req.user?.role === 'ADMIN') where.customerId = String(customerId);

      if (search) {
        where.OR = [
          { trackingNumber: { contains: String(search) } },
          { pickupAddress: { contains: String(search) } },
          { dropAddress: { contains: String(search) } },
        ];
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          agent: { select: { id: true, name: true, phone: true, isAvailable: true } },
          pickupZone: true,
          dropZone: true,
          trackingHistory: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ orders });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching orders' });
    }
  }

  // 3. Get single order details with full tracking timeline & notifications
  public static async getOrderDetails(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const order = await prisma.order.findFirst({
        where: {
          OR: [{ id }, { trackingNumber: id }],
        },
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          agent: { select: { id: true, name: true, phone: true } },
          pickupZone: true,
          dropZone: true,
          trackingHistory: { orderBy: { createdAt: 'asc' } },
          notifications: { orderBy: { createdAt: 'desc' } },
        },
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      return res.json({ order });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching order details' });
    }
  }

  // 4. Update Order Status (Agent or Admin)
  public static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, location, notes, failureReason } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'New status is required.' });
      }

      if (status === 'FAILED' && !failureReason) {
        return res.status(400).json({ message: 'Failure reason is required when marking order as FAILED.' });
      }

      const existingOrder = await prisma.order.findUnique({ where: { id } });
      if (!existingOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status,
          failureReason: status === 'FAILED' ? failureReason : existingOrder.failureReason,
        },
      });

      // Immutable tracking audit log
      await prisma.orderTrackingHistory.create({
        data: {
          orderId: id,
          status,
          actorId: req.user?.id,
          actorRole: req.user?.role || 'SYSTEM',
          actorName: req.user?.name || 'System',
          location: location || 'Transit Point',
          notes: notes || (status === 'FAILED' ? `Delivery attempt failed: ${failureReason}` : `Status updated to ${status}`),
        },
      });

      // Notify Customer & Log Email/SMS
      await NotificationEngine.notifyStatusChange(id, status, req.user?.name || 'Delivery Agent', notes);

      return res.json({ message: `Order status updated to ${status}`, order: updatedOrder });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error updating order status' });
    }
  }

  // 5. Customer Reschedule Failed Delivery
  public static async rescheduleOrder(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { deliveryDate, scheduledSlot, notes } = req.body;

      if (!deliveryDate) {
        return res.status(400).json({ message: 'New delivery date is required for rescheduling.' });
      }

      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          status: 'RESCHEDULED',
          deliveryDate: new Date(deliveryDate),
          scheduledSlot: scheduledSlot || order.scheduledSlot,
        },
      });

      // Immutable log entry
      await prisma.orderTrackingHistory.create({
        data: {
          orderId: id,
          status: 'RESCHEDULED',
          actorId: req.user?.id,
          actorRole: req.user?.role || 'CUSTOMER',
          actorName: req.user?.name || 'Customer',
          notes: `Rescheduled by customer for ${new Date(deliveryDate).toLocaleDateString()}. Slot: ${scheduledSlot || 'Default'}. Notes: ${notes || 'None'}`,
        },
      });

      // Trigger Agent Re-assignment
      await AssignmentEngine.autoAssignAgent(id, 'Reschedule Re-assignment');

      // Dispatch Notification
      await NotificationEngine.notifyStatusChange(id, 'RESCHEDULED', req.user?.name || 'Customer');

      return res.json({ message: 'Order rescheduled successfully and reassigned to delivery agent.', order: updatedOrder });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error rescheduling order' });
    }
  }

  // 6. Manual or Auto Agent Assignment (Admin)
  public static async assignAgent(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { agentId, auto = false } = req.body;

      if (auto) {
        const result = await AssignmentEngine.autoAssignAgent(id, req.user?.name || 'Admin');
        return res.json(result);
      }

      if (!agentId) {
        return res.status(400).json({ message: 'Agent ID is required for manual assignment.' });
      }

      const agent = await prisma.user.findUnique({ where: { id: agentId } });
      if (!agent || agent.role !== 'AGENT') {
        return res.status(400).json({ message: 'Invalid delivery agent selected.' });
      }

      const order = await prisma.order.update({
        where: { id },
        data: {
          agentId,
          status: 'ASSIGNED',
        },
      });

      await prisma.orderTrackingHistory.create({
        data: {
          orderId: id,
          status: 'ASSIGNED',
          actorId: req.user?.id,
          actorRole: req.user?.role || 'ADMIN',
          actorName: req.user?.name || 'Admin',
          notes: `Manually assigned to delivery agent ${agent.name}`,
        },
      });

      await NotificationEngine.notifyStatusChange(id, 'ASSIGNED', req.user?.name || 'Admin');

      return res.json({ message: `Assigned agent ${agent.name} to order`, order });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error assigning agent' });
    }
  }

  // 7. Admin Status Override
  public static async overrideStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'Status is required for override.' });
      }

      const order = await prisma.order.update({
        where: { id },
        data: { status },
      });

      await prisma.orderTrackingHistory.create({
        data: {
          orderId: id,
          status,
          actorId: req.user?.id,
          actorRole: 'ADMIN',
          actorName: req.user?.name || 'Admin',
          notes: `[ADMIN OVERRIDE] ${notes || 'Status administrative force update'}`,
        },
      });

      await NotificationEngine.notifyStatusChange(id, status, `Admin (${req.user?.name})`, notes);

      return res.json({ message: `Order status administratively updated to ${status}`, order });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error overriding order status' });
    }
  }
}
