import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ZoneController {
  // Get all zones with associated areas & agents count
  public static async getZones(req: Request, res: Response) {
    try {
      const zones = await prisma.zone.findMany({
        include: {
          areas: true,
          _count: {
            select: { agents: true, pickupOrders: true, dropOrders: true },
          },
        },
        orderBy: { name: 'asc' },
      });
      return res.json({ zones });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching zones' });
    }
  }

  // Create new Zone (Admin only)
  public static async createZone(req: Request, res: Response) {
    try {
      const { name, code, description } = req.body;
      if (!name || !code) {
        return res.status(400).json({ message: 'Zone Name and Code are required.' });
      }

      const existing = await prisma.zone.findFirst({ where: { code: code.toUpperCase() } });
      if (existing) {
        return res.status(400).json({ message: 'Zone with this code already exists.' });
      }

      const zone = await prisma.zone.create({
        data: {
          name,
          code: code.toUpperCase(),
          description,
        },
      });
      return res.status(201).json({ message: 'Zone created successfully', zone });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error creating zone' });
    }
  }

  // Assign area/pincode to Zone (Admin only)
  public static async addAreaToZone(req: Request, res: Response) {
    try {
      const { zoneId } = req.params;
      const { name, pincode, city } = req.body;

      if (!name || !pincode || !city) {
        return res.status(400).json({ message: 'Area name, pincode, and city are required.' });
      }

      const existingArea = await prisma.area.findUnique({ where: { pincode: pincode.trim() } });
      if (existingArea) {
        return res.status(400).json({ message: `Pincode ${pincode} is already mapped to zone: ${existingArea.zoneId}` });
      }

      const area = await prisma.area.create({
        data: {
          name,
          pincode: pincode.trim(),
          city,
          zoneId,
        },
      });

      return res.status(201).json({ message: 'Area added to zone successfully', area });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error adding area to zone' });
    }
  }

  // Delete area mapping
  public static async removeArea(req: Request, res: Response) {
    try {
      const { areaId } = req.params;
      await prisma.area.delete({ where: { id: areaId } });
      return res.json({ message: 'Area mapping deleted' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error deleting area' });
    }
  }
}
