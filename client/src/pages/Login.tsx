import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      interface LoginResponse {
        token: string;
        user: { id: number; username: string };
        profile: {
          id: number;
          userId: number;
          name: string;
          bio: string;
          location: string;
          imageIndex: number;
          backgroundIndex: number;
          backgroundGradient: string | null;
          githubUsername: string | null;
        };
      }

      const response = await apiRequest<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      // Zapisz token i dane użytkownika w localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userData', JSON.stringify({
        user: response.user,
        profile: response.profile
      }));

      toast({
        title: 'Zalogowano pomyślnie',
        description: `Witaj, ${response.user.username}!`,
      });

      // Przekieruj do strony głównej lub panelu administracyjnego
      setLocation('/admin');
    } catch (error) {
      console.error('Błąd logowania:', error);
      toast({
        title: 'Błąd logowania',
        description: 'Nieprawidłowa nazwa użytkownika lub hasło',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <div className="absolute right-6 top-6">
            <Button variant="ghost" size="sm" onClick={() => setLocation('/')}>
              Powrót do strony głównej
            </Button>
          </div>
          <CardTitle className="text-xl font-bold">Logowanie do panelu</CardTitle>
          <CardDescription>
            Zaloguj się do panelu administracyjnego swojego profilu
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nazwa użytkownika</Label>
              <Input
                id="username"
                placeholder="demo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}