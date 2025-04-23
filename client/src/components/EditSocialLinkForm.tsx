import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface EditSocialLinkFormProps {
  profileId: number;
  link?: SocialLink; // Jeśli przekazane, edytujemy istniejący link
  category: 'social' | 'knowledge';
  onSuccess: () => void;
  onCancel: () => void;
}

const socialPlatforms = [
  { name: 'Instagram', icon: 'instagram' },
  { name: 'X', icon: 'x' },
  { name: 'Facebook', icon: 'facebook' },
  { name: 'WhatsApp', icon: 'whatsapp' },
  { name: 'Telegram', icon: 'telegram' },
  { name: 'LinkedIn', icon: 'linkedin' },
  { name: 'YouTube', icon: 'youtube' },
  { name: 'TikTok', icon: 'tiktok' },
];

const knowledgePlatforms = [
  { name: 'Medium', icon: 'medium' },
  { name: 'Substack', icon: 'substack' },
  { name: 'Dev.to', icon: 'devto' },
  { name: 'Hashnode', icon: 'hashnode' },
  { name: 'Stack Overflow', icon: 'stackoverflow' },
  { name: 'Behance', icon: 'behance' },
  { name: 'GitHub', icon: 'github' },
  { name: 'Dribbble', icon: 'dribbble' },
];

const socialLinkSchema = z.object({
  platform: z.string().min(1, { message: 'Wybierz platformę' }),
  username: z.string().min(1, { message: 'Wprowadź nazwę użytkownika' }),
  url: z.string().url({ message: 'Wprowadź poprawny adres URL' }),
  isVisible: z.boolean().default(true),
});

type SocialLinkFormValues = z.infer<typeof socialLinkSchema>;

export function EditSocialLinkForm({ profileId, link, category, onSuccess, onCancel }: EditSocialLinkFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!link;
  const platformsList = category === 'social' ? socialPlatforms : knowledgePlatforms;

  const form = useForm<SocialLinkFormValues>({
    resolver: zodResolver(socialLinkSchema),
    defaultValues: {
      platform: link?.platform || '',
      username: link?.username || '',
      url: link?.url || '',
      isVisible: link?.isVisible !== undefined ? link.isVisible : true,
    },
  });

  const onSubmit = async (values: SocialLinkFormValues) => {
    setIsSubmitting(true);
    try {
      const selectedPlatform = platformsList.find(p => p.name === values.platform);
      const iconName = selectedPlatform?.icon || values.platform.toLowerCase();
      
      const data = {
        ...values,
        iconName,
        category,
      };

      if (isEditing && link) {
        // Aktualizacja istniejącego linku
        await apiRequest(`/api/social-links/${link.id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });

        toast({
          title: 'Link zaktualizowany',
          description: `Link do ${values.platform} został pomyślnie zaktualizowany`,
        });
      } else {
        // Dodanie nowego linku
        await apiRequest(`/api/profile/${profileId}/social-links`, {
          method: 'POST',
          body: JSON.stringify({
            ...data,
            order: 999, // domyślna wartość, serwer ustawi właściwą kolejność
          }),
        });

        toast({
          title: 'Link dodany',
          description: `Link do ${values.platform} został pomyślnie dodany`,
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Błąd przy zapisywaniu linku:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zapisać linku',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !link) return;
    
    if (!confirm(`Czy na pewno chcesz usunąć link do ${link.platform}?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest(`/api/social-links/${link.id}`, {
        method: 'DELETE',
      });

      toast({
        title: 'Link usunięty',
        description: `Link do ${link.platform} został pomyślnie usunięty`,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Błąd przy usuwaniu linku:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć linku',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platforma</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz platformę" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {platformsList.map((platform) => (
                    <SelectItem key={platform.name} value={platform.name}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa użytkownika</FormLabel>
              <FormControl>
                <Input placeholder="@janedoe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://platform.com/username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isVisible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Widoczność</FormLabel>
                <FormDescription>
                  Czy link ma być widoczny na stronie głównej?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Zapisywanie...' : isEditing ? 'Zapisz zmiany' : 'Dodaj link'}
          </Button>
          
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
          
          {isEditing && (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Usuń
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}