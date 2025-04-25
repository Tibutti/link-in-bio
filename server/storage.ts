import { 
  users, profiles, socialLinks, featuredContents, sessions, technologies, issues, contacts,
  type User, type InsertUser, 
  type Profile, type InsertProfile,
  type SocialLink, type InsertSocialLink,
  type FeaturedContent, type InsertFeaturedContent,
  type Session, type InsertSession,
  type Technology, type InsertTechnology,
  type TechnologyCategory,
  type Issue, type InsertIssue,
  type Contact, type InsertContact
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
  updateSocialLinkOrder(id: number, newOrder: number): Promise<SocialLink>;
  reorderSocialLinks(profileId: number, category: string, orderedIds: number[]): Promise<SocialLink[]>;
  
  // Featured content methods
  getFeaturedContents(profileId: number): Promise<FeaturedContent[]>;
  getFeaturedContent(id: number): Promise<FeaturedContent | undefined>;
  createFeaturedContent(content: InsertFeaturedContent): Promise<FeaturedContent>;
  updateFeaturedContent(id: number, data: Partial<FeaturedContent>): Promise<FeaturedContent>;
  deleteFeaturedContent(id: number): Promise<boolean>;
  updateFeaturedContentOrder(id: number, newOrder: number): Promise<FeaturedContent>;
  reorderFeaturedContents(profileId: number, orderedIds: number[]): Promise<FeaturedContent[]>;
  
  // Technology methods
  getTechnologies(profileId: number): Promise<Technology[]>;
  getTechnologiesByCategory(profileId: number, category: TechnologyCategory): Promise<Technology[]>;
  getTechnology(id: number): Promise<Technology | undefined>;
  createTechnology(technology: InsertTechnology): Promise<Technology>;
  updateTechnology(id: number, data: Partial<Technology>): Promise<Technology>;
  deleteTechnology(id: number): Promise<boolean>;
  updateTechnologyOrder(id: number, newOrder: number): Promise<Technology>;
  reorderTechnologies(profileId: number, category: TechnologyCategory, orderedIds: number[]): Promise<Technology[]>;
  
  // GitHub contributions methods have been removed
  
  // Session methods
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(id: number): Promise<boolean>;
  deleteSessionByToken(token: string): Promise<boolean>;
  
  // Issues methods
  getIssues(profileId: number): Promise<Issue[]>;
  getIssue(id: number): Promise<Issue | undefined>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: number, data: Partial<Issue>): Promise<Issue>;
  deleteIssue(id: number): Promise<boolean>;
  markIssueAsResolved(id: number): Promise<Issue>;
  markIssueAsOpen(id: number): Promise<Issue>;
  
  // Contacts methods (Wizytownik)
  getUserContacts(userId: number): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  addContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, data: Partial<Contact>): Promise<Contact>;
  deleteContact(id: number): Promise<boolean>;
  
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

  async createUser(insertUser: InsertUser & { password?: string }): Promise<User> {
    if (insertUser.password) {
      try {
        // Importujemy funkcję hashPassword dynamicznie, aby uniknąć cyklicznych zależności
        const { hashPassword } = await import('./auth');
        const hashedPassword = await hashPassword(insertUser.password);
        insertUser = { ...insertUser, password: hashedPassword };
      } catch (error) {
        console.error('Error hashing password:', error);
      }
    }
    
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
    const [profile] = await db.insert(profiles).values([insertProfile]).returning();
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

  async updateSocialLinkOrder(id: number, newOrder: number): Promise<SocialLink> {
    const [updatedLink] = await db
      .update(socialLinks)
      .set({ order: newOrder })
      .where(eq(socialLinks.id, id))
      .returning();
    
    if (!updatedLink) {
      throw new Error(`Social link with ID ${id} not found`);
    }
    
    return updatedLink;
  }

  async reorderSocialLinks(profileId: number, category: string, orderedIds: number[]): Promise<SocialLink[]> {
    // Pobierz wszystkie linki dla danego profilu i kategorii
    const links = await db
      .select()
      .from(socialLinks)
      .where(and(
        eq(socialLinks.profileId, profileId),
        eq(socialLinks.category, category)
      ));
    
    // Sprawdź, czy wszystkie przekazane ID należą do profilu
    const linkMap = new Map(links.map(link => [link.id, link]));
    const validIds = orderedIds.filter(id => linkMap.has(id));
    
    // Aktualizuj kolejność dla każdego linku
    const updatedLinks: SocialLink[] = [];
    for (let i = 0; i < validIds.length; i++) {
      const id = validIds[i];
      const [updatedLink] = await db
        .update(socialLinks)
        .set({ order: i })
        .where(eq(socialLinks.id, id))
        .returning();
      
      if (updatedLink) {
        updatedLinks.push(updatedLink);
      }
    }
    
    // Zwróć zaktualizowane linki posortowane według kolejności
    return updatedLinks.sort((a, b) => (a.order || 0) - (b.order || 0));
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

  async updateFeaturedContentOrder(id: number, newOrder: number): Promise<FeaturedContent> {
    const [updatedContent] = await db
      .update(featuredContents)
      .set({ order: newOrder })
      .where(eq(featuredContents.id, id))
      .returning();
    
    if (!updatedContent) {
      throw new Error(`Featured content with ID ${id} not found`);
    }
    
    return updatedContent;
  }

  async reorderFeaturedContents(profileId: number, orderedIds: number[]): Promise<FeaturedContent[]> {
    // Pobierz wszystkie wyróżnione treści dla danego profilu
    const contents = await db
      .select()
      .from(featuredContents)
      .where(eq(featuredContents.profileId, profileId));
    
    // Sprawdź, czy wszystkie przekazane ID należą do profilu
    const contentMap = new Map(contents.map(content => [content.id, content]));
    const validIds = orderedIds.filter(id => contentMap.has(id));
    
    // Aktualizuj kolejność dla każdej treści
    const updatedContents: FeaturedContent[] = [];
    for (let i = 0; i < validIds.length; i++) {
      const id = validIds[i];
      const [updatedContent] = await db
        .update(featuredContents)
        .set({ order: i })
        .where(eq(featuredContents.id, id))
        .returning();
      
      if (updatedContent) {
        updatedContents.push(updatedContent);
      }
    }
    
    // Zwróć zaktualizowane treści posortowane według kolejności
    return updatedContents.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // Technology methods
  async getTechnologies(profileId: number): Promise<Technology[]> {
    return db
      .select()
      .from(technologies)
      .where(eq(technologies.profileId, profileId))
      .orderBy(technologies.order);
  }

  async getTechnologiesByCategory(profileId: number, category: TechnologyCategory): Promise<Technology[]> {
    return db
      .select()
      .from(technologies)
      .where(and(
        eq(technologies.profileId, profileId),
        eq(technologies.category, category)
      ))
      .orderBy(technologies.order);
  }

  async getTechnology(id: number): Promise<Technology | undefined> {
    const [technology] = await db.select().from(technologies).where(eq(technologies.id, id));
    return technology;
  }

  async createTechnology(insertTechnology: InsertTechnology): Promise<Technology> {
    // Konwersja kategorii na odpowiedni typ
    const validatedData = {
      ...insertTechnology,
      category: insertTechnology.category as TechnologyCategory
    };
    
    const [technology] = await db.insert(technologies).values(validatedData).returning();
    return technology;
  }

  async updateTechnology(id: number, data: Partial<Technology>): Promise<Technology> {
    const [updatedTechnology] = await db
      .update(technologies)
      .set(data)
      .where(eq(technologies.id, id))
      .returning();
    
    if (!updatedTechnology) {
      throw new Error(`Technology with ID ${id} not found`);
    }
    
    return updatedTechnology;
  }

  async deleteTechnology(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(technologies)
      .where(eq(technologies.id, id))
      .returning();
    
    return !!deleted;
  }

  async updateTechnologyOrder(id: number, newOrder: number): Promise<Technology> {
    const [updatedTechnology] = await db
      .update(technologies)
      .set({ order: newOrder })
      .where(eq(technologies.id, id))
      .returning();
    
    if (!updatedTechnology) {
      throw new Error(`Technology with ID ${id} not found`);
    }
    
    return updatedTechnology;
  }

  async reorderTechnologies(profileId: number, category: TechnologyCategory, orderedIds: number[]): Promise<Technology[]> {
    // Pobierz wszystkie technologie dla danego profilu i kategorii
    const techs = await db
      .select()
      .from(technologies)
      .where(and(
        eq(technologies.profileId, profileId),
        eq(technologies.category, category)
      ));
    
    // Sprawdź, czy wszystkie przekazane ID należą do profilu
    const techMap = new Map(techs.map(tech => [tech.id, tech]));
    const validIds = orderedIds.filter(id => techMap.has(id));
    
    // Aktualizuj kolejność dla każdej technologii
    const updatedTechs: Technology[] = [];
    for (let i = 0; i < validIds.length; i++) {
      const id = validIds[i];
      const [updatedTech] = await db
        .update(technologies)
        .set({ order: i })
        .where(eq(technologies.id, id))
        .returning();
      
      if (updatedTech) {
        updatedTechs.push(updatedTech);
      }
    }
    
    // Zwróć zaktualizowane technologie posortowane według kolejności
    return updatedTechs.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // GitHub contributions methods have been removed

  // Issues methods
  async getIssues(profileId: number): Promise<Issue[]> {
    return db
      .select()
      .from(issues)
      .where(eq(issues.profileId, profileId))
      .orderBy(desc(issues.createdAt));
  }

  async getIssue(id: number): Promise<Issue | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.id, id));
    return issue;
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    // Inicjalizujemy status i isResolved jeśli nie są podane
    const issueToInsert = {
      ...insertIssue,
      status: insertIssue.status || "open",
      isResolved: insertIssue.isResolved !== undefined ? insertIssue.isResolved : false
    };
    
    const [issue] = await db.insert(issues).values([issueToInsert]).returning();
    return issue;
  }

  async updateIssue(id: number, data: Partial<Issue>): Promise<Issue> {
    const [updatedIssue] = await db
      .update(issues)
      .set(data)
      .where(eq(issues.id, id))
      .returning();
    
    if (!updatedIssue) {
      throw new Error(`Issue with ID ${id} not found`);
    }
    
    return updatedIssue;
  }

  async deleteIssue(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(issues)
      .where(eq(issues.id, id))
      .returning();
    
    return !!deleted;
  }

  async markIssueAsResolved(id: number): Promise<Issue> {
    const now = new Date();
    const [updatedIssue] = await db
      .update(issues)
      .set({ 
        isResolved: true,
        status: "resolved",
        resolvedAt: now
      })
      .where(eq(issues.id, id))
      .returning();
    
    if (!updatedIssue) {
      throw new Error(`Issue with ID ${id} not found`);
    }
    
    return updatedIssue;
  }

  async markIssueAsOpen(id: number): Promise<Issue> {
    const [updatedIssue] = await db
      .update(issues)
      .set({ 
        isResolved: false,
        status: "open",
        resolvedAt: null
      })
      .where(eq(issues.id, id))
      .returning();
    
    if (!updatedIssue) {
      throw new Error(`Issue with ID ${id} not found`);
    }
    
    return updatedIssue;
  }

  // Session methods
  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.token, token));
    return session;
  }

  async deleteSession(id: number): Promise<boolean> {
    const [deleted] = await db.delete(sessions).where(eq(sessions.id, id)).returning();
    return !!deleted;
  }

  async deleteSessionByToken(token: string): Promise<boolean> {
    const [deleted] = await db.delete(sessions).where(eq(sessions.token, token)).returning();
    return !!deleted;
  }

  // Initialize database with demo data 
  async initializeDemoData() {
    // Sprawdź, czy użytkownik demo już istnieje
    const existingDemoUser = await this.getUserByUsername("demo");
    
    if (existingDemoUser) {
      console.log("Demo user already exists, skipping initialization");
      return;
    }
    
    console.log("Initializing demo data with demo user");

    // Create demo user with hashed password
    // Import bezpośrednio hashPassword aby uniknąć cyklicznych zależności 
    const { hashPassword } = await import('./auth');
    const hashedPassword = await hashPassword("demo123");
    
    const [demoUser] = await db.insert(users).values({
      username: "demo",
      password: hashedPassword
    }).returning();

    // Create demo profile
    const [demoProfile] = await db.insert(profiles).values({
      userId: demoUser.id,
      name: "Jane Doe",
      bio: "Digital creator, photographer, and tech enthusiast sharing my journey and connecting with like-minded people.",
      location: "New York, USA",
      imageIndex: 0,
      backgroundIndex: 0,
      githubUsername: "Tibutti", // Używamy podanej nazwy użytkownika GitHub
      tryHackMeUserId: "2135753", // Dodajemy ID TryHackMe
      showGithubStats: true,
      showTryHackMe: true,
      showContact: true,
      showSocial: true,
      showKnowledge: true,
      showFeatured: true,
      showTechnologies: true,
      showImage: true,
      sectionOrder: ["image", "contact", "github", "social", "knowledge", "featured", "tryhackme", "technologies"]
    }).returning();

    // Create social links
    const socialLinksData = [
      { platform: "Instagram", username: "@janedoe", url: "https://instagram.com/janedoe", iconName: "instagram", category: "social" },
      { platform: "X", username: "@janedoe", url: "https://x.com/janedoe", iconName: "x", category: "social" },
      { platform: "Facebook", username: "Jane Doe", url: "https://facebook.com/janedoe", iconName: "facebook", category: "social" },
      { platform: "WhatsApp", username: "+1 234 567 890", url: "https://wa.me/1234567890", iconName: "whatsapp", category: "social" },
      { platform: "Telegram", username: "@janedoe", url: "https://t.me/janedoe", iconName: "telegram", category: "social" },
      { platform: "LinkedIn", username: "in/janedoe", url: "https://linkedin.com/in/janedoe", iconName: "linkedin", category: "social" },
      { platform: "YouTube", username: "@janedoecreates", url: "https://youtube.com/@janedoecreates", iconName: "youtube", category: "social" },
      { platform: "TikTok", username: "@janedoe", url: "https://tiktok.com/@janedoe", iconName: "tiktok", category: "social" },
    ];

    // Platformy do dzielenia się wiedzą
    const knowledgeLinksData = [
      { platform: "Medium", username: "@janedoe", url: "https://medium.com/@janedoe", iconName: "medium", category: "knowledge" },
      { platform: "Substack", username: "Jane's Newsletter", url: "https://janedoe.substack.com", iconName: "substack", category: "knowledge" },
      { platform: "Dev.to", username: "@janedoe", url: "https://dev.to/janedoe", iconName: "devto", category: "knowledge" },
      { platform: "Hashnode", username: "@janedoe", url: "https://hashnode.com/@janedoe", iconName: "hashnode", category: "knowledge" },
      { platform: "Stack Overflow", username: "Jane Doe", url: "https://stackoverflow.com/users/123456/jane-doe", iconName: "stackoverflow", category: "knowledge" },
      { platform: "Behance", username: "Jane Doe", url: "https://behance.net/janedoe", iconName: "behance", category: "knowledge" },
    ];

    // Połączenie obu list
    const allLinksData = [...socialLinksData, ...knowledgeLinksData];

    for (let i = 0; i < allLinksData.length; i++) {
      const link = allLinksData[i];
      await db.insert(socialLinks).values({
        profileId: demoProfile.id,
        platform: link.platform,
        username: link.username,
        url: link.url,
        iconName: link.iconName,
        order: i,
        category: link.category
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

    // Dodaj przykładowe technologie
    const technologiesData = [
      // Frontend
      { 
        name: "React", 
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg", 
        category: "frontend", 
        proficiencyLevel: 90,
        yearsOfExperience: 3
      },
      { 
        name: "TypeScript", 
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg", 
        category: "frontend", 
        proficiencyLevel: 85,
        yearsOfExperience: 2
      },
      { 
        name: "Tailwind CSS", 
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg", 
        category: "frontend", 
        proficiencyLevel: 80,
        yearsOfExperience: 2
      },
      // Backend
      { 
        name: "Node.js", 
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg", 
        category: "backend", 
        proficiencyLevel: 85,
        yearsOfExperience: 4
      },
      { 
        name: "Express", 
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png", 
        category: "backend", 
        proficiencyLevel: 80,
        yearsOfExperience: 3
      },
      { 
        name: "PostgreSQL", 
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg", 
        category: "database", 
        proficiencyLevel: 75,
        yearsOfExperience: 3
      },
      // DevOps
      { 
        name: "Docker", 
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.svg", 
        category: "devops", 
        proficiencyLevel: 70,
        yearsOfExperience: 2
      },
      { 
        name: "GitHub Actions", 
        logoUrl: "https://github.githubassets.com/images/modules/site/features/actions-icon-actions.svg", 
        category: "devops", 
        proficiencyLevel: 65,
        yearsOfExperience: 1
      }
    ];

    for (let i = 0; i < technologiesData.length; i++) {
      const tech = technologiesData[i];
      await db.insert(technologies).values({
        profileId: demoProfile.id,
        name: tech.name,
        logoUrl: tech.logoUrl,
        category: tech.category as TechnologyCategory,
        proficiencyLevel: tech.proficiencyLevel,
        yearsOfExperience: tech.yearsOfExperience,
        order: i,
        isVisible: true
      });
    }
  }
}

// Create and export storage instance
export const storage = new DatabaseStorage();