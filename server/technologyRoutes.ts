import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { authenticateToken } from "./auth";
import { z } from "zod";
import { insertTechnologySchema, technologyCategories } from "@shared/schema";

const technologyParamsSchema = z.object({
  id: z.coerce.number(),
});

const profileIdParamsSchema = z.object({
  profileId: z.coerce.number(),
});

const categoryParamsSchema = z.object({
  profileId: z.coerce.number(),
  category: z.enum(technologyCategories),
});

const reorderBodySchema = z.object({
  orderedIds: z.array(z.number()),
});

export function registerTechnologyRoutes(app: Express) {
  // Pobierz wszystkie technologie dla profilu
  app.get('/api/profile/:profileId/technologies', async (req: Request, res: Response) => {
    try {
      const { profileId } = profileIdParamsSchema.parse(req.params);
      const technologies = await storage.getTechnologies(profileId);
      res.json(technologies);
    } catch (error) {
      console.error('Error getting technologies:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Pobierz technologie według kategorii
  app.get('/api/profile/:profileId/technologies/category/:category', async (req: Request, res: Response) => {
    try {
      const { profileId, category } = categoryParamsSchema.parse(req.params);
      const technologies = await storage.getTechnologiesByCategory(profileId, category);
      res.json(technologies);
    } catch (error) {
      console.error('Error getting technologies by category:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Pobierz pojedynczą technologię
  app.get('/api/technologies/:id', async (req: Request, res: Response) => {
    try {
      const { id } = technologyParamsSchema.parse(req.params);
      const technology = await storage.getTechnology(id);
      
      if (!technology) {
        return res.status(404).json({ error: 'Technology not found' });
      }
      
      res.json(technology);
    } catch (error) {
      console.error('Error getting technology:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Dodaj nową technologię (wymaga autoryzacji)
  app.post('/api/profile/:profileId/technologies', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { profileId } = profileIdParamsSchema.parse(req.params);
      
      // Sprawdź, czy profil należy do zalogowanego użytkownika
      const profile = await storage.getProfile(profileId);
      if (!profile || profile.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Unauthorized access to profile' });
      }
      
      const technologyData = insertTechnologySchema.parse({ ...req.body, profileId });
      const technology = await storage.createTechnology(technologyData);
      res.status(201).json(technology);
    } catch (error) {
      console.error('Error creating technology:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Aktualizuj technologię (wymaga autoryzacji)
  app.patch('/api/technologies/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = technologyParamsSchema.parse(req.params);
      
      // Pobierz technologię, aby sprawdzić czy należy do profilu zalogowanego użytkownika
      const technology = await storage.getTechnology(id);
      if (!technology) {
        return res.status(404).json({ error: 'Technology not found' });
      }
      
      const profile = await storage.getProfile(technology.profileId);
      if (!profile || profile.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Unauthorized access to technology' });
      }
      
      const updatedTechnology = await storage.updateTechnology(id, req.body);
      res.json(updatedTechnology);
    } catch (error) {
      console.error('Error updating technology:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Usuń technologię (wymaga autoryzacji)
  app.delete('/api/technologies/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = technologyParamsSchema.parse(req.params);
      
      // Pobierz technologię, aby sprawdzić czy należy do profilu zalogowanego użytkownika
      const technology = await storage.getTechnology(id);
      if (!technology) {
        return res.status(404).json({ error: 'Technology not found' });
      }
      
      const profile = await storage.getProfile(technology.profileId);
      if (!profile || profile.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Unauthorized access to technology' });
      }
      
      const success = await storage.deleteTechnology(id);
      
      if (success) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: 'Technology not found' });
      }
    } catch (error) {
      console.error('Error deleting technology:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Zmień kolejność technologii (wymaga autoryzacji)
  app.post('/api/profile/:profileId/technologies/category/:category/reorder', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { profileId, category } = categoryParamsSchema.parse(req.params);
      const { orderedIds } = reorderBodySchema.parse(req.body);
      
      // Sprawdź, czy profil należy do zalogowanego użytkownika
      const profile = await storage.getProfile(profileId);
      if (!profile || profile.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Unauthorized access to profile' });
      }
      
      const reorderedTechnologies = await storage.reorderTechnologies(profileId, category, orderedIds);
      res.json(reorderedTechnologies);
    } catch (error) {
      console.error('Error reordering technologies:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  });
}