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
  
  // Update profile
  app.patch("/api/profile/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const profile = await storage.getProfile(id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Create schema that accepts either part of the profile including the new backgroundGradient
      const updateSchema = z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        location: z.string().optional(),
        imageIndex: z.number().optional(),
        backgroundIndex: z.number().optional(),
        backgroundGradient: z.object({
          colorFrom: z.string(),
          colorTo: z.string(),
          direction: z.string(),
        }).optional(),
        githubUsername: z.string().optional(),
      });
      
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

      // Check if we already have contributions stored for this username
      const existingContributions = await storage.getGithubContributions(profile.id);
      const now = new Date();
      
      // If profile has a different Github username than requested one, always fetch new data
      const profileUsername = profile.githubUsername || '';
      const isRequestingDifferentUser = profileUsername.toLowerCase() !== username.toLowerCase();
      
      // Always fetch new data to ensure we have the most up-to-date information
      // This is important for accuracy in the current year (2025)
      console.log(`Fetching fresh GitHub data for user: ${username}`);
      
      // Delete existing data if the username has changed
      if (isRequestingDifferentUser && existingContributions) {
        console.log(`Username changed from ${profileUsername} to ${username}, clearing old data`);
      }

      // Otherwise, fetch new data from GitHub
      try {
        console.log(`Fetching GitHub data for user: ${username}`);
        
        // Add a timestamp parameter to avoid caching issues
        const timestamp = Date.now();
        
        // We're using a simple approach for demo purposes
        // In a production app, you would use the GitHub GraphQL API with an auth token
        const url = `https://github.com/users/${username}/contributions?t=${timestamp}`;
        console.log(`GitHub URL: ${url}`);
        
        // Use custom headers to prevent caching
        const headers = {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'User-Agent': 'Mozilla/5.0 (compatible; LinkinbioApp/1.0)'
        };
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          console.error(`GitHub API responded with status: ${response.status} - ${response.statusText}`);
          return res.status(response.status).json({ 
            message: `Failed to fetch GitHub data: ${response.statusText}` 
          });
        }

        const html = await response.text();
        console.log(`GitHub HTML size: ${html.length} bytes`);
        
        // Ekstrakcja SVG kalendarza na potrzeby bezpośredniego wyświetlania
        let svgCalendar = null;
        try {
          // Wyszukanie elementu SVG kalendarza
          const svgMatch = html.match(/<svg[^>]*class="js-calendar-graph-svg"[^>]*>([\s\S]*?)<\/svg>/i);
          if (svgMatch && svgMatch[0]) {
            svgCalendar = svgMatch[0];
            // Dodanie dodatkowych stylów dla lepszego wyświetlania
            svgCalendar = svgCalendar.replace('<svg', '<svg style="width:100%;height:auto;max-width:780px" ');
            console.log("Successfully extracted GitHub calendar SVG");
          }
        } catch (svgError) {
          console.error("Error extracting GitHub calendar SVG:", svgError);
        }
        
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

        // Dodanie SVG kalendarza do odpowiedzi
        if (svgCalendar) {
          (savedContribution as any).svgCalendar = svgCalendar;
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
  
  // Proxy dla GitHub - pomoże ominąć problemy CORS przy bezpośrednim pobieraniu danych
  app.get("/api/github-proxy/:username", async (req, res) => {
    try {
      const { username } = req.params;
      if (!username) {
        return res.status(400).json({ message: "GitHub username is required" });
      }
      
      // Dodaj timestamp do zapytania, aby uniknąć cache'owania
      const timestamp = Date.now();
      const url = `https://github.com/${username}?t=${timestamp}`;
      
      console.log(`Proxying GitHub request for: ${url}`);
      
      const headers = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'User-Agent': 'Mozilla/5.0 (compatible; LinkinbioApp/1.0)'
      };
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        return res.status(response.status).send(response.statusText);
      }
      
      const html = await response.text();
      
      // Dodaj nagłówki CORS, aby zezwolić na żądania cross-origin
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error: any) {
      console.error("GitHub proxy error:", error);
      res.status(500).json({ 
        message: "Failed to proxy GitHub request", 
        error: error.message 
      });
    }
  });

  // Helper function to parse GitHub contributions from HTML
  function parseGitHubContributions(html: string): ContributionData {
    // This is a simplified version that would need to be more robust in production
    // In a real app, you would use the GitHub GraphQL API instead
    const days: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];
    let total = 0;

    try {
      // First, extract all day cells with their data-date and data-level
      const cellRegex = /<td[^>]+data-date="([^"]+)"[^>]+data-level="([^"]+)"[^>]+id="(contribution-day-component-[^"]+)"[^>]+class="ContributionCalendar-day"><\/td>/g;
      let cellMatch;
      
      // Create a map to store cell IDs and their corresponding dates and levels
      const cellMap = new Map<string, { date: string; level: 0 | 1 | 2 | 3 | 4 }>();
      
      while ((cellMatch = cellRegex.exec(html)) !== null) {
        const date = cellMatch[1];
        const level = parseInt(cellMatch[2]) as 0 | 1 | 2 | 3 | 4;
        const cellId = cellMatch[3];
        
        cellMap.set(cellId, { date, level });
      }
      
      // For debugging
      console.log(`Extracted ${cellMap.size} GitHub contribution cells`);
      
      // Next, extract tooltips with contribution counts
      // We need to handle both patterns: "X contributions on [date]" and "No contributions on [date]"
      const tooltipRegex = /<tool-tip[^>]+for="(contribution-day-component-[^"]+)"[^>]*>[^>]*?((\d+) contributions?|No contributions)[^<]*<\/tool-tip>/g;
      let tooltipMatch;
      
      while ((tooltipMatch = tooltipRegex.exec(html)) !== null) {
        const cellId = tooltipMatch[1];
        const cellData = cellMap.get(cellId);
        
        if (cellData) {
          // Extract count from the tooltip
          let count = 0;
          // Check if we have a number in the contribution message
          const countMatch = tooltipMatch[0].match(/(\d+) contributions?/);
          if (countMatch) {
            count = parseInt(countMatch[1]);
          }
          
          days.push({ 
            date: cellData.date, 
            count, 
            level: cellData.level 
          });
          
          total += count;
        }
      }
      
      // For debugging
      console.log(`Extracted ${days.length} days with contribution data`);
      if (days.length > 0) {
        console.log(`Sample day data: ${JSON.stringify(days[0])}`);
      }

      // If we couldn't parse the data, throw an error
      if (days.length === 0) {
        console.error("GitHub parsing failed: No contribution data found");
        throw new Error("Could not parse GitHub contribution data. HTML structure may have changed.");
      }

      return { total, days };
    } catch (error: any) {
      console.error("Error parsing GitHub contributions:", error);
      throw new Error(`Failed to parse GitHub contributions data: ${error.message}`);
    }
  }

  // This function has been removed to ensure we only display authentic data from GitHub

  const httpServer = createServer(app);
  return httpServer;
}
