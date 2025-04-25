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
          width: '400px', // Powiększony szerokość
          margin: '0 auto',
          position: 'relative',
          transform: 'scale(1.2)', // Skalowanie całego kontenera
          transformOrigin: 'center center'
        }}
      >
        {/* Dodajemy obramowanie z ciemnego koloru */}
        <div style={{
          position: 'absolute',
          top: -4,
          left: -4,
          right: -4,
          bottom: -4,
          backgroundColor: '#141c2b',
          borderRadius: '12px',
          zIndex: 1
        }}></div>
        
        {/* Maska która maskuje białe narożniki */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '400px', // Powiększona szerokość
          height: '98px', // Powiększona wysokość
          zIndex: 3,
          pointerEvents: 'none',
        }}>
          {/* Górny lewy róg */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '15px',
            height: '15px',
            backgroundColor: '#141c2b',
            borderRadius: '0 0 0 0',
            zIndex: 3
          }}></div>
          
          {/* Górny prawy róg */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '15px',
            height: '15px',
            backgroundColor: '#141c2b',
            borderRadius: '0 0 0 0',
            zIndex: 3
          }}></div>
          
          {/* Dolny lewy róg */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '15px',
            height: '15px',
            backgroundColor: '#141c2b',
            borderRadius: '0 0 0 0',
            zIndex: 3
          }}></div>
          
          {/* Dolny prawy róg */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '15px',
            height: '15px',
            backgroundColor: '#141c2b',
            borderRadius: '0 0 0 0',
            zIndex: 3
          }}></div>
        </div>
        
        {/* Iframe umieszczony pod maską */}
        <iframe 
          src={`https://tryhackme.com/api/v2/badges/public-profile?userPublicId=${userId}`} 
          style={{ 
            border: 'none', 
            width: '400px', // Powiększona szerokość
            height: '98px', // Powiększona wysokość
            position: 'relative',
            zIndex: 2
          }}
          title="TryHackMe Badge"
          onLoad={() => setIsLoaded(true)}
          scrolling="no"
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