import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AccordionSection from './AccordionSection';
import { useTranslation } from 'react-i18next';

interface TryHackMeBadgeProps {
  userId?: string;
}

export default function TryHackMeBadge({ userId }: TryHackMeBadgeProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Ustawienie flagi załadowania po renderze iFrame (tylko gdy mamy userId)
    if (userId) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [userId]);

  // Renderowanie placeholder, gdy nie ma userId
  const renderNoUserContent = () => (
    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
      <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
        <Shield className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground">
          {t('ui.noData')}
        </h3>
        <p className="text-sm text-muted-foreground">
          Skonfiguruj konto TryHackMe w ustawieniach profilu, aby wyświetlić odznaki.
        </p>
      </div>
      <Button 
        variant="outline"
        className="mt-2"
        onClick={() => window.open("https://tryhackme.com/", "_blank")}
      >
        TryHackMe
        <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  // Renderowanie zawartości dla przypadku gdy mamy userId
  const renderUserContent = () => (
    <div className="py-4">
      <div
        className="bg-card flex flex-col items-center justify-center p-6 rounded-lg"
        style={{backgroundColor: 'transparent'}}
      >
        <h3 className="text-lg font-medium text-foreground mb-4">TryHackMe Profil</h3>
        <a 
          href={`https://tryhackme.com/p/${userId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline mb-2"
        >
          Zobacz pełny profil na TryHackMe
        </a>
        <div className="flex gap-8 mt-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">267685</p>
            <p className="text-sm text-muted-foreground">Punktów</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">5</p>
            <p className="text-sm text-muted-foreground">Pokoi</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">13</p>
            <p className="text-sm text-muted-foreground">Odznak</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AccordionSection
      title={t('sections.tryHackMe')}
      value="tryhackme"
    >
      {userId ? renderUserContent() : renderNoUserContent()}
    </AccordionSection>
  );
}