import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Setup optional Nodemailer transporter for email notifications
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
    pass: process.env.SMTP_PASS || 'ethereal_pass',
  },
});

export class NotificationEngine {
  /**
   * Send multi-channel notification (In-App, Email simulation, SMS simulation)
   */
  public static async notifyStatusChange(
    orderId: string,
    newStatus: string,
    actorName: string,
    customMessage?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, agent: true },
    });

    if (!order) return;

    const trackingNum = order.trackingNumber;
    let title = `Order Update: #${trackingNum}`;
    let message = customMessage || `Status updated to ${newStatus} by ${actorName}`;

    switch (newStatus) {
      case 'CREATED':
        title = `Order #${trackingNum} Created`;
        message = `Your order has been registered successfully with total charge $${order.totalCharge.toFixed(2)}.`;
        break;
      case 'ASSIGNED':
        title = `Agent Assigned for #${trackingNum}`;
        message = `Delivery agent ${order.agent?.name || 'an assigned driver'} is preparing for pickup.`;
        break;
      case 'PICKED_UP':
        title = `Parcel Picked Up: #${trackingNum}`;
        message = `Your package has been picked up from ${order.pickupAddress} and is moving to transit.`;
        break;
      case 'IN_TRANSIT':
        title = `In Transit: #${trackingNum}`;
        message = `Your shipment is currently in transit towards the destination hub.`;
        break;
      case 'OUT_FOR_DELIVERY':
        title = `Out for Delivery: #${trackingNum}`;
        message = `Agent ${order.agent?.name || 'Driver'} is out for final delivery to ${order.dropAddress}.`;
        break;
      case 'DELIVERED':
        title = `Parcel Delivered! #${trackingNum}`;
        message = `Your order was successfully delivered. Thank you for shipping with us!`;
        break;
      case 'FAILED':
        title = `⚠️ Delivery Attempt Failed: #${trackingNum}`;
        message = `Delivery attempt failed (${order.failureReason || 'Customer unavailable'}). Please open tracking to reschedule a convenient date.`;
        break;
      case 'RESCHEDULED':
        title = `Delivery Rescheduled: #${trackingNum}`;
        message = `Your delivery has been rescheduled for ${order.deliveryDate?.toLocaleDateString() || 'the selected date'}.`;
        break;
    }

    // 1. Create In-App Notification
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        orderId,
        title,
        message,
        type: 'EMAIL',
      },
    });

    // Also notify agent if relevant
    if (order.agentId) {
      await prisma.notification.create({
        data: {
          userId: order.agentId,
          orderId,
          title: `Order #${trackingNum} Status: ${newStatus}`,
          message: `Status set to ${newStatus}.`,
          type: 'IN_APP',
        },
      });
    }

    // 2. Log Email / SMS dispatch
    console.log(`\n📧 [EMAIL DISPATCHED] To: ${order.customer.email} | Subject: ${title}`);
    console.log(`💬 Body: ${message}`);
    console.log(`📱 [SMS DISPATCHED] To: ${order.customer.phone || 'Customer'} | ${message}\n`);

    // Try sending email via Nodemailer if SMTP configured
    if (process.env.SMTP_USER && process.env.SMTP_USER !== 'ethereal.user@ethereal.email') {
      try {
        await transporter.sendMail({
          from: '"Last-Mile Logistics" <no-reply@lastmile.com>',
          to: order.customer.email,
          subject: title,
          text: message,
          html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #2563eb;">${title}</h2>
            <p style="font-size: 16px; color: #334155;">${message}</p>
            <p style="font-size: 14px; color: #64748b;">Tracking Number: <strong>${trackingNum}</strong></p>
          </div>`,
        });
      } catch (err) {
        console.warn('SMTP Email dispatch skipped or non-blocking:', (err as Error).message);
      }
    }
  }
}
