import { type Profile } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import GitHubContributionCalendar from './GitHubContributionCalendar';

interface GitHubStatsProps {
  profile: Profile;
}

export default function GitHubStats({ profile }: GitHubStatsProps) {
  // Zapamiętaj stan przełącznika w localStorage
  const [showStats, setShowStats] = useState(() => {
    const saved = localStorage.getItem('showGitHubStats');
    return saved === 'true';
  });
  
  // Aktualizacja localStorage kiedy stan się zmienia
  const handleToggle = (value: boolean) => {
    setShowStats(value);
    localStorage.setItem('showGitHubStats', value.toString());
  };
  
  // Jeśli użytkownik nie ma nazwy użytkownika GitHub, nie wyświetlaj tego komponentu
  if (!profile.githubUsername) return null;

  // Elementy graficzne ze statystykami GitHub
  const statsUrl = `https://github-readme-stats.vercel.app/api?username=${profile.githubUsername}&show_icons=true&theme=radical`;
  const languagesUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${profile.githubUsername}&layout=compact&theme=radical`;
  const streakUrl = `https://github-readme-streak-stats.herokuapp.com/?user=${profile.githubUsername}&theme=radical`;
  // Używamy nowego komponentu GitHubCalendar dla wykresu aktywności

  return (
    <Card className="mb-6 overflow-hidden shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Statystyki GitHub</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{showStats ? 'Ukryj' : 'Pokaż'}</span>
            <Switch
              checked={showStats}
              onCheckedChange={handleToggle}
              aria-label="Pokaż statystyki GitHub"
            />
          </div>
        </div>
      </CardHeader>
      
      {showStats && (
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

            <GitHubContributionCalendar profile={profile} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}