import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Haversine formula to compute distance in km between two lat/lng pairs
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class AssignmentEngine {
  /**
   * Automatically assigns nearest available delivery agent to an order
   */
  public static async autoAssignAgent(orderId: string, actorName = 'Auto-Assignment Engine') {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { pickupZone: true },
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // Fetch all active available delivery agents
    const availableAgents = await prisma.user.findMany({
      where: {
        role: 'AGENT',
        isAvailable: true,
      },
      include: {
        agentDeliveries: {
          where: {
            status: { in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
          },
        },
      },
    });

    if (availableAgents.length === 0) {
      // Mark as pending assignment if no agent available
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PENDING_ASSIGNMENT' },
      });
      return { success: false, message: 'No available delivery agents found. Order set to PENDING_ASSIGNMENT.' };
    }

    // Score & Rank agents:
    // 1. Same zone match bonus
    // 2. Proximity distance (if coordinates exist)
    // 3. Current active workload
    let bestAgent = availableAgents[0];
    let minScore = Infinity;

    for (const agent of availableAgents) {
      const activeWorkload = agent.agentDeliveries.length;
      let distanceKm = 10; // Default distance penalty if coordinates missing

      if (agent.currentLat && agent.currentLng && order.pickupLat && order.pickupLng) {
        distanceKm = haversineDistance(agent.currentLat, agent.currentLng, order.pickupLat, order.pickupLng);
      }

      const isSameZone = order.pickupZoneId && agent.currentZoneId === order.pickupZoneId;
      const zoneBonus = isSameZone ? -5 : 0; // Bonus score for zone match

      // Composite score: lower is better
      const score = distanceKm + activeWorkload * 3 + zoneBonus;

      if (score < minScore) {
        minScore = score;
        bestAgent = agent;
      }
    }

    // Assign order to selected best agent
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        agentId: bestAgent.id,
        status: 'ASSIGNED',
      },
    });

    // Record immutable tracking history entry
    await prisma.orderTrackingHistory.create({
      data: {
        orderId,
        status: 'ASSIGNED',
        actorId: bestAgent.id,
        actorRole: 'SYSTEM',
        actorName,
        notes: `Intelligently assigned to agent ${bestAgent.name} (Zone: ${order.pickupZone?.name || 'Standard Zone'}, Active Workload: ${bestAgent.agentDeliveries.length})`,
      },
    });

    // Create Notification for agent and customer
    await prisma.notification.create({
      data: {
        userId: bestAgent.id,
        orderId,
        title: 'New Delivery Assignment',
        message: `Order #${order.trackingNumber} has been assigned to you for pickup at ${order.pickupAddress}`,
        type: 'IN_APP',
      },
    });

    await prisma.notification.create({
      data: {
        userId: order.customerId,
        orderId,
        title: 'Agent Assigned to Your Order',
        message: `Delivery agent ${bestAgent.name} (${bestAgent.phone || 'Available via app'}) has been assigned to your shipment #${order.trackingNumber}`,
        type: 'EMAIL',
      },
    });

    return {
      success: true,
      agent: {
        id: bestAgent.id,
        name: bestAgent.name,
        phone: bestAgent.phone,
      },
      order: updatedOrder,
    };
  }
}
