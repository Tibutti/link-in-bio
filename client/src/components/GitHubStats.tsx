import { type Profile } from '@shared/schema';
import GitHubCalendar from './GitHubCalendar';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AccordionSection from './AccordionSection';

interface GitHubStatsProps {
  profile: Profile;
}

export default function GitHubStats({ profile }: GitHubStatsProps) {
  // Elementy graficzne ze statystykami GitHub
  const username = profile.githubUsername || "";
  const statsUrl = `https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=radical`;
  const languagesUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=radical`;
  const streakUrl = `https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=radical`;

  return (
    <AccordionSection
      title="Statystyki GitHub"
      value="github"
      badge={profile.githubUsername ? (
        <Badge variant="outline" className="ml-2 bg-primary/10">
          {profile.githubUsername}
        </Badge>
      ) : undefined}
    >
      {profile.githubUsername ? (
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
      ) : (
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
      )}
    </AccordionSection>
  );
}