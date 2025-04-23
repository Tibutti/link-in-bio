import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Profile data
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  bio: text("bio"),
  location: text("location"),
  imageIndex: integer("image_index").default(0),
  backgroundIndex: integer("background_index").default(0),
  githubUsername: text("github_username"),
});

export const insertProfileSchema = createInsertSchema(profiles).pick({
  userId: true,
  name: true,
  bio: true,
  location: true,
  imageIndex: true,
  backgroundIndex: true,
  githubUsername: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// Social links
export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id),
  platform: text("platform").notNull(),
  username: text("username").notNull(),
  url: text("url").notNull(),
  iconName: text("icon_name").notNull(),
  order: integer("order").default(0),
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).pick({
  profileId: true,
  platform: true,
  username: true,
  url: true,
  iconName: true,
  order: true,
});

export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;

// Featured content
export const featuredContents = pgTable("featured_contents", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  linkUrl: text("link_url"),
  order: integer("order").default(0),
});

export const insertFeaturedContentSchema = createInsertSchema(featuredContents).pick({
  profileId: true,
  title: true,
  imageUrl: true,
  linkUrl: true,
  order: true,
});

export type InsertFeaturedContent = z.infer<typeof insertFeaturedContentSchema>;
export type FeaturedContent = typeof featuredContents.$inferSelect;

// GitHub contributions
export const githubContributions = pgTable("github_contributions", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id),
  contributionData: jsonb("contribution_data").notNull(),
  lastUpdated: text("last_updated").notNull(),
});

export const insertGithubContributionSchema = createInsertSchema(githubContributions).pick({
  profileId: true,
  contributionData: true,
  lastUpdated: true,
});

export type InsertGithubContribution = z.infer<typeof insertGithubContributionSchema>;
export type GithubContribution = typeof githubContributions.$inferSelect;

// Custom type for GitHub contribution data structure
export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type ContributionData = {
  total: number;
  days: ContributionDay[];
};
