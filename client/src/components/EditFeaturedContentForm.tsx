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

interface FeaturedContent {
  id: number;
  profileId: number;
  title: string;
  imageUrl: string | null;
  linkUrl: string | null;
  order: number;
}

interface EditFeaturedContentFormProps {
  profileId: number;
  content?: FeaturedContent; // Jeśli przekazane, edytujemy istniejącą treść
  onSuccess: () => void;
  onCancel: () => void;
}

const featuredContentSchema = z.object({
  title: z.string().min(2, { message: 'Tytuł musi zawierać min. 2 znaki' }),
  description: z.string().min(5, { message: 'Opis musi zawierać min. 5 znaków' }).optional(),
  linkUrl: z.string().url({ message: 'Wprowadź poprawny adres URL' }).nullable(),
  imageUrl: z.string().url({ message: 'Wprowadź poprawny adres URL obrazu' }).nullable(),
});

type FeaturedContentFormValues = z.infer<typeof featuredContentSchema>;

export function EditFeaturedContentForm({ profileId, content, onSuccess, onCancel }: EditFeaturedContentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditing = !!content;

  const form = useForm<FeaturedContentFormValues>({
    resolver: zodResolver(featuredContentSchema),
    defaultValues: {
      title: content?.title || '',
      description: '', // Opcjonalne pole
      linkUrl: content?.linkUrl || null,
      imageUrl: content?.imageUrl || null,
    },
  });

  const onSubmit = async (values: FeaturedContentFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing && content) {
        // Aktualizacja istniejącej treści
        await apiRequest(`/api/featured-contents/${content.id}`, {
          method: 'PATCH',
          body: JSON.stringify(values),
        });

        toast({
          title: 'Treść zaktualizowana',
          description: `Treść "${values.title}" została pomyślnie zaktualizowana`,
        });
      } else {
        // Dodanie nowej treści
        await apiRequest(`/api/profile/${profileId}/featured-contents`, {
          method: 'POST',
          body: JSON.stringify({
            ...values,
            order: 999, // domyślna wartość, serwer ustawi właściwą kolejność
          }),
        });

        toast({
          title: 'Treść dodana',
          description: `Treść "${values.title}" została pomyślnie dodana`,
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Błąd przy zapisywaniu treści:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zapisać treści',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !content) return;
    
    if (!confirm(`Czy na pewno chcesz usunąć treść "${content.title}"?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest(`/api/featured-contents/${content.id}`, {
        method: 'DELETE',
      });

      toast({
        title: 'Treść usunięta',
        description: `Treść "${content.title}" została pomyślnie usunięta`,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Błąd przy usuwaniu treści:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć treści',
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tytuł</FormLabel>
              <FormControl>
                <Input placeholder="Mój artykuł..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opis</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Krótki opis treści..." 
                  {...field} 
                  className="min-h-[80px]"
                />
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
                <Input placeholder="https://example.com/article" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL obrazu (opcjonalnie)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/image.jpg" 
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

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Zapisywanie...' : isEditing ? 'Zapisz zmiany' : 'Dodaj treść'}
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