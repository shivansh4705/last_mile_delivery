import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role = 'CUSTOMER', phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role,
          phone,
        },
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'Registration successful',
        user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
        token,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error registering user' });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          currentZoneId: user.currentZoneId,
          isAvailable: user.isAvailable,
        },
        token,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error logging in' });
    }
  }

  // Quick Login for Instant Demo Evaluation (Admin, Agent, Customer)
  public static async quickLogin(req: Request, res: Response) {
    try {
      const { role } = req.body;
      const targetRole = role || 'ADMIN';

      const user = await prisma.user.findFirst({
        where: { role: targetRole },
      });

      if (!user) {
        return res.status(404).json({ message: `No demo account found for role ${targetRole}` });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: `Quick login as ${user.role} successful`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          currentZoneId: user.currentZoneId,
          isAvailable: user.isAvailable,
        },
        token,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Quick login failed' });
    }
  }

  public static async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          currentLat: true,
          currentLng: true,
          currentZoneId: true,
          isAvailable: true,
          currentZone: true,
        },
      });

      return res.json({ user });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching user profile' });
    }
  }
}
