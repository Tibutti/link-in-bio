import { type Profile } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import GitHubCalendar from './GitHubCalendar';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink } from 'lucide-react';

interface GitHubStatsProps {
  profile: Profile;
}

export default function GitHubStats({ profile }: GitHubStatsProps) {
  // Jeśli użytkownik ma włączone statystyki i podaną nazwę użytkownika GitHub, wyświetl statystyki
  if (profile.githubUsername) {
    // Elementy graficzne ze statystykami GitHub
    const statsUrl = `https://github-readme-stats.vercel.app/api?username=${profile.githubUsername}&show_icons=true&theme=radical`;
    const languagesUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${profile.githubUsername}&layout=compact&theme=radical`;
    const streakUrl = `https://github-readme-streak-stats.herokuapp.com/?user=${profile.githubUsername}&theme=radical`;

    return (
      <Card className="mb-6 overflow-hidden shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Statystyki GitHub</CardTitle>
        </CardHeader>
        
        <CardContent className="pt-2">
          <div className="flex flex-col space-y-4 items-center w-full">
            <img 
              src={statsUrl} 
              alt="GitHub Stats" 
              className="max-w-full rounded-md shadow hover:shadow-lg transition-shadow"
            />
            
            <img 
              src={languagesUrl} 
              alt="Najczęściej używane języki" 
              className="max-w-full rounded-md shadow hover:shadow-lg transition-shadow"
            />
            
            <img 
              src={streakUrl} 
              alt="GitHub Commit Streak" 
              className="max-w-full rounded-md shadow hover:shadow-lg transition-shadow"
            />

            <GitHubCalendar profile={profile} />
          </div>
        </CardContent>
      </Card>
    );
  } else {
    // Jeśli użytkownik nie ma podanej nazwy użytkownika GitHub, wyświetl placeholder
    return (
      <Card className="mb-6 overflow-hidden shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Statystyki GitHub</CardTitle>
        </CardHeader>
        
        <CardContent className="pt-2">
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Github className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Konto GitHub nie połączone</h3>
              <p className="text-sm text-muted-foreground">
                Połącz swoje konto GitHub, aby wyświetlić statystyki i aktywność.
              </p>
            </div>
            <Button 
              variant="outline"
              className="mt-2"
              onClick={() => window.open("https://github.com/", "_blank")}
            >
              Odwiedź GitHub
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}