import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertSocialLinkSchema, insertFeaturedContentSchema, users } from "@shared/schema";
import { z } from "zod";
import fetch from "node-fetch";
import { fetchGitHubContributions } from "./githubApi";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // Endpoint do ponownej inicjalizacji danych testowych
  app.post("/api/reinitialize-demo-data", async (req, res) => {
    try {
      await storage.initializeDemoData();
      res.json({ message: "Demo data has been reinitialized successfully" });
    } catch (error) {
      console.error("Error reinitializing demo data:", error);
      res.status(500).json({ message: "Failed to reinitialize demo data" });
    }
  });
  // Get profile data and all associated content
  app.get("/api/profile", async (req, res) => {
    try {
      // Używamy stałego ID użytkownika równego 5, który wiemy, że istnieje w bazie
      const userId = 5; // ID z bazy danych
      const profile = await storage.getProfileByUserId(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const socialLinks = await storage.getSocialLinks(profile.id);
      const featuredContents = await storage.getFeaturedContents(profile.id);
      
      res.json({
        profile,
        socialLinks,
        featuredContents
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

  // Endpoint do pobierania danych kontrybucji GitHub
  app.get("/api/github-contributions/:username", async (req, res) => {
    try {
      const { username } = req.params;
      
      if (!username) {
        return res.status(400).json({ message: "GitHub username is required" });
      }
      
      const contributions = await fetchGitHubContributions(username);
      res.json({ contributions });
    } catch (error) {
      console.error("Error fetching GitHub contributions:", error);
      res.status(500).json({ message: "Failed to fetch GitHub contributions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
