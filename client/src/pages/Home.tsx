import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";

import ProfileHeader from "@/components/ProfileHeader";
import SocialLinks from "@/components/SocialLinks";
import FeaturedContent from "@/components/FeaturedContent";
import ProfileSelector from "@/components/ProfileSelector";
import BackgroundSelector from "@/components/BackgroundSelector";
import Footer from "@/components/Footer";
import { BACKGROUND_OPTIONS } from "@/lib/constants";

import { type Profile, type SocialLink, type FeaturedContent as FeaturedContentType } from "@shared/schema";

export default function Home() {
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  // Fetch profile data
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/profile"],
  });

  // Update background mutation
  const updateBackgroundMutation = useMutation({
    mutationFn: async (backgroundIndex: number) => {
      const profileId = data?.profile?.id;
      if (!profileId) return null;
      
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
      const profileId = data?.profile?.id;
      if (!profileId) return null;
      
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
    if (data?.profile) {
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
