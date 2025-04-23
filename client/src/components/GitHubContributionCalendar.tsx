import { useEffect, useState } from 'react';
import { type Profile } from '@shared/schema';
import { getQueryFn } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

// Typ danych dla kontrybucji GitHub
interface GitHubContribution {
  date: string;
  count: number;
  level: number; // 0-4 poziom aktywności
}

interface GitHubContributionCalendarProps {
  profile: Profile;
}

export default function GitHubContributionCalendar({ profile }: GitHubContributionCalendarProps) {
  const [months, setMonths] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>(['Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob', 'Nie']);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Jeśli użytkownik nie ma nazwy użytkownika GitHub, nie wyświetlaj tego komponentu
  if (!profile.githubUsername) return null;
  
  // Pobierz dane kontrybucji z GitHub
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/github-contributions/${profile.githubUsername}`],
    queryFn: getQueryFn<{ contributions: GitHubContribution[] }>({
      on401: 'returnNull'
    }),
    staleTime: 5 * 60 * 1000, // 5 minut
  });
  
  useEffect(() => {
    // Ustawienie nazw miesięcy
    const monthNames = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
    setMonths(monthNames);
    
    // Aktualizacja bieżącego roku
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  // Zorganizuj dane w tygodnie dla wyświetlenia w kalendarzu
  const getCalendarData = () => {
    if (!data?.contributions || data.contributions.length === 0) {
      return [];
    }
    
    // Przygotuj dane kalendarza
    const contributions = data.contributions.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Oblicz datę rozpoczęcia (53 tygodnie wstecz)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 371); // Około 53 tygodnie wstecz
    
    // Tworzenie struktury kalendarza
    const calendar = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const contribution = contributions.find(c => c.date === dateStr) || {
        date: dateStr,
        count: 0,
        level: 0
      };
      
      calendar.push(contribution);
      
      // Przesuń do następnego dnia
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return calendar;
  };
  
  const calendarData = getCalendarData();
  
  // Grupuj dane w tygodnie
  const getWeeks = () => {
    const weeks = [];
    let week = [];
    
    if (calendarData.length === 0) {
      // Jeśli brak danych, wygeneruj pustą siatkę dla widoczności
      const emptyWeeks = [];
      
      // Stwórz 52 tygodnie
      for (let w = 0; w < 53; w++) {
        const emptyWeek = [];
        for (let d = 0; d < 7; d++) {
          // Stwórz pusty dzień - będzie wyświetlany jako szary kwadrat
          emptyWeek.push({
            date: new Date().toISOString().split('T')[0],
            count: 0,
            level: 0
          });
        }
        emptyWeeks.push(emptyWeek);
      }
      
      return emptyWeeks;
    }
    
    // Wypełnij dni przed pierwszym dniem, aby zacząć od poniedziałku
    const firstDay = new Date(calendarData[0].date);
    const dayOfWeek = firstDay.getDay();
    const daysToFill = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=niedziela, 1=poniedziałek, itd.
    
    for (let i = 0; i < daysToFill; i++) {
      week.push(null);
    }
    
    // Dodaj rzeczywiste dni
    for (const day of calendarData) {
      week.push(day);
      
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    
    // Dodaj ostatni niepełny tydzień
    if (week.length > 0) {
      weeks.push(week);
    }
    
    return weeks;
  };
  
  // Funkcja do formatowania daty dla tooltipa
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Funkcja do formatowania liczby kontrybucji
  const formatContributions = (count: number) => {
    if (count === 0) {
      return 'Brak kontrybucji';
    } else if (count === 1) {
      return '1 kontrybucja';
    } else if (count < 5) {
      return `${count} kontrybucje`;
    } else {
      return `${count} kontrybucji`;
    }
  };
  
  // Kolory dla poziomów aktywności
  const getLevelColor = (level: number) => {
    const colors = [
      'bg-gray-100 dark:bg-gray-800', // Poziom 0
      'bg-pink-100 dark:bg-pink-900', // Poziom 1
      'bg-pink-200 dark:bg-pink-800', // Poziom 2
      'bg-pink-300 dark:bg-pink-700', // Poziom 3
      'bg-pink-500 dark:bg-pink-600'  // Poziom 4
    ];
    return colors[level] || colors[0];
  };
  
  const weeks = getWeeks();
  
  if (isLoading) {
    return (
      <div className="w-full mt-4 text-center">
        <h2 className="text-lg font-semibold mb-2">Aktywność na GitHub</h2>
        <div className="p-4 text-gray-500">Ładowanie danych...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full mt-4 text-center">
        <h2 className="text-lg font-semibold mb-2">Aktywność na GitHub</h2>
        <div className="p-4 text-red-500">Nie udało się załadować danych GitHub.</div>
      </div>
    );
  }
  
  return (
    <div className="w-full mt-4">
      <h2 className="text-lg font-semibold mb-2 text-center">Aktywność na GitHub</h2>
      
      <div className="rounded-md overflow-hidden shadow-md bg-white dark:bg-gray-800 p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-600 dark:text-gray-300">{currentYear}</div>
          <div className="flex space-x-2">
            {months.map((month, i) => (
              <div key={i} className="text-xs text-gray-500 dark:text-gray-400">{month}</div>
            ))}
          </div>
        </div>
        
        <div className="relative">
          <div className="grid grid-flow-col gap-1">
            {/* Dni tygodnia po lewej */}
            <div className="grid grid-rows-7 gap-1 mr-2">
              {days.map((day, i) => (
                <div key={i} className="text-xs text-gray-500 dark:text-gray-400 h-3 flex items-center">
                  {i % 2 === 0 ? day : ''}
                </div>
              ))}
            </div>
            
            {/* Główna siatka kalendarza */}
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-1">
                {week.map((day, dayIndex) => (
                  <TooltipProvider key={dayIndex}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={`w-3 h-3 rounded-sm ${day ? getLevelColor(day.level) : 'bg-transparent'}`}
                        />
                      </TooltipTrigger>
                      {day && (
                        <TooltipContent side="top">
                          <div className="text-xs">
                            <div className="font-medium">{formatDate(day.date)}</div>
                            <div>{formatContributions(day.count)}</div>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legenda */}
        <div className="flex justify-end items-center mt-2 space-x-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">Mniej</div>
          {[0, 1, 2, 3, 4].map(level => (
            <div 
              key={level} 
              className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
            />
          ))}
          <div className="text-xs text-gray-500 dark:text-gray-400">Więcej</div>
        </div>
      </div>
    </div>
  );
}