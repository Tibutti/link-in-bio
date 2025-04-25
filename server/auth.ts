import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import { insertUserSchema } from '@shared/schema';
import { z } from 'zod';

// Sekret do podpisu tokenów JWT
const JWT_SECRET = process.env.JWT_SECRET || 'linkbio-dev-secret-key';

// Czas wygaśnięcia tokenu (24 godziny)
const TOKEN_EXPIRY = '24h';

// Generowanie hashu hasła
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Porównanie hasła z hashem
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generowanie tokenu JWT
export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Weryfikacja tokenu JWT
export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch (error) {
    return null;
  }
}

// Middleware uwierzytelniający
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  // Dodaj informacje o użytkowniku do obiektu zapytania
  (req as any).userId = payload.userId;
  // Dodaj również obiekt user z polem userId dla kompatybilności z istniejącym kodem
  (req as any).user = { userId: payload.userId };
  
  next();
}

// Middleware dla opcjonalnej autentykacji
export function optionalAuthentication(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  const payload = verifyToken(token);
  
  if (payload) {
    (req as any).userId = payload.userId;
  }
  
  next();
}

// Schema dla logowania
export const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Schema dla rejestracji
export const registrationSchema = insertUserSchema.extend({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});