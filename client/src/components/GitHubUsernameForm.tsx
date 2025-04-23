import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface GitHubUsernameFormProps {
  profileId: number;
  initialUsername: string | null;
}

export default function GitHubUsernameForm({ profileId, initialUsername }: GitHubUsernameFormProps) {
  const [username, setUsername] = useState(initialUsername || '');
  const { toast } = useToast();

  const updateGitHubUsernameMutation = useMutation({
    mutationFn: async (githubUsername: string) => {
      return apiRequest(
        'PATCH',
        `/api/profile/${profileId}`,
        { githubUsername }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: 'Sukces!',
        description: 'Nazwa użytkownika GitHub została zaktualizowana.',
        variant: 'default',
      });
    },
    onError: () => {
      toast({
        title: 'Błąd!',
        description: 'Nie udało się zaktualizować nazwy użytkownika GitHub.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGitHubUsernameMutation.mutate(username);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Ustawienia GitHub</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="github-username" className="text-sm font-medium">
              Nazwa użytkownika GitHub
            </label>
            <Input
              id="github-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="np. Tibutti"
            />
          </div>

          {updateGitHubUsernameMutation.isPending ? (
            <Button disabled className="w-full">
              Aktualizowanie...
            </Button>
          ) : (
            <Button type="submit" className="w-full">
              Zapisz
            </Button>
          )}

          {updateGitHubUsernameMutation.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                Wystąpił błąd podczas aktualizacji nazwy użytkownika GitHub.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}