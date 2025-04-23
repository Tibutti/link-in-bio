import { 
  users, profiles, socialLinks, featuredContents,
  type User, type InsertUser, 
  type Profile, type InsertProfile,
  type SocialLink, type InsertSocialLink,
  type FeaturedContent, type InsertFeaturedContent
} from '@shared/schema';
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Profile methods
  getProfile(id: number): Promise<Profile | undefined>;
  getProfileByUserId(userId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: number, data: Partial<Profile>): Promise<Profile>;
  
  // Social link methods
  getSocialLinks(profileId: number): Promise<SocialLink[]>;
  getSocialLink(id: number): Promise<SocialLink | undefined>;
  createSocialLink(link: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: number, data: Partial<SocialLink>): Promise<SocialLink>;
  deleteSocialLink(id: number): Promise<boolean>;
  
  // Featured content methods
  getFeaturedContents(profileId: number): Promise<FeaturedContent[]>;
  getFeaturedContent(id: number): Promise<FeaturedContent | undefined>;
  createFeaturedContent(content: InsertFeaturedContent): Promise<FeaturedContent>;
  updateFeaturedContent(id: number, data: Partial<FeaturedContent>): Promise<FeaturedContent>;
  deleteFeaturedContent(id: number): Promise<boolean>;
  
  // GitHub contributions methods have been removed
  
  // Demo data initialization
  initializeDemoData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Profile methods
  async getProfile(id: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async getProfileByUserId(userId: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(insertProfile).returning();
    return profile;
  }

  async updateProfile(id: number, data: Partial<Profile>): Promise<Profile> {
    const [updatedProfile] = await db
      .update(profiles)
      .set(data)
      .where(eq(profiles.id, id))
      .returning();
    
    if (!updatedProfile) {
      throw new Error(`Profile with ID ${id} not found`);
    }
    
    return updatedProfile;
  }

  // Social link methods
  async getSocialLinks(profileId: number): Promise<SocialLink[]> {
    return db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.profileId, profileId))
      .orderBy(socialLinks.order);
  }

  async getSocialLink(id: number): Promise<SocialLink | undefined> {
    const [link] = await db.select().from(socialLinks).where(eq(socialLinks.id, id));
    return link;
  }

  async createSocialLink(insertLink: InsertSocialLink): Promise<SocialLink> {
    const [link] = await db.insert(socialLinks).values(insertLink).returning();
    return link;
  }

  async updateSocialLink(id: number, data: Partial<SocialLink>): Promise<SocialLink> {
    const [updatedLink] = await db
      .update(socialLinks)
      .set(data)
      .where(eq(socialLinks.id, id))
      .returning();
    
    if (!updatedLink) {
      throw new Error(`Social link with ID ${id} not found`);
    }
    
    return updatedLink;
  }

  async deleteSocialLink(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(socialLinks)
      .where(eq(socialLinks.id, id))
      .returning();
    
    return !!deleted;
  }

  // Featured content methods
  async getFeaturedContents(profileId: number): Promise<FeaturedContent[]> {
    return db
      .select()
      .from(featuredContents)
      .where(eq(featuredContents.profileId, profileId))
      .orderBy(featuredContents.order);
  }

  async getFeaturedContent(id: number): Promise<FeaturedContent | undefined> {
    const [content] = await db.select().from(featuredContents).where(eq(featuredContents.id, id));
    return content;
  }

  async createFeaturedContent(insertContent: InsertFeaturedContent): Promise<FeaturedContent> {
    const [content] = await db.insert(featuredContents).values(insertContent).returning();
    return content;
  }

  async updateFeaturedContent(id: number, data: Partial<FeaturedContent>): Promise<FeaturedContent> {
    const [updatedContent] = await db
      .update(featuredContents)
      .set(data)
      .where(eq(featuredContents.id, id))
      .returning();
    
    if (!updatedContent) {
      throw new Error(`Featured content with ID ${id} not found`);
    }
    
    return updatedContent;
  }

  async deleteFeaturedContent(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(featuredContents)
      .where(eq(featuredContents.id, id))
      .returning();
    
    return !!deleted;
  }

  // GitHub contributions methods have been removed

  // Initialize database with demo data if empty
  async initializeDemoData() {
    // Check if any users exist
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      return; // Data already exists, do not initialize
    }

    // Create demo user
    const [demoUser] = await db.insert(users).values({
      username: "demo",
      password: "demo123" // In production, would be hashed
    }).returning();

    // Create demo profile
    const [demoProfile] = await db.insert(profiles).values({
      userId: demoUser.id,
      name: "Jane Doe",
      bio: "Digital creator, photographer, and tech enthusiast sharing my journey and connecting with like-minded people.",
      location: "New York, USA",
      imageIndex: 0,
      backgroundIndex: 0
    }).returning();

    // Create social links
    const socialLinksData = [
      { platform: "Instagram", username: "@janedoe", url: "https://instagram.com/janedoe", iconName: "instagram" },
      { platform: "X", username: "@janedoe", url: "https://x.com/janedoe", iconName: "x" },
      { platform: "Facebook", username: "Jane Doe", url: "https://facebook.com/janedoe", iconName: "facebook" },
      { platform: "WhatsApp", username: "+1 234 567 890", url: "https://wa.me/1234567890", iconName: "whatsapp" },
      { platform: "Telegram", username: "@janedoe", url: "https://t.me/janedoe", iconName: "telegram" },
      { platform: "LinkedIn", username: "in/janedoe", url: "https://linkedin.com/in/janedoe", iconName: "linkedin" },
      { platform: "YouTube", username: "@janedoecreates", url: "https://youtube.com/@janedoecreates", iconName: "youtube" },
      { platform: "TikTok", username: "@janedoe", url: "https://tiktok.com/@janedoe", iconName: "tiktok" },
    ];

    for (let i = 0; i < socialLinksData.length; i++) {
      const link = socialLinksData[i];
      await db.insert(socialLinks).values({
        profileId: demoProfile.id,
        platform: link.platform,
        username: link.username,
        url: link.url,
        iconName: link.iconName,
        order: i
      });
    }

    // Create featured content
    const featuredContentsData = [
      { 
        title: "Travel Photography", 
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80", 
        linkUrl: "https://example.com/travel" 
      },
      { 
        title: "Tech Reviews", 
        imageUrl: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80", 
        linkUrl: "https://example.com/tech" 
      },
    ];

    for (let i = 0; i < featuredContentsData.length; i++) {
      const content = featuredContentsData[i];
      await db.insert(featuredContents).values({
        profileId: demoProfile.id,
        title: content.title,
        imageUrl: content.imageUrl,
        linkUrl: content.linkUrl,
        order: i
      });
    }
  }
}

// Create and export storage instance
export const storage = new DatabaseStorage();