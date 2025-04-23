import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertSocialLinkSchema, insertFeaturedContentSchema, insertGithubContributionSchema, type ContributionData } from "@shared/schema";
import { z } from "zod";
import fetch from "node-fetch";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get profile data and all associated content
  app.get("/api/profile", async (req, res) => {
    try {
      // In a real app, we would get the user from the session
      // Here we're just getting the demo user's profile
      const profile = await storage.getProfileByUserId(1);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const socialLinks = await storage.getSocialLinks(profile.id);
      const featuredContents = await storage.getFeaturedContents(profile.id);
      const githubContributions = await storage.getGithubContributions(profile.id);
      
      res.json({
        profile,
        socialLinks,
        featuredContents,
        githubContributions
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  // Update profile
  app.patch("/api/profile/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profile = await storage.getProfile(id);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const updateSchema = insertProfileSchema.partial();
      const validData = updateSchema.parse(req.body);
      
      const updatedProfile = await storage.updateProfile(id, validData);
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Update profile image
  app.patch("/api/profile/:id/image", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schema = z.object({ imageIndex: z.number().min(0).max(2) });
      const { imageIndex } = schema.parse(req.body);
      
      const profile = await storage.getProfile(id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const updatedProfile = await storage.updateProfile(id, { imageIndex });
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile image" });
    }
  });

  // Update background
  app.patch("/api/profile/:id/background", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schema = z.object({ backgroundIndex: z.number().min(0).max(1) });
      const { backgroundIndex } = schema.parse(req.body);
      
      const profile = await storage.getProfile(id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const updatedProfile = await storage.updateProfile(id, { backgroundIndex });
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update background" });
    }
  });

  // Add social link
  app.post("/api/social-links", async (req, res) => {
    try {
      const validData = insertSocialLinkSchema.parse(req.body);
      const newLink = await storage.createSocialLink(validData);
      res.status(201).json(newLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create social link" });
    }
  });

  // Update social link
  app.patch("/api/social-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const link = await storage.getSocialLink(id);
      
      if (!link) {
        return res.status(404).json({ message: "Social link not found" });
      }
      
      const updateSchema = insertSocialLinkSchema.partial();
      const validData = updateSchema.parse(req.body);
      
      const updatedLink = await storage.updateSocialLink(id, validData);
      res.json(updatedLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update social link" });
    }
  });

  // Delete social link
  app.delete("/api/social-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSocialLink(id);
      
      if (!success) {
        return res.status(404).json({ message: "Social link not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete social link" });
    }
  });

  // Add featured content
  app.post("/api/featured-contents", async (req, res) => {
    try {
      const validData = insertFeaturedContentSchema.parse(req.body);
      const newContent = await storage.createFeaturedContent(validData);
      res.status(201).json(newContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create featured content" });
    }
  });

  // Update featured content
  app.patch("/api/featured-contents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const content = await storage.getFeaturedContent(id);
      
      if (!content) {
        return res.status(404).json({ message: "Featured content not found" });
      }
      
      const updateSchema = insertFeaturedContentSchema.partial();
      const validData = updateSchema.parse(req.body);
      
      const updatedContent = await storage.updateFeaturedContent(id, validData);
      res.json(updatedContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update featured content" });
    }
  });

  // Delete featured content
  app.delete("/api/featured-contents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFeaturedContent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Featured content not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete featured content" });
    }
  });

  // Get GitHub contributions
  app.get("/api/github-contributions/:username", async (req, res) => {
    try {
      const { username } = req.params;
      if (!username) {
        return res.status(400).json({ message: "GitHub username is required" });
      }

      // Find the profile
      const profile = await storage.getProfileByUserId(1); // In a real app, get from session
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // Check if we already have contributions stored for this username and if they're recent
      const existingContributions = await storage.getGithubContributions(profile.id);
      const now = new Date();
      const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      // If profile has a different Github username than requested one, always fetch new data
      const profileUsername = profile.githubUsername || '';
      const isRequestingDifferentUser = profileUsername.toLowerCase() !== username.toLowerCase();
      
      // If we have recent data (less than a day old) AND it's for the same username, return it
      if (!isRequestingDifferentUser && 
          existingContributions && 
          existingContributions.lastUpdated && 
          (now.getTime() - new Date(existingContributions.lastUpdated).getTime() < ONE_DAY)) {
        return res.json(existingContributions);
      }

      // Otherwise, fetch new data from GitHub
      try {
        // We're using a simple approach for demo purposes
        // In a production app, you would use the GitHub GraphQL API with an auth token
        const response = await fetch(`https://github.com/users/${username}/contributions`);
        
        if (!response.ok) {
          return res.status(response.status).json({ 
            message: `Failed to fetch GitHub data: ${response.statusText}` 
          });
        }

        const html = await response.text();
        
        // Parse the contribution data from HTML
        // This is a simplified approach and may break if GitHub changes their HTML structure
        const contributionData = parseGitHubContributions(html);
        
        // Store the data
        const data = {
          profileId: profile.id,
          contributionData,
          lastUpdated: now.toISOString()
        };

        let savedContribution;
        if (existingContributions) {
          savedContribution = await storage.updateGithubContributions(
            existingContributions.id, 
            data
          );
        } else {
          savedContribution = await storage.createGithubContributions(data);
        }

        // Always update the profile with the new GitHub username
        if (profile.githubUsername !== username) {
          await storage.updateProfile(profile.id, { githubUsername: username });
        }

        res.json(savedContribution);
      } catch (fetchError: any) {
        console.error("GitHub API error:", fetchError);
        res.status(500).json({ 
          message: "Błąd pobierania danych z GitHub. Sprawdź, czy podana nazwa użytkownika jest poprawna.", 
          error: fetchError.message 
        });
      }
    } catch (error: any) {
      console.error("GitHub contributions error:", error);
      res.status(500).json({ 
        message: "Nie udało się pobrać danych z GitHub", 
        error: error.message 
      });
    }
  });

  // Helper function to parse GitHub contributions from HTML
  function parseGitHubContributions(html: string): ContributionData {
    // This is a simplified version that would need to be more robust in production
    // In a real app, you might use the GitHub GraphQL API instead
    const days: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];
    let total = 0;

    try {
      // Extract the data-count and data-date attributes from the HTML
      const regex = /<td[^>]+data-date="([^"]+)"[^>]+data-level="([^"]+)"[^>]*>(.*?)<\/td>/g;
      let match;
      
      while ((match = regex.exec(html)) !== null) {
        const date = match[1];
        const level = parseInt(match[2]) as 0 | 1 | 2 | 3 | 4;
        
        // Extract count from the tooltip
        let count = 0;
        const tooltipMatch = match[3].match(/(\d+) contributions?/);
        if (tooltipMatch) {
          count = parseInt(tooltipMatch[1]);
        }
        
        days.push({ date, count, level });
        total += count;
      }

      // If we couldn't parse the data, return an error rather than fake data
      if (days.length === 0) {
        console.error("GitHub parsing failed: No contribution data found");
        throw new Error("Could not parse GitHub contribution data. HTML structure may have changed.");
      }

      return { total, days };
    } catch (error: any) {
      console.error("Error parsing GitHub contributions:", error);
      // Do not return fake data - throw the error instead
      throw new Error(`Failed to parse GitHub contributions data: ${error.message}`);
    }
  }

  // Generate demo contribution data if we can't get real data
  function generateDemoContributionData(): ContributionData {
    const days: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];
    let total = 0;
    
    // Generate data for the last 365 days
    const now = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate random contribution count and level
      // More recent days tend to have more contributions
      const recencyFactor = 1 - (i / 365);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const activityFactor = isWeekend ? 0.3 : 1;
      
      const max = Math.floor(10 * recencyFactor * activityFactor);
      const count = Math.floor(Math.random() * (max + 1));
      
      let level: 0 | 1 | 2 | 3 | 4;
      if (count === 0) level = 0;
      else if (count <= 2) level = 1;
      else if (count <= 5) level = 2;
      else if (count <= 8) level = 3;
      else level = 4;
      
      days.push({ date: dateStr, count, level });
      total += count;
    }
    
    return { total, days };
  }

  const httpServer = createServer(app);
  return httpServer;
}
