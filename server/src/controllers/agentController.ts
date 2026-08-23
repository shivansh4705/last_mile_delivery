import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class AgentController {
  // Get all delivery agents (Admin or internal query)
  public static async getAgents(req: AuthRequest, res: Response) {
    try {
      const agents = await prisma.user.findMany({
        where: { role: 'AGENT' },
        include: {
          currentZone: true,
          agentDeliveries: {
            where: {
              status: { in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
            },
            select: { id: true, trackingNumber: true, status: true },
          },
        },
      });
      return res.json({ agents });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching agents' });
    }
  }

  // Update Agent current location and availability status
  public static async updateAgentStatus(req: AuthRequest, res: Response) {
    try {
      const agentId = req.user?.id;
      const { isAvailable, currentLat, currentLng, currentZoneId } = req.body;

      const updatedAgent = await prisma.user.update({
        where: { id: agentId },
        data: {
          isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
          currentLat: currentLat ? parseFloat(currentLat) : undefined,
          currentLng: currentLng ? parseFloat(currentLng) : undefined,
          currentZoneId: currentZoneId || undefined,
        },
        include: { currentZone: true },
      });

      return res.json({ message: 'Agent status & location updated', agent: updatedAgent });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error updating agent status' });
    }
  }
}
