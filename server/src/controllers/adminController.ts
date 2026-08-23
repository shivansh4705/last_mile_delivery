import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminController {
  // Get dashboard analytics & statistics
  public static async getDashboardStats(req: Request, res: Response) {
    try {
      const totalOrders = await prisma.order.count();
      const activeDeliveries = await prisma.order.count({
        where: { status: { in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] } },
      });
      const deliveredCount = await prisma.order.count({ where: { status: 'DELIVERED' } });
      const failedCount = await prisma.order.count({ where: { status: 'FAILED' } });
      const rescheduledCount = await prisma.order.count({ where: { status: 'RESCHEDULED' } });

      const totalRevenueResult = await prisma.order.aggregate({
        _sum: { totalCharge: true },
      });
      const totalRevenue = totalRevenueResult._sum.totalCharge || 0;

      const totalAgents = await prisma.user.count({ where: { role: 'AGENT' } });
      const availableAgents = await prisma.user.count({ where: { role: 'AGENT', isAvailable: true } });

      const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
      const totalZones = await prisma.zone.count();

      // Distribution by status
      const statusDistribution = await prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      });

      // Distribution by Order Type (B2B vs B2C)
      const orderTypeDistribution = await prisma.order.groupBy({
        by: ['orderType'],
        _count: { orderType: true },
        _sum: { totalCharge: true },
      });

      return res.json({
        stats: {
          totalOrders,
          activeDeliveries,
          deliveredCount,
          failedCount,
          rescheduledCount,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalAgents,
          availableAgents,
          totalCustomers,
          totalZones,
          statusDistribution,
          orderTypeDistribution,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching dashboard stats' });
    }
  }
}
