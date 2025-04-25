import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Loader2, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Profile {
  id: number;
  name: string;
  bio?: string;
  email?: string;
  phone?: string;
  position?: string;
  cvUrl?: string;
}

interface AddContactAlertProps {
  profileId: number;
}

export function AddContactAlert({ profileId }: AddContactAlertProps) {
  const [open, setOpen] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Sprawdzamy, czy QR kod zawiera parametr add_contact
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldAddContact = urlParams.get('add_contact') === 'true';
    
    if (shouldAddContact && user && profileId) {
      setOpen(true);
      // Usuwamy parametr z URL bez odświeżania strony
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [user, profileId]);

  // Pobieranie danych profilu
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: [`/api/profile/${profileId}`],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${profileId}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: open && !!profileId,
  });

  // Mutacja dodawania kontaktu
  const addContactMutation = useMutation({
    mutationFn: async (profileData: Profile) => {
      const contactData = {
        name: profileData.name,
        email: profileData.email || "",
        phone: profileData.phone || "",
        position: profileData.position || "",
        company: "",
        notes: profileData.bio || "",
        category: "Business",
        profileId: profileData.id,
      };
      
      const res = await apiRequest("POST", "/api/contacts", contactData);
      if (!res.ok) throw new Error("Failed to add contact");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t('contacts.contact_added'),
        description: t('contacts.contact_added_success'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: t('contacts.contact_add_error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddContact = () => {
    if (profileData?.profile) {
      addContactMutation.mutate(profileData.profile);
    }
  };

  const isLoading = isAuthLoading || isProfileLoading || addContactMutation.isPending;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('contacts.add_contact_title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isProfileLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              profileData?.profile && (
                <>
                  {t('contacts.add_contact_description', { name: profileData.profile.name })}
                </>
              )
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction 
            disabled={isLoading || !profileData?.profile} 
            onClick={handleAddContact}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            {t('contacts.add_to_contacts')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}