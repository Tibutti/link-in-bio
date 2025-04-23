import { type Profile } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GitHubCalendar from './GitHubCalendar';

interface GitHubStatsProps {
  profile: Profile;
}

export default function GitHubStats({ profile }: GitHubStatsProps) {
  // Jeśli użytkownik nie ma nazwy użytkownika GitHub lub nie ma włączonych statystyk, nie wyświetlaj tego komponentu
  if (!profile.githubUsername || profile.showGithubStats === false) return null;

  // Elementy graficzne ze statystykami GitHub
  const statsUrl = `https://github-readme-stats.vercel.app/api?username=${profile.githubUsername}&show_icons=true&theme=radical`;
  const languagesUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${profile.githubUsername}&layout=compact&theme=radical`;
  const streakUrl = `https://github-readme-streak-stats.herokuapp.com/?user=${profile.githubUsername}&theme=radical`;
  // Używamy nowego komponentu GitHubCalendar dla wykresu aktywności

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
}