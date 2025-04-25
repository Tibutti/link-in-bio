import { type Profile } from '@shared/schema';
import { CalendarClock } from 'lucide-react';
import AccordionSection from './AccordionSection';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface GitHubCalendarProps {
  profile: Profile;
}

export default function GitHubCalendar({ profile }: GitHubCalendarProps) {
  const { t } = useTranslation();
  const username = profile.githubUsername;
  
  // Renderowanie placeholder, gdy nie ma nazwy użytkownika GitHub
  const renderNoUserContent = () => (
    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
      <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
        <CalendarClock className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground">
          {t('ui.noData')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('github.connectAccount')}
        </p>
      </div>
    </div>
  );

  // Renderowanie zawartości dla przypadku gdy mamy nazwę użytkownika GitHub
  const renderUserContent = () => {
    // Dodajemy kolor (hex bez znaku #) - używamy różowego zgodnie z motywem "radical"
    const contributionColor = '9c0079'; // ciemny róż, pasujący do motywu
    const contributionsUrl = `https://ghchart.rshah.org/${contributionColor}/${username}`;

    return (
      <div className="w-full">
        {/* Obraz z aktywnością GitHub */}
        <div className="rounded-md overflow-hidden bg-background dark:bg-gray-800 p-2">
          <img
            src={contributionsUrl}
            alt={t('github.activityAlt', { username })}
            width="100%"
            className="max-w-full h-auto"
            loading="lazy"
          />
        </div>
      </div>
    );
  };

  return (
    <AccordionSection
      title={t('sections.github')}
      value="github"
    >
      {username ? renderUserContent() : renderNoUserContent()}
    </AccordionSection>
  );
}