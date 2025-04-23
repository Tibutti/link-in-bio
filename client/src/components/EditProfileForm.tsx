import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

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

interface EditProfileFormProps {
  profile: Profile;
  onSuccess: () => void;
}

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Imię i nazwisko musi zawierać min. 2 znaki' }),
  bio: z.string().min(10, { message: 'Bio musi zawierać min. 10 znaków' }),
  location: z.string().min(2, { message: 'Lokalizacja musi zawierać min. 2 znaki' }),
  githubUsername: z.string().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function EditProfileForm({ profile, onSuccess }: EditProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      bio: profile.bio,
      location: profile.location,
      githubUsername: profile.githubUsername,
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/profile/${profile.id}`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });

      toast({
        title: 'Profil zaktualizowany',
        description: 'Twoje dane zostały pomyślnie zaktualizowane',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Błąd przy aktualizacji profilu:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować profilu',
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imię i nazwisko</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Twój opis..." 
                  {...field} 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lokalizacja</FormLabel>
              <FormControl>
                <Input placeholder="New York, USA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="githubUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa użytkownika GitHub</FormLabel>
              <FormControl>
                <Input 
                  placeholder="octacat" 
                  {...field} 
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value.trim() === '' ? null : e.target.value;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </Button>
      </form>
    </Form>
  );
}