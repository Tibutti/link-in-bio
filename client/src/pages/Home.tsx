import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";

import ProfileHeader from "@/components/ProfileHeader";
import SocialLinks from "@/components/SocialLinks";
import FeaturedContent from "@/components/FeaturedContent";
import GithubContributions from "@/components/GithubContributions";
import ProfileSelector from "@/components/ProfileSelector";
import BackgroundSelector from "@/components/BackgroundSelector";
import GradientGenerator from "@/components/GradientGenerator";
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

  const profile = data.profile as Profile;
  const socialLinks = data.socialLinks as SocialLink[];
  const featuredContents = data.featuredContents as FeaturedContentType[];
  const githubContributions = data.githubContributions as GithubContribution | undefined;

  // Decide which background style to use - gradient or preset
  const getBackgroundStyle = () => {
    // If custom gradient is set, use it
    if (profile.backgroundGradient) {
      const { colorFrom, colorTo, direction } = profile.backgroundGradient;
      const directionValue = 
        direction === "to-r" ? "to right" :
        direction === "to-l" ? "to left" :
        direction === "to-b" ? "to bottom" :
        direction === "to-t" ? "to top" :
        direction === "to-tr" ? "to top right" :
        direction === "to-tl" ? "to top left" :
        direction === "to-br" ? "to bottom right" :
        "to bottom left";
        
      return {
        background: `linear-gradient(${directionValue}, ${colorFrom}, ${colorTo})`,
      };
    }
    
    // Otherwise use preset background
    return {}; // Empty style, will use className instead
  };

  return (
    <div 
      className={`min-h-screen ${profile.backgroundGradient ? '' : BACKGROUND_OPTIONS[backgroundIndex].className}`}
      style={getBackgroundStyle()}
    >
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
        
        {/* Add Gradient Generator component */}
        <GradientGenerator profile={profile} />
        
        <ProfileSelector 
          selectedIndex={profile.imageIndex} 
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
