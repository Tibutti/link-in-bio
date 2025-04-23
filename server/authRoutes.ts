import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { hashPassword, comparePassword, generateToken, authenticateToken } from './auth';

// Schemat walidacji dla rejestracji
const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

// Schemat walidacji dla logowania
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export function registerAuthRoutes(app: Express) {
  // Rejestracja użytkownika
  app.post('/api/auth/register', async (req, res) => {
    try {
      // Walidacja danych
      const validData = registerSchema.parse(req.body);
      
      // Sprawdź czy użytkownik już istnieje
      const existingUser = await storage.getUserByUsername(validData.username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      // Utwórz użytkownika
      const user = await storage.createUser({
        username: validData.username,
        password: validData.password
      });
      
      // Utwórz profil dla użytkownika
      const profile = await storage.createProfile({
        userId: user.id,
        name: validData.username,
        bio: '',
        location: '',
        imageIndex: 0,
        backgroundIndex: 0,
        githubUsername: null
      });
      
      // Wygeneruj token
      const token = generateToken(user.id);
      
      // Zapisz sesję w bazie danych
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 godziny od teraz
      
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt: expiresAt.toISOString(),
        createdAt: now.toISOString()
      });
      
      // Zwróć dane użytkownika i token
      res.status(201).json({
        user: {
          id: user.id,
          username: user.username
        },
        profile,
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  });
  
  // Logowanie użytkownika
  app.post('/api/auth/login', async (req, res) => {
    try {
      // Walidacja danych
      const validData = loginSchema.parse(req.body);
      
      // Znajdź użytkownika
      const user = await storage.getUserByUsername(validData.username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Sprawdź hasło
      const passwordMatch = await comparePassword(validData.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Wygeneruj token
      const token = generateToken(user.id);
      
      // Zapisz sesję w bazie danych
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 godziny od teraz
      
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt: expiresAt.toISOString(),
        createdAt: now.toISOString()
      });
      
      // Pobierz profil użytkownika
      const profile = await storage.getProfileByUserId(user.id);
      
      // Zwróć dane użytkownika i token
      res.json({
        user: {
          id: user.id,
          username: user.username
        },
        profile,
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in' });
    }
  });
  
  // Wylogowywanie użytkownika
  app.post('/api/auth/logout', authenticateToken, async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (token) {
        // Usuń sesję z bazy danych
        await storage.deleteSessionByToken(token);
      }
      
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Error logging out' });
    }
  });
  
  // Pobieranie aktualnie zalogowanego użytkownika
  app.get('/api/auth/me', authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      
      // Pobierz dane użytkownika
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Pobierz profil użytkownika
      const profile = await storage.getProfileByUserId(userId);
      
      // Zwróć dane użytkownika bez hasła
      res.json({
        user: {
          id: user.id,
          username: user.username
        },
        profile
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Error fetching user data' });
    }
  });
}