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
    <div className="flex justify-center bg-[#141c2b] dark:bg-[#141c2b] rounded-lg p-4">
      <div 
        className={`text-center transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          overflow: 'hidden',
          width: '330px', 
          height: '82px',
          position: 'relative',
          background: '#141c2b'
        }}
      >
        <iframe 
          src={`https://tryhackme.com/api/v2/badges/public-profile?userPublicId=${userId}&theme=dark`} 
          style={{ 
            border: 'none', 
            width: '330px', 
            height: '82px', // Dokładny rozmiar widgetu
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: 'transparent',
            filter: 'invert(1) hue-rotate(180deg)' // Odwróć kolory i zmień barwę
          }}
          title="TryHackMe Badge"
          onLoad={() => setIsLoaded(true)}
          scrolling="no" // Wyłączenie przewijania
        />
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