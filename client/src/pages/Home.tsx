import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";

import ProfileHeader from "@/components/ProfileHeader";
import SocialLinks from "@/components/SocialLinks";
import FeaturedContent from "@/components/FeaturedContent";
import GithubContributions from "@/components/GithubContributions";
import ProfileSelector from "@/components/ProfileSelector";
import BackgroundSelector from "@/components/BackgroundSelector";
import Footer from "@/components/Footer";
import { BACKGROUND_OPTIONS } from "@/lib/constants";

import { 
  type Profile, 
  type SocialLink, 
  type FeaturedContent as FeaturedContentType,
  type GithubContribution 
} from "@shared/schema";

export default function Home() {
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  // Fetch profile data
  const { data, isLoading, isError } = useQuery<{
    profile: Profile;
    socialLinks: SocialLink[];
    featuredContents: FeaturedContentType[];
    githubContributions?: GithubContribution;
  }>({
    queryKey: ["/api/profile"],
  });

  // Update background mutation
  const updateBackgroundMutation = useMutation({
    mutationFn: async (backgroundIndex: number) => {
      if (!data || !data.profile || data.profile.id === undefined) return null;
      const profileId = data.profile.id;
      
      return apiRequest(
        "PATCH", 
        `/api/profile/${profileId}/background`, 
        { backgroundIndex }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  // Update profile image mutation
  const updateProfileImageMutation = useMutation({
    mutationFn: async (imageIndex: number) => {
      if (!data || !data.profile || data.profile.id === undefined) return null;
      const profileId = data.profile.id;
      
      return apiRequest(
        "PATCH", 
        `/api/profile/${profileId}/image`, 
        { imageIndex }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  // Set background from profile data
  useEffect(() => {
    if (data?.profile && data.profile.backgroundIndex !== null) {
      setBackgroundIndex(data.profile.backgroundIndex);
    }
  }, [data]);

  const handleBackgroundChange = (index: number) => {
    setBackgroundIndex(index);
    updateBackgroundMutation.mutate(index);
  };

  const handleProfileImageChange = (index: number) => {
    updateProfileImageMutation.mutate(index);
  };

  // Handle link click
  const handleLinkClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-red-500 text-xl">Error loading profile data. Please try again.</div>
      </div>
    );
  }

  // Dodaj asercję, że data na pewno istnieje
  if (!data) {
    throw new Error("Data is undefined");
  }
  
  const profile = data.profile;
  const socialLinks = data.socialLinks;
  const featuredContents = data.featuredContents;
  const githubContributions = data.githubContributions;

  return (
    <div className={`min-h-screen ${BACKGROUND_OPTIONS[backgroundIndex].className}`}>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <ProfileHeader 
          profile={profile}
        />
        
        <SocialLinks 
          links={socialLinks} 
          onLinkClick={handleLinkClick}
        />
        
        {featuredContents.length > 0 && (
          <FeaturedContent 
            contents={featuredContents} 
            onContentClick={handleLinkClick}
          />
        )}
        
        <GithubContributions 
          profileId={profile.id} 
          username={profile.githubUsername || undefined}
          contributionData={githubContributions}
        />
        
        <ProfileSelector 
          selectedIndex={profile.imageIndex ?? 0} 
          onSelect={handleProfileImageChange} 
        />
        
        <BackgroundSelector 
          selectedIndex={backgroundIndex} 
          onSelect={handleBackgroundChange} 
        />
        
        <Footer 
          name={profile.name} 
        />
      </div>
    </div>
  );
}