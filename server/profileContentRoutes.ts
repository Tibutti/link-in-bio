import { Express } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { insertSocialLinkSchema, insertFeaturedContentSchema } from '@shared/schema';
import { authenticateToken, optionalAuthentication } from './auth';

// Schemat walidacji dla zmiany kolejności wyróżnionych treści
const reorderFeaturedContentsSchema = z.object({
  orderedIds: z.array(z.number())
});

export function registerProfileContentRoutes(app: Express) {
  // Pobierz wyróżnione treści dla profilu
  app.get('/api/profile/:profileId/featured-contents', async (req, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      const contents = await storage.getFeaturedContents(profileId);
      res.json(contents);
    } catch (error) {
      console.error('Error fetching featured contents:', error);
      res.status(500).json({ message: 'Failed to fetch featured contents' });
    }
  });

  // Dodaj nowy link społecznościowy do profilu
  app.post('/api/profile/:profileId/social-links', optionalAuthentication, async (req, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      const profile = await storage.getProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      // Walidacja danych
      const validationSchema = insertSocialLinkSchema.omit({ profileId: true });
      const validData = validationSchema.parse(req.body);
      
      // Tworzenie nowego linku z podanym profileId
      const newLink = await storage.createSocialLink({
        ...validData,
        profileId
      });
      
      res.status(201).json(newLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      console.error('Create social link error:', error);
      res.status(500).json({ message: 'Error creating social link' });
    }
  });

  // Dodaj nową wyróżnioną treść do profilu
  app.post('/api/profile/:profileId/featured-contents', optionalAuthentication, async (req, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      const profile = await storage.getProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      // Walidacja danych
      const validationSchema = insertFeaturedContentSchema.omit({ profileId: true });
      const validData = validationSchema.parse(req.body);
      
      // Tworzenie nowej wyróżnionej treści z podanym profileId
      const newContent = await storage.createFeaturedContent({
        ...validData,
        profileId
      });
      
      res.status(201).json(newContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      console.error('Create featured content error:', error);
      res.status(500).json({ message: 'Error creating featured content' });
    }
  });

  // Pobierz pojedynczy link społecznościowy
  app.get('/api/social-links/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const link = await storage.getSocialLink(id);
      
      if (!link) {
        return res.status(404).json({ message: 'Social link not found' });
      }
      
      res.json(link);
    } catch (error) {
      console.error('Error fetching social link:', error);
      res.status(500).json({ message: 'Failed to fetch social link' });
    }
  });

  // Pobierz pojedynczą wyróżnioną treść
  app.get('/api/featured-contents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const content = await storage.getFeaturedContent(id);
      
      if (!content) {
        return res.status(404).json({ message: 'Featured content not found' });
      }
      
      res.json(content);
    } catch (error) {
      console.error('Error fetching featured content:', error);
      res.status(500).json({ message: 'Failed to fetch featured content' });
    }
  });
  
  // Aktualizuj wyróżnioną treść
  app.patch('/api/featured-contents/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const content = await storage.getFeaturedContent(id);
      
      if (!content) {
        return res.status(404).json({ message: 'Featured content not found' });
      }
      
      // Mapuj dane z formularza na dane bazy danych
      const { title, description, linkUrl, imageUrl } = req.body;
      const updatedContent = await storage.updateFeaturedContent(id, {
        title,
        linkUrl,
        imageUrl
      });
      
      res.json(updatedContent);
    } catch (error) {
      console.error('Error updating featured content:', error);
      res.status(500).json({ message: 'Failed to update featured content' });
    }
  });
  
  // Usuń wyróżnioną treść
  app.delete('/api/featured-contents/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const content = await storage.getFeaturedContent(id);
      
      if (!content) {
        return res.status(404).json({ message: 'Featured content not found' });
      }
      
      await storage.deleteFeaturedContent(id);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting featured content:', error);
      res.status(500).json({ message: 'Failed to delete featured content' });
    }
  });
  
  // Aktualizuj link społecznościowy
  app.patch('/api/social-links/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const link = await storage.getSocialLink(id);
      
      if (!link) {
        return res.status(404).json({ message: 'Social link not found' });
      }
      
      const updatedLink = await storage.updateSocialLink(id, req.body);
      res.json(updatedLink);
    } catch (error) {
      console.error('Error updating social link:', error);
      res.status(500).json({ message: 'Failed to update social link' });
    }
  });
  
  // Usuń link społecznościowy
  app.delete('/api/social-links/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const link = await storage.getSocialLink(id);
      
      if (!link) {
        return res.status(404).json({ message: 'Social link not found' });
      }
      
      await storage.deleteSocialLink(id);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting social link:', error);
      res.status(500).json({ message: 'Failed to delete social link' });
    }
  });
  
  // Zmień kolejność wyróżnionych treści
  app.post('/api/profile/:profileId/featured-contents/reorder', authenticateToken, async (req, res) => {
    try {
      const profileId = parseInt(req.params.profileId);
      const userId = (req as any).userId;
      
      // Pobierz profil
      const profile = await storage.getProfile(profileId);
      
      // Sprawdź czy profil istnieje i należy do zalogowanego użytkownika
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      if (profile.userId !== userId) {
        return res.status(403).json({ message: 'You can only reorder your own content' });
      }
      
      // Walidacja danych wejściowych
      const validData = reorderFeaturedContentsSchema.parse(req.body);
      
      // Zmiana kolejności wyróżnionych treści
      const updatedContents = await storage.reorderFeaturedContents(profileId, validData.orderedIds);
      
      res.json(updatedContents);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      console.error('Reorder featured contents error:', error);
      res.status(500).json({ message: 'Error reordering featured contents' });
    }
  });
}