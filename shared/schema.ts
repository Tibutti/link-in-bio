import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
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
  email: text("email"),
  phone: text("phone"),
  cvUrl: text("cv_url"),
  imageIndex: integer("image_index").default(0),
  backgroundIndex: integer("background_index").default(0),
  backgroundGradient: jsonb("background_gradient").$type<{
    colorFrom: string;
    colorTo: string;
    direction: string;
  }>(),
  githubUsername: text("github_username"),
  tryHackMeUserId: text("try_hack_me_user_id"),
  showGithubStats: boolean("show_github_stats").default(true),
  showTryHackMe: boolean("show_try_hack_me").default(true),
  showImage: boolean("show_image").default(true),
  showContact: boolean("show_contact").default(true),
  showSocial: boolean("show_social").default(true),
  showKnowledge: boolean("show_knowledge").default(true),
  showFeatured: boolean("show_featured").default(true),
  showTechnologies: boolean("show_technologies").default(true),
  sectionOrder: jsonb("section_order").$type<string[]>(),
});

export const insertProfileSchema = createInsertSchema(profiles).pick({
  userId: true,
  name: true,
  bio: true,
  location: true,
  email: true,
  phone: true,
  cvUrl: true,
  imageIndex: true,
  backgroundIndex: true,
  backgroundGradient: true,
  githubUsername: true,
  tryHackMeUserId: true,
  showGithubStats: true,
  showTryHackMe: true,
  showImage: true,
  showContact: true,
  showSocial: true,
  showKnowledge: true,
  showFeatured: true,
  showTechnologies: true,
  sectionOrder: true,
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
  category: text("category").default("social").notNull(), // "social" lub "knowledge"
  isVisible: boolean("is_visible").default(true),
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).pick({
  profileId: true,
  platform: true,
  username: true,
  url: true,
  iconName: true,
  order: true,
  category: true,
  isVisible: true,
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
  isVisible: boolean("is_visible").default(true),
});

export const insertFeaturedContentSchema = createInsertSchema(featuredContents).pick({
  profileId: true,
  title: true,
  imageUrl: true,
  linkUrl: true,
  order: true,
  isVisible: true,
});

export type InsertFeaturedContent = z.infer<typeof insertFeaturedContentSchema>;
export type FeaturedContent = typeof featuredContents.$inferSelect;

// GitHub contributions 
export interface GithubContribution {
  date: string;
  count: number;
  level: number; // 0-4 poziom aktywności
}

export interface ContributionData {
  contributions: GithubContribution[];
  totalContributions?: number;
  longestStreak?: number;
  currentStreak?: number;
}

// Sesje użytkowników
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  token: true,
  expiresAt: true,
  createdAt: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Technology categories
export const technologyCategories = [
  "frontend",
  "backend",
  "mobile",
  "devops",
  "database",
  "cloud",
  "testing",
  "design",
  "other"
] as const;

export type TechnologyCategory = typeof technologyCategories[number];

// Technology schema
export const technologies = pgTable("technologies", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  category: text("category").$type<TechnologyCategory>().notNull(),
  proficiencyLevel: integer("proficiency_level").default(0), // 0-100 poziom umiejętności
  yearsOfExperience: integer("years_of_experience"),
  isVisible: boolean("is_visible").default(true),
  order: integer("order").default(0),
});

export const insertTechnologySchema = createInsertSchema(technologies).pick({
  profileId: true,
  name: true,
  logoUrl: true,
  category: true,
  proficiencyLevel: true,
  yearsOfExperience: true,
  isVisible: true,
  order: true,
});

export type InsertTechnology = z.infer<typeof insertTechnologySchema>;
export type Technology = typeof technologies.$inferSelect;

// Issue severity categories
export const issueSeverities = [
  "low",
  "medium",
  "high",
  "critical"
] as const;

export type IssueSeverity = typeof issueSeverities[number];

// Issues schema
export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => profiles.id),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  severity: text("severity").$type<IssueSeverity>().default("medium"),
  status: text("status").default("open").notNull(), // "open" | "in_progress" | "resolved"
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertIssueSchema = createInsertSchema(issues).pick({
  profileId: true,
  title: true,
  description: true,
  imageUrl: true,
  severity: true,
  status: true,
  isResolved: true,
});

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issues.$inferSelect;

// Wizytownik - kontakty
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  contactProfileId: integer("contact_profile_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  category: text("category").default("default"),
  notes: text("notes"),
  addedAt: timestamp("added_at").defaultNow(),
  lastViewedAt: timestamp("last_viewed_at").defaultNow(),
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  userId: true,
  contactProfileId: true, 
  category: true,
  notes: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
