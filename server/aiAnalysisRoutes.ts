import { Express, Request, Response } from 'express';
import { authenticateToken } from './auth';
import { storage } from './storage';
import { z } from 'zod';
import { analyzeIssue } from './perplexityApi';

export function registerAiAnalysisRoutes(app: Express) {
  // Endpoint do analizy jednej usterki przez AI
  app.get('/api/ai/issues/:id/analyze', authenticateToken, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const issue = await storage.getIssue(id);
      
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      const analysis = await analyzeIssue(
        issue.title, 
        issue.description || undefined, 
        issue.severity || undefined
      );
      
      res.json({ 
        issue,
        analysis
      });
    } catch (error: any) {
      console.error('Error analyzing issue:', error);
      res.status(500).json({ message: error.message || "Failed to analyze issue" });
    }
  });

  // Endpoint do pobierania wszystkich usterek i ich statusów
  app.get('/api/ai/issues/summary', authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userProfile = await storage.getProfileByUserId(req.user.userId);
      
      if (!userProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const issues = await storage.getIssues(userProfile.id);
      
      // Oblicz liczby usterek według statusu i priorytetu
      const summary = {
        total: issues.length,
        byStatus: {
          open: issues.filter(i => i.status === 'open').length,
          in_progress: issues.filter(i => i.status === 'in_progress').length,
          resolved: issues.filter(i => i.status === 'resolved').length,
        },
        bySeverity: {
          low: issues.filter(i => i.severity === 'low').length,
          medium: issues.filter(i => i.severity === 'medium').length,
          high: issues.filter(i => i.severity === 'high').length,
          critical: issues.filter(i => i.severity === 'critical').length,
        },
        newestIssues: issues
          .filter(i => i.status !== 'resolved')
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 3),
        oldestIssues: issues
          .filter(i => i.status !== 'resolved')
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateA - dateB;
          })
          .slice(0, 3),
        mostCriticalIssues: issues
          .filter(i => i.status !== 'resolved')
          .sort((a, b) => {
            const severityWeight: Record<string, number> = {
              'critical': 4,
              'high': 3,
              'medium': 2,
              'low': 1
            };
            const valA = a.severity ? severityWeight[a.severity] || 0 : 0;
            const valB = b.severity ? severityWeight[b.severity] || 0 : 0;
            return valB - valA;
          })
          .slice(0, 3)
      };
      
      res.json(summary);
    } catch (error: any) {
      console.error('Error getting issue summary:', error);
      res.status(500).json({ message: error.message || "Failed to get issue summary" });
    }
  });
}