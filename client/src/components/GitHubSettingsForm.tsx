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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const githubSettingsSchema = z.object({
  githubUsername: z.string().optional().nullable(),
  showGithubStats: z.boolean().default(true),
});

type GitHubSettingsFormValues = z.infer<typeof githubSettingsSchema>;

interface GitHubSettingsFormProps {
  profileId: number;
  githubUsername: string | null;
  showGithubStats: boolean;
  onSuccess?: () => void;
}

export function GitHubSettingsForm({ profileId, githubUsername, showGithubStats, onSuccess }: GitHubSettingsFormProps) {
  const { toast } = useToast();
  
  const form = useForm<GitHubSettingsFormValues>({
    resolver: zodResolver(githubSettingsSchema),
    defaultValues: {
      githubUsername: githubUsername || "",
      showGithubStats: showGithubStats
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async (values: GitHubSettingsFormValues) => {
      return apiRequest(`/api/profile/${profileId}/github-settings`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast({
        title: "Ustawienia GitHub zaktualizowane",
        description: "Twoje ustawienia zostały zapisane pomyślnie.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować ustawień GitHub.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: GitHubSettingsFormValues) => {
    updateMutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ustawienia GitHub</CardTitle>
        <CardDescription>
          Zarządzaj integracją z GitHub i statystykami
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="githubUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa użytkownika GitHub</FormLabel>
                  <FormControl>
                    <Input placeholder="np. octocat" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    Wprowadź swoją nazwę użytkownika GitHub, aby wyświetlić statystyki aktywności.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="showGithubStats"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Statystyki GitHub</FormLabel>
                    <FormDescription>
                      Pokazuj statystyki aktywności GitHub na Twojej stronie
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