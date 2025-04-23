import { Express } from 'express';
import fetch from 'node-fetch';
import { z } from 'zod';
import { storage } from './storage';
import { authenticateToken } from './auth';
import { fetchGitHubContributions } from './githubApi';

const githubUsernameSchema = z.object({
  githubUsername: z.string().min(1, { message: 'GitHub username is required' })
});

export function registerGithubStatsRoutes(app: Express) {
  // Nowy endpoint do pobierania szczegółowych statystyk GitHub
  app.get('/api/github-stats/:username', async (req, res) => {
    try {
      const { username } = req.params;
      
      if (!username) {
        return res.status(400).json({ message: 'GitHub username is required' });
      }

      // Pobieramy podstawowe dane użytkownika z GitHub API
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
      
      if (!userResponse.ok) {
        return res.status(userResponse.status).json({ 
          message: `GitHub API error: ${userResponse.statusText}` 
        });
      }
      
      const userData = await userResponse.json() as any;
      
      // Pobieramy kontrybucje
      const contributions = await fetchGitHubContributions(username);
      
      // Wyliczamy dodatkowe statystyki jeśli mamy dane kontrybucji
      let totalContributions = 0;
      let longestStreak = 0;
      let currentStreak = 0;
      
      if (contributions && contributions.length > 0) {
        // Liczba wszystkich kontrybucji
        totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);
        
        // Aktualny streak
        const sortedContributions = [...contributions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        let streakCount = 0;
        for (const contrib of sortedContributions) {
          if (contrib.count > 0) {
            streakCount++;
          } else {
            break;
          }
        }
        currentStreak = streakCount;
        
        // Najdłuższy streak
        let tempStreak = 0;
        let maxStreak = 0;
        
        for (const contrib of contributions) {
          if (contrib.count > 0) {
            tempStreak++;
            maxStreak = Math.max(maxStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        }
        longestStreak = maxStreak;
      }
      
      // Zwracamy kompletne statystyki
      res.json({
        profile: {
          login: userData.login,
          name: userData.name,
          avatar_url: userData.avatar_url,
          html_url: userData.html_url,
          bio: userData.bio,
          public_repos: userData.public_repos,
          followers: userData.followers,
          following: userData.following,
          created_at: userData.created_at
        },
        stats: {
          totalContributions,
          longestStreak,
          currentStreak
        },
        contributions
      });
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      res.status(500).json({ message: 'Failed to fetch GitHub statistics' });
    }
  });
  
  // Endpoint do aktualizacji nazwy użytkownika GitHub dla profilu
  app.patch('/api/profile/:id/github', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Pobierz profil
      const profile = await storage.getProfile(id);
      
      // Sprawdź czy profil istnieje i należy do zalogowanego użytkownika
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      if (profile.userId !== userId) {
        return res.status(403).json({ message: 'You can only update your own profile' });
      }
      
      // Walidacja danych
      const validData = githubUsernameSchema.parse(req.body);
      
      // Aktualizuj nazwę użytkownika GitHub
      const updatedProfile = await storage.updateProfile(id, { 
        githubUsername: validData.githubUsername 
      });
      
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      console.error('Update GitHub username error:', error);
      res.status(500).json({ message: 'Error updating GitHub username' });
    }
  });
}