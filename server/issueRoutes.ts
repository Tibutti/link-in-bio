import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { authenticateToken } from './auth';
import { storage } from './storage';
import { insertIssueSchema, issueSeverities } from '@shared/schema';

// Schema walidacji dla tworzenia i aktualizacji usterki
const issueCreateSchema = insertIssueSchema.extend({
  title: z.string().min(1, "Tytuł jest wymagany"),
  description: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical'] as const).default("medium"),
});

const issueUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical'] as const).optional(),
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
  isResolved: z.boolean().optional(),
});

export function registerIssueRoutes(app: Express) {
  // Pobierz wszystkie usterki dla profilu
  app.get('/api/profile/:profileId/issues', authenticateToken, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.userId;
      const profileId = parseInt(req.params.profileId);
      
      // Sprawdzenie, czy profil należy do zalogowanego użytkownika
      const profile = await storage.getProfile(profileId);
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ error: "Nie masz uprawnień do oglądania usterek tego profilu" });
      }
      
      const issues = await storage.getIssues(profileId);
      res.json(issues);
    } catch (error: any) {
      console.error('Error fetching issues:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Pobierz konkretną usterkę
  app.get('/api/issues/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.userId;
      const issueId = parseInt(req.params.id);
      
      const issue = await storage.getIssue(issueId);
      if (!issue) {
        return res.status(404).json({ error: "Usterka nie została znaleziona" });
      }
      
      // Sprawdzenie, czy usterka należy do profilu użytkownika
      const profile = await storage.getProfile(issue.profileId);
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ error: "Nie masz uprawnień do oglądania tej usterki" });
      }
      
      res.json(issue);
    } catch (error: any) {
      console.error('Error fetching issue:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Utwórz nową usterkę
  app.post('/api/profile/:profileId/issues', authenticateToken, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.userId;
      const profileId = parseInt(req.params.profileId);
      
      // Sprawdzenie, czy profil należy do zalogowanego użytkownika
      const profile = await storage.getProfile(profileId);
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ error: "Nie masz uprawnień do dodawania usterek do tego profilu" });
      }
      
      // Walidacja danych
      const validatedData = issueCreateSchema.parse({
        ...req.body,
        profileId
      });
      
      const issue = await storage.createIssue(validatedData);
      res.status(201).json(issue);
    } catch (error: any) {
      console.error('Error creating issue:', error);
      if (error.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });
  
  // Aktualizuj usterkę
  app.patch('/api/issues/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.userId;
      const issueId = parseInt(req.params.id);
      
      // Sprawdzenie, czy usterka istnieje
      const issue = await storage.getIssue(issueId);
      if (!issue) {
        return res.status(404).json({ error: "Usterka nie została znaleziona" });
      }
      
      // Sprawdzenie, czy usterka należy do profilu użytkownika
      const profile = await storage.getProfile(issue.profileId);
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ error: "Nie masz uprawnień do aktualizacji tej usterki" });
      }
      
      // Walidacja danych
      const validatedData = issueUpdateSchema.parse(req.body);
      
      const updatedIssue = await storage.updateIssue(issueId, validatedData);
      res.json(updatedIssue);
    } catch (error: any) {
      console.error('Error updating issue:', error);
      if (error.name === 'ZodError') {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });
  
  // Usuń usterkę
  app.delete('/api/issues/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.userId;
      const issueId = parseInt(req.params.id);
      
      // Sprawdzenie, czy usterka istnieje
      const issue = await storage.getIssue(issueId);
      if (!issue) {
        return res.status(404).json({ error: "Usterka nie została znaleziona" });
      }
      
      // Sprawdzenie, czy usterka należy do profilu użytkownika
      const profile = await storage.getProfile(issue.profileId);
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ error: "Nie masz uprawnień do usunięcia tej usterki" });
      }
      
      const deleted = await storage.deleteIssue(issueId);
      if (deleted) {
        res.status(204).end();
      } else {
        res.status(500).json({ error: "Nie udało się usunąć usterki" });
      }
    } catch (error: any) {
      console.error('Error deleting issue:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Oznacz usterkę jako rozwiązaną
  app.post('/api/issues/:id/resolve', authenticateToken, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.userId;
      const issueId = parseInt(req.params.id);
      
      // Sprawdzenie, czy usterka istnieje
      const issue = await storage.getIssue(issueId);
      if (!issue) {
        return res.status(404).json({ error: "Usterka nie została znaleziona" });
      }
      
      // Sprawdzenie, czy usterka należy do profilu użytkownika
      const profile = await storage.getProfile(issue.profileId);
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ error: "Nie masz uprawnień do aktualizacji tej usterki" });
      }
      
      const updatedIssue = await storage.markIssueAsResolved(issueId);
      res.json(updatedIssue);
    } catch (error: any) {
      console.error('Error resolving issue:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Oznacz usterkę jako otwartą
  app.post('/api/issues/:id/reopen', authenticateToken, async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const userId = req.user?.userId;
      const issueId = parseInt(req.params.id);
      
      // Sprawdzenie, czy usterka istnieje
      const issue = await storage.getIssue(issueId);
      if (!issue) {
        return res.status(404).json({ error: "Usterka nie została znaleziona" });
      }
      
      // Sprawdzenie, czy usterka należy do profilu użytkownika
      const profile = await storage.getProfile(issue.profileId);
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ error: "Nie masz uprawnień do aktualizacji tej usterki" });
      }
      
      const updatedIssue = await storage.markIssueAsOpen(issueId);
      res.json(updatedIssue);
    } catch (error: any) {
      console.error('Error reopening issue:', error);
      res.status(500).json({ error: error.message });
    }
  });
}