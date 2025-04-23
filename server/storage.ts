import { 
  users, type User, type InsertUser,
  profiles, type Profile, type InsertProfile,
  socialLinks, type SocialLink, type InsertSocialLink,
  featuredContents, type FeaturedContent, type InsertFeaturedContent,
  githubContributions, type GithubContribution, type InsertGithubContribution,
  type ContributionData
} from "@shared/schema";

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
  
  // GitHub contributions methods
  getGithubContributions(profileId: number): Promise<GithubContribution | undefined>;
  createGithubContributions(contribution: InsertGithubContribution): Promise<GithubContribution>;
  updateGithubContributions(id: number, data: Partial<GithubContribution>): Promise<GithubContribution>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profiles: Map<number, Profile>;
  private socialLinks: Map<number, SocialLink>;
  private featuredContents: Map<number, FeaturedContent>;
  private githubContributions: Map<number, GithubContribution>;
  private currentUserId: number;
  private currentProfileId: number;
  private currentSocialLinkId: number;
  private currentFeaturedContentId: number;
  private currentGithubContributionId: number;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.socialLinks = new Map();
    this.featuredContents = new Map();
    this.githubContributions = new Map();
    this.currentUserId = 1;
    this.currentProfileId = 1;
    this.currentSocialLinkId = 1;
    this.currentFeaturedContentId = 1;
    this.currentGithubContributionId = 1;

    // Initialize with demo data
    this.initializeDemoData();
  }

  // Initialize with demo data
  private async initializeDemoData() {
    // Create demo user
    const demoUser = await this.createUser({
      username: "demo",
      password: "demo123", // In production, would be hashed
    });

    // Create demo profile
    const demoProfile = await this.createProfile({
      userId: demoUser.id,
      name: "Jane Doe",
      bio: "Digital creator, photographer, and tech enthusiast sharing my journey and connecting with like-minded people.",
      location: "New York, USA",
      imageIndex: 0,
      backgroundIndex: 0,
    });

    // Create social links
    const socialLinks = [
      { platform: "Instagram", username: "@janedoe", url: "https://instagram.com/janedoe", iconName: "instagram" },
      { platform: "Twitter", username: "@janedoe", url: "https://twitter.com/janedoe", iconName: "twitter" },
      { platform: "LinkedIn", username: "in/janedoe", url: "https://linkedin.com/in/janedoe", iconName: "linkedin" },
      { platform: "YouTube", username: "@janedoecreates", url: "https://youtube.com/@janedoecreates", iconName: "youtube" },
      { platform: "TikTok", username: "@janedoe", url: "https://tiktok.com/@janedoe", iconName: "tiktok" },
    ];

    for (let i = 0; i < socialLinks.length; i++) {
      const link = socialLinks[i];
      await this.createSocialLink({
        profileId: demoProfile.id,
        platform: link.platform,
        username: link.username,
        url: link.url,
        iconName: link.iconName,
        order: i,
      });
    }

    // Create featured content
    const featuredContents = [
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

    for (let i = 0; i < featuredContents.length; i++) {
      const content = featuredContents[i];
      await this.createFeaturedContent({
        profileId: demoProfile.id,
        title: content.title,
        imageUrl: content.imageUrl,
        linkUrl: content.linkUrl,
        order: i,
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Profile methods
  async getProfile(id: number): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async getProfileByUserId(userId: number): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = this.currentProfileId++;
    const profile: Profile = { ...insertProfile, id };
    this.profiles.set(id, profile);
    return profile;
  }

  async updateProfile(id: number, data: Partial<Profile>): Promise<Profile> {
    const profile = this.profiles.get(id);
    if (!profile) {
      throw new Error(`Profile with ID ${id} not found`);
    }
    
    const updatedProfile = { ...profile, ...data };
    this.profiles.set(id, updatedProfile);
    return updatedProfile;
  }

  // Social link methods
  async getSocialLinks(profileId: number): Promise<SocialLink[]> {
    return Array.from(this.socialLinks.values())
      .filter((link) => link.profileId === profileId)
      .sort((a, b) => a.order - b.order);
  }

  async getSocialLink(id: number): Promise<SocialLink | undefined> {
    return this.socialLinks.get(id);
  }

  async createSocialLink(insertLink: InsertSocialLink): Promise<SocialLink> {
    const id = this.currentSocialLinkId++;
    const link: SocialLink = { ...insertLink, id };
    this.socialLinks.set(id, link);
    return link;
  }

  async updateSocialLink(id: number, data: Partial<SocialLink>): Promise<SocialLink> {
    const link = this.socialLinks.get(id);
    if (!link) {
      throw new Error(`Social link with ID ${id} not found`);
    }
    
    const updatedLink = { ...link, ...data };
    this.socialLinks.set(id, updatedLink);
    return updatedLink;
  }

  async deleteSocialLink(id: number): Promise<boolean> {
    return this.socialLinks.delete(id);
  }

  // Featured content methods
  async getFeaturedContents(profileId: number): Promise<FeaturedContent[]> {
    return Array.from(this.featuredContents.values())
      .filter((content) => content.profileId === profileId)
      .sort((a, b) => a.order - b.order);
  }

  async getFeaturedContent(id: number): Promise<FeaturedContent | undefined> {
    return this.featuredContents.get(id);
  }

  async createFeaturedContent(insertContent: InsertFeaturedContent): Promise<FeaturedContent> {
    const id = this.currentFeaturedContentId++;
    const content: FeaturedContent = { ...insertContent, id };
    this.featuredContents.set(id, content);
    return content;
  }

  async updateFeaturedContent(id: number, data: Partial<FeaturedContent>): Promise<FeaturedContent> {
    const content = this.featuredContents.get(id);
    if (!content) {
      throw new Error(`Featured content with ID ${id} not found`);
    }
    
    const updatedContent = { ...content, ...data };
    this.featuredContents.set(id, updatedContent);
    return updatedContent;
  }

  async deleteFeaturedContent(id: number): Promise<boolean> {
    return this.featuredContents.delete(id);
  }

  // GitHub contributions methods
  async getGithubContributions(profileId: number): Promise<GithubContribution | undefined> {
    return Array.from(this.githubContributions.values()).find(
      (contribution) => contribution.profileId === profileId
    );
  }

  async createGithubContributions(contribution: InsertGithubContribution): Promise<GithubContribution> {
    const id = this.currentGithubContributionId++;
    const newContribution: GithubContribution = { ...contribution, id };
    this.githubContributions.set(id, newContribution);
    return newContribution;
  }

  async updateGithubContributions(id: number, data: Partial<GithubContribution>): Promise<GithubContribution> {
    const contribution = this.githubContributions.get(id);
    if (!contribution) {
      throw new Error(`GitHub contribution with ID ${id} not found`);
    }
    
    const updatedContribution = { ...contribution, ...data };
    this.githubContributions.set(id, updatedContribution);
    return updatedContribution;
  }
}

export const storage = new MemStorage();
