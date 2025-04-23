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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const tryHackMeSettingsSchema = z.object({
  tryHackMeUserId: z.string().min(1, { message: 'Wprowadź identyfikator użytkownika TryHackMe' }),
  showTryHackMe: z.boolean().default(true),
});

type TryHackMeSettingsFormValues = z.infer<typeof tryHackMeSettingsSchema>;

interface TryHackMeSettingsFormProps {
  profileId: number;
  tryHackMeUserId: string | null;
  showTryHackMe: boolean;
  onSuccess?: () => void;
}

export function TryHackMeSettingsForm({ 
  profileId, 
  tryHackMeUserId, 
  showTryHackMe,
  onSuccess 
}: TryHackMeSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<TryHackMeSettingsFormValues>({
    resolver: zodResolver(tryHackMeSettingsSchema),
    defaultValues: {
      tryHackMeUserId: tryHackMeUserId || '',
      showTryHackMe: showTryHackMe,
    },
  });

  const updateProfileSettings = async (values: TryHackMeSettingsFormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/profile/${profileId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          tryHackMeUserId: values.tryHackMeUserId,
          showTryHackMe: values.showTryHackMe,
        }),
      });

      toast({
        title: 'Ustawienia zaktualizowane',
        description: 'Ustawienia TryHackMe zostały pomyślnie zaktualizowane',
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Błąd podczas aktualizacji ustawień TryHackMe:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować ustawień TryHackMe',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (values: TryHackMeSettingsFormValues) => {
    updateProfileSettings(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ustawienia TryHackMe</CardTitle>
        <CardDescription>
          Skonfiguruj wyświetlanie statystyk z platformy TryHackMe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="tryHackMeUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identyfikator użytkownika TryHackMe</FormLabel>
                  <FormControl>
                    <Input placeholder="2135753" {...field} />
                  </FormControl>
                  <FormDescription>
                    Wprowadź swój publiczny ID użytkownika z TryHackMe, który można znaleźć w profilu
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showTryHackMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Pokaż odznakę TryHackMe</FormLabel>
                    <FormDescription>
                      Pokazuj swoją odznakę i statystyki z TryHackMe na stronie
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

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz ustawienia'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}