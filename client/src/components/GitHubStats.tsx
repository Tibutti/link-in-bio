import { type Profile } from '@shared/schema';
import { Card, CardContent } from "@/components/ui/card";

interface GitHubStatsProps {
  profile: Profile;
}

export default function GitHubStats({ profile }: GitHubStatsProps) {
  // Jeśli użytkownik nie ma nazwy użytkownika GitHub, nie wyświetlaj tego komponentu
  if (!profile.githubUsername) return null;

  // Elementy graficzne ze statystykami GitHub
  const statsUrl = `https://github-readme-stats.vercel.app/api?username=${profile.githubUsername}&show_icons=true&theme=radical`;
  const languagesUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${profile.githubUsername}&layout=compact&theme=radical`;
  const streakUrl = `https://github-readme-streak-stats.herokuapp.com/?user=${profile.githubUsername}&theme=radical`;

  return (
    <Card className="mb-6 overflow-hidden shadow-md">
      <CardContent className="p-4 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Statystyki GitHub</h2>
        
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
        </div>
      </CardContent>
    </Card>
  );
}