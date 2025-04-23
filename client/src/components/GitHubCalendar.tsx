import { useEffect, useRef } from 'react';
import { type Profile } from '@shared/schema';

// Importujemy typy dla biblioteki
declare global {
  interface Window {
    GitHubCalendar: (
      selector: string,
      username: string,
      options?: {
        responsive?: boolean;
        tooltips?: boolean;
        global_stats?: boolean;
        summary_text?: string;
      }
    ) => void;
  }
}

interface GitHubCalendarProps {
  profile: Profile;
}

export default function GitHubCalendar({ profile }: GitHubCalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    // Funkcja do ładowania kalendarza GitHub
    const loadCalendar = async () => {
      try {
        // Dodaj CSS jeśli jeszcze nie istnieje
        if (!document.querySelector('link[href*="github-calendar-responsive.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/github-calendar@latest/dist/github-calendar-responsive.css';
          document.head.appendChild(link);
        }
        
        // Załaduj skrypt jeśli jeszcze nie załadowany
        if (typeof window.GitHubCalendar !== 'function') {
          // Utwórz i załaduj skrypt
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/github-calendar@latest/dist/github-calendar.min.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Nie udało się załadować skryptu GitHub Calendar'));
            document.body.appendChild(script);
          });
        }
        
        // Inicjalizuj kalendarz po załadowaniu (z opóźnieniem dla pewności)
        setTimeout(() => {
          if (!isMounted) return;
          
          if (calendarRef.current && profile.githubUsername && typeof window.GitHubCalendar === 'function') {
            try {
              window.GitHubCalendar(
                '.calendar',
                profile.githubUsername,
                { 
                  responsive: true, 
                  tooltips: true,
                  global_stats: false,
                  summary_text: 'Podsumowanie aktywności na GitHub'
                }
              );
            } catch (err) {
              console.error('Błąd przy inicjalizacji kalendarza:', err);
            }
          }
        }, 300);
      } catch (error) {
        console.error('Błąd podczas ładowania kalendarza GitHub:', error);
      }
    };

    if (profile.githubUsername) {
      loadCalendar();
    }
    
    // Funkcja czyszcząca
    return () => {
      isMounted = false;
    };
  }, [profile.githubUsername]);

  if (!profile.githubUsername) return null;

  return (
    <div className="w-full mt-4">
      <h2 className="text-lg font-semibold mb-2 text-center">Aktywność na GitHub</h2>
      <div className="calendar github-calendar" ref={calendarRef}>
        Ładowanie danych aktywności...
      </div>
    </div>
  );
}