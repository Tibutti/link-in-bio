import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const sectionVisibilitySchema = z.object({
  showImage: z.boolean().default(true),
  showContact: z.boolean().default(true),
  showSocial: z.boolean().default(true),
  showKnowledge: z.boolean().default(true),
  showFeatured: z.boolean().default(true),
  showTryHackMe: z.boolean().default(true),
});

type SectionVisibilityFormValues = z.infer<typeof sectionVisibilitySchema>;

interface SectionVisibilityFormProps {
  profileId: number;
  showImage: boolean;
  showContact: boolean;
  showSocial: boolean;
  showKnowledge: boolean;
  showFeatured: boolean;
  showTryHackMe: boolean;
  onSuccess?: () => void;
}

export function SectionVisibilityForm({
  profileId,
  showImage = true,
  showContact = true,
  showSocial = true,
  showKnowledge = true,
  showFeatured = true,
  showTryHackMe = true,
  onSuccess
}: SectionVisibilityFormProps) {
  const { toast } = useToast();
  
  const form = useForm<SectionVisibilityFormValues>({
    resolver: zodResolver(sectionVisibilitySchema),
    defaultValues: {
      showImage,
      showContact,
      showSocial,
      showKnowledge,
      showFeatured,
      showTryHackMe,
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async (values: SectionVisibilityFormValues) => {
      return apiRequest(`/api/profile/${profileId}/section-visibility`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast({
        title: "Ustawienia widoczności zaktualizowane",
        description: "Twoje ustawienia zostały zapisane pomyślnie.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować ustawień widoczności.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: SectionVisibilityFormValues) => {
    updateMutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Widoczność sekcji</CardTitle>
        <CardDescription>
          Zarządzaj widocznością poszczególnych sekcji na swojej stronie
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="showImage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Zdjęcie profilowe</FormLabel>
                      <FormDescription>
                        Pokazuj swoje zdjęcie profilowe na stronie
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
              
              <FormField
                control={form.control}
                name="showContact"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Informacje kontaktowe</FormLabel>
                      <FormDescription>
                        Pokazuj dane kontaktowe (email, telefon) na stronie
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
              
              <FormField
                control={form.control}
                name="showSocial"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Media społecznościowe</FormLabel>
                      <FormDescription>
                        Pokazuj linki do mediów społecznościowych na stronie
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
              
              <FormField
                control={form.control}
                name="showKnowledge"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Platformy wiedzy</FormLabel>
                      <FormDescription>
                        Pokazuj linki do platform wiedzy na stronie
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
              
              <FormField
                control={form.control}
                name="showFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Wyróżnione treści</FormLabel>
                      <FormDescription>
                        Pokazuj wyróżnione treści na stronie
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
              
              <FormField
                control={form.control}
                name="showTryHackMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Odznaka TryHackMe</FormLabel>
                      <FormDescription>
                        Pokazuj odznakę i statystyki z TryHackMe na stronie
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
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Zapisywanie..." : "Zapisz ustawienia"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}