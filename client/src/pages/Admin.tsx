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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditProfileForm } from '@/components/EditProfileForm';
import { EditSocialLinkForm } from '@/components/EditSocialLinkForm';
import { EditFeaturedContentForm } from '@/components/EditFeaturedContentForm';
import { Plus } from 'lucide-react';
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

interface Profile {
  id: number;
  userId: number;
  name: string;
  bio: string;
  location: string;
  imageIndex: number;
  backgroundIndex: number;
  backgroundGradient: string | null;
  githubUsername: string | null;
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
}

interface FeaturedContent {
  id: number;
  profileId: number;
  title: string;
  linkUrl: string | null;
  imageUrl: string | null;
  order: number;
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
      // Pobierz dane profilu
      const userDataStr = localStorage.getItem('userData');
      if (!userDataStr) return;
      
      const userData = JSON.parse(userDataStr);
      const profileId = userData.profile.id;

      // Pobierz aktualny profil
      const profileData = await apiRequest<Profile>(`/api/profile/${profileId}`);
      setProfile(profileData);

      // Pobierz linki społecznościowe
      const socialLinksData = await apiRequest<SocialLink[]>(`/api/profile/${profileId}/social-links/category/social`);
      setSocialLinks(socialLinksData);

      // Pobierz linki wiedzy
      const knowledgeLinksData = await apiRequest<SocialLink[]>(`/api/profile/${profileId}/social-links/category/knowledge`);
      setKnowledgeLinks(knowledgeLinksData);

      // Pobierz treści wyróżnione
      const featuredContentsData = await apiRequest<FeaturedContent[]>(`/api/profile/${profileId}/featured-contents`);
      setFeaturedContents(featuredContentsData);

      // Pobierz statystyki
      const statsData = await apiRequest<Stats>(`/api/profile/${profileId}/social-links/stats`);
      setStats(statsData);

      // Update local storage with the latest profile data
      localStorage.setItem('userData', JSON.stringify({
        user: userData.user,
        profile: profileData
      }));
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Ładowanie danych...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Panel administracyjny</h1>
            {user && profile && (
              <p className="text-muted-foreground">
                Zalogowany jako: {user.username} | Profil: {profile.name}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Wyloguj się
          </Button>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="social">Media społecznościowe</TabsTrigger>
            <TabsTrigger value="knowledge">Platformy wiedzy</TabsTrigger>
            <TabsTrigger value="featured">Wyróżnione treści</TabsTrigger>
          </TabsList>

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
              <CardFooter className="flex gap-2">
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
                    <div className="grid gap-4 md:grid-cols-2">
                      {socialLinks.map((link) => (
                        <div 
                          key={link.id} 
                          className="rounded-lg border p-4 hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setEditingSocialLink(link);
                            setIsDialogOpen(true);
                          }}
                        >
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
                        </div>
                      ))}
                    </div>
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
                    <div className="grid gap-4 md:grid-cols-2">
                      {knowledgeLinks.map((link) => (
                        <div 
                          key={link.id} 
                          className="rounded-lg border p-4 hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setEditingSocialLink(link);
                            setIsDialogOpen(true);
                          }}
                        >
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
                        </div>
                      ))}
                    </div>
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
                    <div className="grid gap-4 md:grid-cols-2">
                      {featuredContents.map((content) => (
                        <div 
                          key={content.id} 
                          className="rounded-lg border p-4 hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => {
                            setEditingFeaturedContent(content);
                            setIsDialogOpen(true);
                          }}
                        >
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
                        </div>
                      ))}
                    </div>
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