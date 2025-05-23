import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent,
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import ErrorTestButton from '@/components/ErrorTestButton';
import SentryTestPanel from '@/components/SentryTestPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditProfileForm } from '@/components/EditProfileForm';
import { EditSocialLinkForm } from '@/components/EditSocialLinkForm';
import { EditFeaturedContentForm } from '@/components/EditFeaturedContentForm';
import { ContactDetailsForm } from '@/components/ContactDetailsForm';
import { GitHubSettingsForm } from '@/components/GitHubSettingsForm';
import { TryHackMeSettingsForm } from '@/components/TryHackMeSettingsForm';
import { SectionVisibilityForm } from '@/components/SectionVisibilityForm';
import ProfileImageUploader from '@/components/ProfileImageUploader';
import { SortableList } from '@/components/SortableList';
import TechnologiesAdminPanel from '@/components/TechnologiesAdminPanel';
import IssuesTable from '@/components/admin/IssuesTable';
import { ContactsAdminPanel } from '@/components/admin/ContactsAdminPanel';
import IssueAiAnalyzer from '@/components/admin/IssueAiAnalyzer';
import BackgroundGradientManager from '@/components/admin/BackgroundGradientManager';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Plus, GripVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface User {
  id: number;
  username: string;
}

interface GradientSettings {
  colorFrom: string;
  colorTo: string;
  direction: string;
}

interface Profile {
  id: number;
  userId: number;
  name: string;
  bio: string;
  location: string;
  email: string | null;
  phone: string | null;
  cvUrl: string | null;
  imageIndex: number;
  customImageUrl: string | null;
  backgroundIndex: number;
  backgroundGradient: GradientSettings | null;
  githubUsername: string | null;
  tryHackMeUserId: string | null;
  showGithubStats: boolean;
  showTryHackMe: boolean;
  showImage: boolean;
  showContact: boolean;
  showSocial: boolean;
  showKnowledge: boolean;
  showFeatured: boolean;
  showTechnologies: boolean;
  sectionOrder: string[] | null;
}

interface SocialLink {
  id: number;
  profileId: number;
  platform: string;
  username: string;
  url: string;
  iconName: string;
  order: number;
  category: string;
  isVisible: boolean;
}

interface FeaturedContent {
  id: number;
  profileId: number;
  title: string;
  linkUrl: string | null;
  imageUrl: string | null;
  order: number;
  isVisible: boolean;
}

interface Stats {
  total: number;
  socialCount: number;
  knowledgeCount: number;
  categories: Record<string, number>;
}

