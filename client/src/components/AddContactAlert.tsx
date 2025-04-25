import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

/**
 * Komponent wyświetlający alert dodawania kontaktu po przeskanowaniu kodu QR
 * Komponent sprawdza czy w URL są parametry ?profile=XXX&add_contact=true
 * i wyświetla dialog potwierdzenia dodania kontaktu
 */
export function AddContactAlert() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  
  // Sprawdzenie parametrów URL w momencie ładowania komponentu
  useEffect(() => {
    const url = new URL(window.location.href);
    const profileIdParam = url.searchParams.get('profile');
    const addContactParam = url.searchParams.get('add_contact');
    
    if (profileIdParam && addContactParam === 'true') {
      setProfileId(profileIdParam);
      setIsOpen(true);
      
      // Usuń parametry z URL, ale zachowaj profileId do wyświetlenia
      url.searchParams.delete('add_contact');
      const newUrl = url.pathname + (url.search !== '?' ? url.search : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);
  
  // Pobierz dane profilu kontaktu
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: [`/api/profile/${profileId}`],
    queryFn: async () => {
      if (!profileId) return null;
      return apiRequest(`/api/profile/${profileId}`);
    },
    enabled: !!profileId && isOpen,
  });
  
  // Mutacja dodawania kontaktu
  const addContactMutation = useMutation({
    mutationFn: async () => {
      if (!profileId || !user) return null;
      
      return apiRequest('/api/contacts', {
        method: 'POST',
        body: JSON.stringify({
          contactProfileId: Number(profileId),
          name: profileData?.name || 'Unknown',
          category: 'Business',
          notes: '',
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: t('contacts.contact_added'),
        description: t('contacts.contact_added_success'),
      });
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    },
    onError: (error) => {
      toast({
        title: t('contacts.contact_add_error'),
        description: error.message,
        variant: 'destructive',
      });
      setIsOpen(false);
    },
  });
  
  const handleAddContact = () => {
    if (!user) {
      toast({
        title: t('auth.login_required'),
        description: t('auth.login_required_to_add_contacts'),
        variant: 'destructive',
      });
      setIsOpen(false);
      setLocation('/login?redirect=/');
      return;
    }
    
    addContactMutation.mutate();
  };
  
  const handleCancel = () => {
    setIsOpen(false);
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('contacts.add_to_contacts')}</AlertDialogTitle>
          <AlertDialogDescription>
            {isLoadingProfile ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : profileData ? (
              <>
                {t('contacts.add_contact_confirmation', { name: profileData.name })}
                <div className="mt-2 text-sm text-gray-700">
                  {profileData.bio && (
                    <p className="line-clamp-2">{profileData.bio}</p>
                  )}
                  {profileData.location && (
                    <p className="mt-1 font-medium">{profileData.location}</p>
                  )}
                </div>
              </>
            ) : (
              t('contacts.profile_not_found')
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleAddContact}
            disabled={isLoadingProfile || addContactMutation.isPending}
          >
            {addContactMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              t('contacts.add_contact')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}