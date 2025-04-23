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
    // Funkcja do ładowania kalendarza GitHub ściśle według oficjalnej dokumentacji
    const loadCalendar = async () => {
      try {
        // Załaduj skrypt i style
        if (!document.querySelector('script[src*="github-calendar.min.js"]')) {
          // Dodaj skrypt
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/github-calendar@latest/dist/github-calendar.min.js';
          script.async = true;
          document.head.appendChild(script);
          
          // Dodaj style
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/github-calendar@latest/dist/github-calendar-responsive.css';
          document.head.appendChild(link);
          
          // Poczekaj na załadowanie skryptu
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }
        
        // Wywołaj inicjalizację kalendarza po załadowaniu skryptu
        setTimeout(() => {
          if (window.GitHubCalendar && calendarRef.current) {
            try {
              // Inicjalizacja według dokumentacji
              window.GitHubCalendar(".calendar", profile.githubUsername, {
                responsive: true,
                tooltips: true,
                global_stats: true,
                summary_text: 'Podsumowanie aktywności na GitHub'
              });
              
              console.log("Kalendarz GitHub zainicjalizowany pomyślnie");
            } catch (err) {
              console.error("Błąd podczas inicjalizacji kalendarza:", err);
            }
          } else {
            console.error("GitHubCalendar nie został załadowany lub element nie jest dostępny");
          }
        }, 500);
      } catch (error) {
        console.error('Błąd podczas ładowania kalendarza GitHub:', error);
      }
    };

    // Załaduj kalendarz po zamontowaniu komponentu
    if (profile.githubUsername) {
      loadCalendar();
    }
    
    // Funkcja czyszcząca - nic nie robimy, ponieważ skrypty i style są globalne
  }, [profile.githubUsername]);

  if (!profile.githubUsername) return null;

  return (
    <div className="w-full mt-4">
      <h2 className="text-lg font-semibold mb-2 text-center">Aktywność na GitHub</h2>
      {/* Dokładna struktura według dokumentacji */}
      <div className="calendar" ref={calendarRef}>
        Ładowanie danych aktywności na GitHub...
      </div>
    </div>
  );
}