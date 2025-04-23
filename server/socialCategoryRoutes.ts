import { Express } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { authenticateToken } from './auth';

// Schemat walidacji dla filtrowania linków według kategorii
const categoryFilterSchema = z.object({
  category: z.enum(['social', 'knowledge'])
});

// Schemat walidacji dla zmiany kategorii linku
const updateCategorySchema = z.object({
  category: z.enum(['social', 'knowledge'])
});

export function registerSocialCategoryRoutes(app: Express) {
  // Pobierz linki społecznościowe według kategorii
  app.get('/api/profile/:profileId/social-links/category/:category', async (req, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      
      // Walidacja kategorii
      try {
        categoryFilterSchema.parse({ category: req.params.category });
      } catch (error) {
        return res.status(400).json({ 
          message: 'Invalid category. Must be either "social" or "knowledge"'
        });
      }
      
      const category = req.params.category as 'social' | 'knowledge';
      
      // Pobierz wszystkie linki społecznościowe dla profilu
      const allLinks = await storage.getSocialLinks(profileId);
      
      // Filtruj według kategorii
      const filteredLinks = allLinks.filter(link => link.category === category);
      
      res.json(filteredLinks);
    } catch (error) {
      console.error('Error fetching links by category:', error);
      res.status(500).json({ message: 'Failed to fetch links by category' });
    }
  });
  
  // Zmień kategorię linku społecznościowego
  app.patch('/api/social-links/:id/category', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Pobierz link
      const link = await storage.getSocialLink(id);
      
      if (!link) {
        return res.status(404).json({ message: 'Social link not found' });
      }
      
      // Pobierz profil, do którego należy link
      const profile = await storage.getProfile(link.profileId);
      
      // Sprawdź czy profil istnieje i należy do zalogowanego użytkownika
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      if (profile.userId !== userId) {
        return res.status(403).json({ message: 'You can only update your own links' });
      }
      
      // Walidacja danych
      const validData = updateCategorySchema.parse(req.body);
      
      // Aktualizuj kategorię linku
      const updatedLink = await storage.updateSocialLink(id, { 
        category: validData.category 
      });
      
      res.json(updatedLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      console.error('Update link category error:', error);
      res.status(500).json({ message: 'Error updating link category' });
    }
  });
  
  // Pobierz statystyki linków według kategorii
  app.get('/api/profile/:profileId/social-links/stats', async (req, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      
      // Pobierz wszystkie linki społecznościowe dla profilu
      const allLinks = await storage.getSocialLinks(profileId);
      
      // Zliczaj linki według kategorii
      const socialCount = allLinks.filter(link => link.category === 'social').length;
      const knowledgeCount = allLinks.filter(link => link.category === 'knowledge').length;
      
      res.json({
        total: allLinks.length,
        socialCount,
        knowledgeCount,
        categories: {
          social: socialCount,
          knowledge: knowledgeCount
        }
      });
    } catch (error) {
      console.error('Error fetching link stats:', error);
      res.status(500).json({ message: 'Failed to fetch link statistics' });
    }
  });
}