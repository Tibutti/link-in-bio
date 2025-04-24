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
import TechnologiesSection from "@/components/TechnologiesSection";
import Footer from "@/components/Footer";
import { QuickShareButtons } from "@/components/QuickShareButtons";
import { Button } from "@/components/ui/button";
import { BACKGROUND_OPTIONS } from "@/lib/constants";

import { 
  type Profile, 
  type SocialLink, 
  type FeaturedContent as FeaturedContentType,
  type Technology
} from "@shared/schema";

export default function Home() {
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [_, setLocation] = useLocation();

  // Fetch profile data
  const { data, isLoading, isError } = useQuery<{
    profile: Profile;
    socialLinks: SocialLink[];
    featuredContents: FeaturedContentType[];
    technologies?: Technology[];
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

  // Domyślna kolejność sekcji
  const defaultSectionOrder = [
    'image',
    'contact',
    'social',
    'knowledge',
    'featured',
    'github',
    'tryhackme',
    'technologies'
  ];

  // Używamy kolejności zapisanej w profilu lub domyślnej
  // Dodajemy console.log aby zobaczyć, co otrzymujemy z API
  console.log("sectionOrder z profilu:", profile.sectionOrder);
  const sectionOrder = Array.isArray(profile.sectionOrder) ? profile.sectionOrder : defaultSectionOrder;
  
  // Funkcja renderująca sekcję na podstawie jej ID
  const renderSection = (sectionId: string) => {
    switch(sectionId) {
      case 'image':
        return profile.showImage && (
          <div key="image" className="mb-6">
            <ProfileHeader profile={profile} />
          </div>
        );
      case 'contact':
        return profile.showContact && (
          <div key="contact" className="mb-6">
            <ContactDetails 
              email={profile.email || ""}
              phone={profile.phone || ""}
              cvUrl={profile.cvUrl || ""}
            />
          </div>
        );
      case 'social':
        return profile.showSocial && (
          <div key="social" className="mb-6">
            <SocialLinks 
              links={socialLinks.filter(link => link.isVisible && link.category === 'social')} 
              onLinkClick={handleLinkClick}
            />
          </div>
        );
      case 'knowledge':
        return profile.showKnowledge && (
          <div key="knowledge" className="mb-6">
            <SocialLinks 
              links={socialLinks.filter(link => link.isVisible && link.category === 'knowledge')} 
              onLinkClick={handleLinkClick}
            />
          </div>
        );
      case 'featured':
        return profile.showFeatured && featuredContents.length > 0 && (
          <div key="featured" className="mb-6">
            <FeaturedContent 
              contents={featuredContents.filter(content => content.isVisible)} 
              onContentClick={handleLinkClick}
            />
          </div>
        );
      case 'github':
        return profile.showGithubStats && (
          <div key="github" className="mb-6">
            <GitHubStats profile={profile} />
          </div>
        );
      case 'tryhackme':
        return profile.showTryHackMe && (
          <div key="tryhackme" className="mb-6">
            <TryHackMeBadge userId={profile.tryHackMeUserId || undefined} />
          </div>
        );
      case 'technologies':
        return profile.showTechnologies && (
          <div key="technologies" className="mb-6">
            <TechnologiesSection 
              profileId={profile.id} 
              showTechnologies={profile.showTechnologies} 
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${BACKGROUND_OPTIONS[backgroundIndex].className}`}>
      <QuickShareButtons 
        title={`Profil ${profile.name}`} 
      />
      
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="secondary"
          className="shadow-md hover:shadow-lg transition-shadow"
          onClick={() => setLocation('/login')}
        >
          Panel administracyjny
        </Button>
      </div>
      
      <main className="outline-none">
        <div className="container mx-auto px-4 py-10 max-w-2xl">
          {/* Renderujemy sekcje zgodnie z ustawioną kolejnością */}
          {sectionOrder.map(sectionId => renderSection(sectionId))}
          
          {/* Zawsze wyświetlamy selektory i stopkę na końcu */}
          <div className="mt-10">
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
      </main>
    </div>
  );
}