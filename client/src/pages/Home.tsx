import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

import ProfileHeader from "@/components/ProfileHeader";
import SocialLinks from "@/components/SocialLinks";
import FeaturedContent from "@/components/FeaturedContent";
import ProfileSelector from "@/components/ProfileSelector";
import BackgroundSelector from "@/components/BackgroundSelector";
import GitHubStats from "@/components/GitHubStats";
import TryHackMeBadge from "@/components/TryHackMeBadge";
import ContactDetails from "@/components/ContactDetails";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BACKGROUND_OPTIONS } from "@/lib/constants";

import { 
  type Profile, 
  type SocialLink, 
  type FeaturedContent as FeaturedContentType
} from "@shared/schema";

export default function Home() {
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [_, setLocation] = useLocation();

  // Fetch profile data
  const { data, isLoading, isError } = useQuery<{
    profile: Profile;
    socialLinks: SocialLink[];
    featuredContents: FeaturedContentType[];
  }>({
    queryKey: ["/api/profile"],
  });

  // Update background mutation
  const updateBackgroundMutation = useMutation({
    mutationFn: async (backgroundIndex: number) => {
      if (!data || !data.profile || data.profile.id === undefined) return null;
      const profileId = data.profile.id;
      
      return apiRequest(`/api/profile/${profileId}/background`, { 
        method: 'PATCH',
        body: JSON.stringify({ backgroundIndex })
      });
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
      
      return apiRequest(`/api/profile/${profileId}/image`, {
        method: 'PATCH',
        body: JSON.stringify({ imageIndex })
      });
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

  return (
    <div className={`min-h-screen ${BACKGROUND_OPTIONS[backgroundIndex].className}`}>
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="secondary"
          className="shadow-md hover:shadow-lg transition-shadow"
          onClick={() => setLocation('/login')}
        >
          Panel administracyjny
        </Button>
      </div>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <ProfileHeader 
          profile={profile}
        />
        
        {profile.showContact && (
          <ContactDetails 
            email={profile.email || ""}
            phone={profile.phone || ""}
          />
        )}
        
        {profile.showSocial && (
          <SocialLinks 
            links={socialLinks.filter(link => link.isVisible && link.category === 'social')} 
            onLinkClick={handleLinkClick}
          />
        )}
        
        {profile.showKnowledge && (
          <SocialLinks 
            links={socialLinks.filter(link => link.isVisible && link.category === 'knowledge')} 
            onLinkClick={handleLinkClick}
          />
        )}
        
        {profile.showFeatured && featuredContents.length > 0 && (
          <FeaturedContent 
            contents={featuredContents.filter(content => content.isVisible)} 
            onContentClick={handleLinkClick}
          />
        )}
        
        {profile.showGithubStats && profile.githubUsername && (
          <GitHubStats 
            profile={profile} 
          />
        )}
        
        {profile.showTryHackMe && profile.tryHackMeUserId && (
          <TryHackMeBadge 
            userId={profile.tryHackMeUserId} 
          />
        )}
        
        {profile.showImage && (
          <ProfileSelector 
            selectedIndex={profile.imageIndex ?? 0} 
            onSelect={handleProfileImageChange} 
          />
        )}
        
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