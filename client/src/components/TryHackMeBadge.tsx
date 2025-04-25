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
        className={`flex justify-center transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          overflow: 'hidden',
          width: '330px', 
          height: '82px',
          position: 'relative',
          margin: '0 auto',
          backgroundColor: '#141c2b',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          borderRadius: '8px',
          backgroundColor: '#141c2b'
        }}>
          <iframe 
            src={`https://tryhackme.com/api/v2/badges/public-profile?userPublicId=${userId}`} 
            style={{ 
              border: 'none', 
              width: '330px', 
              height: '82px',
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: '#141c2b'
            }}
            title="TryHackMe Badge"
            onLoad={() => setIsLoaded(true)}
            scrolling="no"
          />
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