export default function Admin() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [knowledgeLinks, setKnowledgeLinks] = useState<SocialLink[]>([]);
  const [featuredContents, setFeaturedContents] = useState<FeaturedContent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingSocialLink, setEditingSocialLink] = useState<SocialLink | null>(null);
  const [editingFeaturedContent, setEditingFeaturedContent] = useState<FeaturedContent | null>(null);
  const [showAddSocialForm, setShowAddSocialForm] = useState(false);
  const [showAddKnowledgeForm, setShowAddKnowledgeForm] = useState(false);
  const [showAddFeaturedForm, setShowAddFeaturedForm] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (!token || !userData) {
        setLocation('/login');
        return false;
      }
      
      try {
        const parsedData = JSON.parse(userData);
        setUser(parsedData.user);
        setProfile(parsedData.profile);
        return true;
      } catch (e) {
        setLocation('/login');
        return false;
      }
    };

    const isAuth = checkAuth();
    if (isAuth) {
      loadData();
    }
  }, [setLocation]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Pobierz dane użytkownika
      const userDataStr = localStorage.getItem('userData');
      if (!userDataStr) return;
      
      const userData = JSON.parse(userDataStr);
      const userId = userData.user.id;
      
      // Pobierz aktualny profil na podstawie ID użytkownika
      const profileData = await apiRequest<Profile>(`/api/profile/user/${userId}`);
      setProfile(profileData);
      
      // Aktualizuj localStorage z aktualnym profilem
      localStorage.setItem('userData', JSON.stringify({
        user: userData.user,
        profile: profileData
      }));

      // Pobierz linki społecznościowe
      const socialLinksData = await apiRequest<SocialLink[]>(`/api/profile/${profileData.id}/social-links/category/social`);
      setSocialLinks(socialLinksData);

      // Pobierz linki wiedzy
      const knowledgeLinksData = await apiRequest<SocialLink[]>(`/api/profile/${profileData.id}/social-links/category/knowledge`);
      setKnowledgeLinks(knowledgeLinksData);

      // Pobierz treści wyróżnione
      const featuredContentsData = await apiRequest<FeaturedContent[]>(`/api/profile/${profileData.id}/featured-contents`);
      setFeaturedContents(featuredContentsData);

      // Pobierz statystyki
      const statsData = await apiRequest<Stats>(`/api/profile/${profileData.id}/social-links/stats`);
      setStats(statsData);
    } catch (error) {
      console.error('Błąd podczas ładowania danych:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się załadować danych profilu',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Błąd podczas wylogowywania:', e);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setLocation('/login');
      toast({
        title: 'Wylogowano',
        description: 'Zostałeś pomyślnie wylogowany',
      });
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingSocialLink(null);
    setEditingFeaturedContent(null);
    setShowAddSocialForm(false);
    setShowAddKnowledgeForm(false);
    setShowAddFeaturedForm(false);
  };

  const handleFormSuccess = () => {
    loadData();
    closeDialog();
  };
  
  // Funkcja obsługująca zmianę kolejności linków społecznościowych
  const handleReorderSocialLinks = async (links: SocialLink[], category: 'social' | 'knowledge') => {
    if (!profile) return;
    
    try {
      const orderedIds = links.map(link => link.id);
      
      // Zaktualizuj lokalny stan tymczasowo
      if (category === 'social') {
        setSocialLinks(links);
      } else {
        setKnowledgeLinks(links);
      }
      
      // Wyślij żądanie do serwera
      await apiRequest(`/api/profile/${profile.id}/social-links/category/${category}/reorder`, {
        method: 'POST',
        body: JSON.stringify({ orderedIds })
      });
      
      toast({
        title: 'Sukces',
        description: 'Kolejność linków została zaktualizowana',
      });
    } catch (error) {
      console.error('Błąd podczas zmiany kolejności linków:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zmienić kolejności linków',
        variant: 'destructive',
      });
      
      // Cofnij zmiany lokalne w przypadku błędu
      loadData();
    }
  };
  
  // Funkcja obsługująca zmianę kolejności wyróżnionych treści
  const handleReorderFeaturedContents = async (contents: FeaturedContent[]) => {
    if (!profile) return;
    
    try {
      const orderedIds = contents.map(content => content.id);
      
      // Zaktualizuj lokalny stan tymczasowo
      setFeaturedContents(contents);
      
      // Wyślij żądanie do serwera
      await apiRequest(`/api/profile/${profile.id}/featured-contents/reorder`, {
        method: 'POST',
        body: JSON.stringify({ orderedIds })
      });
      
      toast({
        title: 'Sukces',
        description: 'Kolejność treści została zaktualizowana',
      });
    } catch (error) {
      console.error('Błąd podczas zmiany kolejności treści:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zmienić kolejności treści',
        variant: 'destructive',
      });
      
      // Cofnij zmiany lokalne w przypadku błędu
      loadData();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Ładowanie danych...</p>
      </div>
    );
  }

  // Generowanie stylu gradientu dla tła
  const getGradientStyle = () => {
    if (!profile || !profile.backgroundGradient) return {};
    
    const { colorFrom, colorTo, direction } = profile.backgroundGradient;
    
    return {
      background: `linear-gradient(${
        direction === "to-r" ? "to right" :
        direction === "to-l" ? "to left" :
        direction === "to-b" ? "to bottom" :
        direction === "to-t" ? "to top" :
        direction === "to-tr" ? "to top right" :
        direction === "to-tl" ? "to top left" :
        direction === "to-br" ? "to bottom right" :
        "to bottom left"
      }, ${colorFrom}, ${colorTo})`,
    };
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-8" 
      style={profile?.backgroundGradient ? getGradientStyle() : { background: "rgb(249 250 251)" }}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Panel administracyjny</h1>
            {user && profile && (
              <p className="text-sm sm:text-base text-muted-foreground">
                Zalogowany jako: {user.username} | Profil: {profile.name}
              </p>
            )}
          </div>
          <div className="flex gap-2 self-end sm:self-auto items-center">
            <ThemeToggle />
            <Button variant="secondary" size="sm" onClick={() => setLocation('/')}>
              Strona główna
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Wyloguj się
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile">
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <TabsList className="inline-flex flex-nowrap min-w-full">
              <TabsTrigger value="profile" className="whitespace-nowrap">Profil</TabsTrigger>
              <TabsTrigger value="avatar" className="whitespace-nowrap">Zdjęcie</TabsTrigger>
              <TabsTrigger value="background" className="whitespace-nowrap">Tło</TabsTrigger>
              <TabsTrigger value="contact" className="whitespace-nowrap">Kontakt</TabsTrigger>
              <TabsTrigger value="integrations" className="whitespace-nowrap">Integracje</TabsTrigger>
              <TabsTrigger value="visibility" className="whitespace-nowrap">Widoczność</TabsTrigger>
              <TabsTrigger value="social" className="whitespace-nowrap">Media</TabsTrigger>
              <TabsTrigger value="knowledge" className="whitespace-nowrap">Platformy</TabsTrigger>
              <TabsTrigger value="featured" className="whitespace-nowrap">Treści</TabsTrigger>
              <TabsTrigger value="technologies" className="whitespace-nowrap">Technologie</TabsTrigger>
              <TabsTrigger value="contacts" className="whitespace-nowrap text-blue-600 font-semibold">Wizytownik</TabsTrigger>
              <TabsTrigger value="issues" className="whitespace-nowrap text-red-600 font-semibold">Usterki</TabsTrigger>
              <TabsTrigger value="issues-ai" className="whitespace-nowrap text-purple-600 font-semibold">Analiza AI</TabsTrigger>
              <TabsTrigger value="diagnostics" className="whitespace-nowrap text-orange-500 font-semibold">Diagnostyka</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Informacje o profilu</CardTitle>
                <CardDescription>
                  Podstawowe informacje o Twoim profilu
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile && !isEditingProfile ? (
                  <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Imię i nazwisko</dt>
                      <dd className="text-lg">{profile.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Lokalizacja</dt>
                      <dd className="text-lg">{profile.location}</dd>
                    </div>
                    <div className="col-span-full">
                      <dt className="text-sm font-medium text-gray-500">Bio</dt>
                      <dd className="text-lg whitespace-pre-line">{profile.bio}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">GitHub</dt>
                      <dd className="text-lg">{profile.githubUsername || 'Nie ustawiono'}</dd>
                    </div>
                  </dl>
                ) : profile && isEditingProfile ? (
                  <EditProfileForm 
                    profile={profile} 
                    onSuccess={() => {
                      loadData();
                      setIsEditingProfile(false);
                    }} 
                  />
                ) : null}
              </CardContent>
              <CardFooter className="flex gap-2 flex-wrap">
                {!isEditingProfile ? (
                  <>
                    <Button onClick={() => setIsEditingProfile(true)}>
                      Edytuj profil
                    </Button>
                    <Button variant="outline" onClick={() => loadData()}>
                      Odśwież dane
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                    Anuluj edycję
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="avatar" className="mt-4">
            {profile && (
              <ProfileImageUploader
                profileId={profile.id}
                currentImageIndex={profile.imageIndex}
                customImageUrl={profile.customImageUrl}
                onImageChange={(data) => {
                  // Aktualizujemy profil lokalnie aby uniknąć konieczności przeładowania strony
                  setProfile({
                    ...profile,
                    ...(data.imageIndex !== undefined && { imageIndex: data.imageIndex }),
                    ...(data.customImageUrl !== undefined && { customImageUrl: data.customImageUrl })
                  });
                  // Dodatkowo przeładujemy dane z serwera dla pewności
                  loadData();
                }}
              />
            )}
          </TabsContent>
          
          <TabsContent value="background" className="mt-4">
            {profile && (
              <BackgroundGradientManager
                profileId={profile.id}
                backgroundGradient={profile.backgroundGradient}
                onSuccess={loadData}
              />
            )}
          </TabsContent>
          
          <TabsContent value="contact" className="mt-4">
            {profile && (
              <ContactDetailsForm
                profileId={profile.id}
                email={profile.email || ""}
                phone={profile.phone || ""}
                onSuccess={() => {
                  loadData();
                }}
              />
            )}
          </TabsContent>
          
          <TabsContent value="technologies" className="mt-4">
            {profile && (
              <TechnologiesAdminPanel profileId={profile.id} />
            )}
          </TabsContent>

          <TabsContent value="issues" className="mt-4">
            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Usterki</CardTitle>
                  <CardDescription>
                    Zarządzaj zgłoszonymi usterkami i błędami
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <IssuesTable profileId={profile.id} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="issues-ai" className="mt-4">
            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-600">Analiza usterek przez AI</CardTitle>
                  <CardDescription>
                    Analizuj zgłoszone usterki, otrzymuj sugestie rozwiązań i zarządzaj nimi z pomocą sztucznej inteligencji
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <IssueAiAnalyzer />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="mt-4">
            {profile && (
              <ContactsAdminPanel />
            )}
          </TabsContent>

          <TabsContent value="diagnostics" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-500">Diagnostyka</CardTitle>
                <CardDescription>
                  Narzędzia diagnostyczne i testowe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SentryTestPanel />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations" className="mt-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Integracje zewnętrzne</CardTitle>
                  <CardDescription>
                    Zarządzaj integracjami z platformami zewnętrznymi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {profile && (
                      <>
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-4">GitHub</h3>
                          <GitHubSettingsForm
                            profileId={profile.id}
                            githubUsername={profile.githubUsername || ""}
                            showGithubStats={profile.showGithubStats}
                            onSuccess={() => {
                              loadData();
                            }}
                          />
                        </div>
                        
                        <div className="pt-6 border-t">
                          <h3 className="text-lg font-semibold mb-4">TryHackMe</h3>
                          <TryHackMeSettingsForm
                            profileId={profile.id}
                            tryHackMeUserId={profile.tryHackMeUserId || ""}
                            showTryHackMe={profile.showTryHackMe || false}
                            onSuccess={() => {
                              loadData();
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="visibility" className="mt-4">
            {profile && (
              <SectionVisibilityForm
                profileId={profile.id}
                showImage={profile.showImage}
                showContact={profile.showContact}
                showSocial={profile.showSocial}
                showKnowledge={profile.showKnowledge}
                showFeatured={profile.showFeatured}
                showTryHackMe={profile.showTryHackMe || false}
                showTechnologies={profile.showTechnologies || false}
                showGithubStats={profile.showGithubStats || false}
                sectionOrder={profile.sectionOrder || undefined}
                onSuccess={() => {
                  loadData();
                }}
              />
            )}
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Media społecznościowe</CardTitle>
                  <CardDescription>
                    Lista Twoich profili w mediach społecznościowych
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen && (!!editingSocialLink || showAddSocialForm)} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="ml-auto flex items-center gap-1"
                      onClick={() => {
                        setEditingSocialLink(null);
                        setShowAddSocialForm(true);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Plus size={16} /> Dodaj nowy
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingSocialLink ? 'Edytuj link' : 'Dodaj nowy link'}
                      </DialogTitle>
                    </DialogHeader>
                    {profile && (showAddSocialForm || editingSocialLink) && (
                      <EditSocialLinkForm
                        profileId={profile.id}
                        link={editingSocialLink || undefined}
                        category="social"
                        onSuccess={handleFormSuccess}
                        onCancel={closeDialog}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {socialLinks.length > 0 ? (
                    <SortableList 
                      items={socialLinks}
                      onReorder={(items) => handleReorderSocialLinks(items, 'social')}
                      className="grid gap-4 md:grid-cols-2"
                      renderItem={(link) => (
                        <div 
                          className="rounded-lg border p-4 hover:border-primary/50 transition-colors cursor-pointer relative"
                          onClick={() => {
                            setEditingSocialLink(link);
                            setIsDialogOpen(true);
                          }}
                        >
                          <div className="absolute top-2 right-2 text-gray-400">
                            <GripVertical size={16} />
                          </div>
                          <h3 className="text-lg font-medium">{link.platform}</h3>
                          <p className="text-sm text-muted-foreground">{link.username}</p>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {link.url}
                          </a>
                          {!link.isVisible && (
                            <div className="mt-2 text-xs text-gray-500 italic">
                              (Ukryty)
                            </div>
                          )}
                        </div>
                      )}
                    />
                  ) : (
                    <p>Brak linków do mediów społecznościowych.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Platformy wiedzy</CardTitle>
                  <CardDescription>
                    Lista Twoich profili na platformach dzielenia się wiedzą
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen && (!!editingSocialLink || showAddKnowledgeForm)} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="ml-auto flex items-center gap-1"
                      onClick={() => {
                        setEditingSocialLink(null);
                        setShowAddKnowledgeForm(true);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Plus size={16} /> Dodaj nowy
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingSocialLink ? 'Edytuj link' : 'Dodaj nowy link'}
                      </DialogTitle>
                    </DialogHeader>
                    {profile && (showAddKnowledgeForm || editingSocialLink) && (
                      <EditSocialLinkForm
                        profileId={profile.id}
                        link={editingSocialLink || undefined}
                        category="knowledge"
                        onSuccess={handleFormSuccess}
                        onCancel={closeDialog}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {knowledgeLinks.length > 0 ? (
                    <SortableList 
                      items={knowledgeLinks}
                      onReorder={(items) => handleReorderSocialLinks(items, 'knowledge')}
                      className="grid gap-4 md:grid-cols-2"
                      renderItem={(link) => (
                        <div 
                          className="rounded-lg border p-4 hover:border-primary/50 transition-colors cursor-pointer relative"
                          onClick={() => {
                            setEditingSocialLink(link);
                            setIsDialogOpen(true);
                          }}
                        >
                          <div className="absolute top-2 right-2 text-gray-400">
                            <GripVertical size={16} />
                          </div>
                          <h3 className="text-lg font-medium">{link.platform}</h3>
                          <p className="text-sm text-muted-foreground">{link.username}</p>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {link.url}
                          </a>
                          {!link.isVisible && (
                            <div className="mt-2 text-xs text-gray-500 italic">
                              (Ukryty)
                            </div>
                          )}
                        </div>
                      )}
                    />
                  ) : (
                    <p>Brak linków do platform wiedzy.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="featured" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Wyróżnione treści</CardTitle>
                  <CardDescription>
                    Lista Twoich wyróżnionych treści i postów
                  </CardDescription>
                </div>
                <Dialog open={isDialogOpen && (!!editingFeaturedContent || showAddFeaturedForm)} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="ml-auto flex items-center gap-1"
                      onClick={() => {
                        setEditingFeaturedContent(null);
                        setShowAddFeaturedForm(true);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Plus size={16} /> Dodaj nową
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingFeaturedContent ? 'Edytuj treść' : 'Dodaj nową treść'}
                      </DialogTitle>
                    </DialogHeader>
                    {profile && (showAddFeaturedForm || editingFeaturedContent) && (
                      <EditFeaturedContentForm
                        profileId={profile.id}
                        content={editingFeaturedContent || undefined}
                        onSuccess={handleFormSuccess}
                        onCancel={closeDialog}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featuredContents.length > 0 ? (
                    <SortableList 
                      items={featuredContents}
                      onReorder={handleReorderFeaturedContents}
                      className="grid gap-4 md:grid-cols-2"
                      renderItem={(content) => (
                        <div 
                          className="rounded-lg border p-4 hover:border-primary/50 transition-colors cursor-pointer relative"
                          onClick={() => {
                            setEditingFeaturedContent(content);
                            setIsDialogOpen(true);
                          }}
                        >
                          <div className="absolute top-2 right-2 text-gray-400">
                            <GripVertical size={16} />
                          </div>
                          <h3 className="text-lg font-medium">{content.title}</h3>
                          {content.linkUrl && (
                            <a 
                              href={content.linkUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Zobacz treść
                            </a>
                          )}
                          {content.imageUrl && (
                            <div className="mt-2">
                              <img 
                                src={content.imageUrl} 
                                alt={content.title} 
                                className="h-20 object-cover rounded"
                              />
                            </div>
                          )}
                          {!content.isVisible && (
                            <div className="mt-2 text-xs text-gray-500 italic">
                              (Ukryty)
                            </div>
                          )}
                        </div>
                      )}
                    />
                  ) : (
                    <p>Brak wyróżnionych treści.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Statystyki profilu</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <dt className="text-sm font-medium text-gray-500">Wszystkie linki</dt>
                  <dd className="text-3xl font-bold">{stats.total}</dd>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <dt className="text-sm font-medium text-gray-500">Media społecznościowe</dt>
                  <dd className="text-3xl font-bold">{stats.socialCount}</dd>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <dt className="text-sm font-medium text-gray-500">Platformy wiedzy</dt>
                  <dd className="text-3xl font-bold">{stats.knowledgeCount}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}