import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, ExternalLink, Award, Clock, UserCheck, Monitor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AccordionSection from './AccordionSection';
import { useTranslation } from 'react-i18next';

interface TryHackMeBadgeProps {
  userId?: string;
}

export default function TryHackMeBadge({ userId }: TryHackMeBadgeProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useTranslation();

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

  // Własna implementacja odznaki TryHackMe
  const renderUserContent = () => (
    <div className="flex justify-center w-full p-4">
      <div className="bg-[#141c2b] dark:bg-[#141c2b] rounded-lg p-4 max-w-md w-full shadow-md">
        <div className="flex items-center mb-3">
          <div className="w-16 h-16 bg-[#1a2332] rounded-full overflow-hidden flex items-center justify-center mr-3 border-2 border-[#88cc14]">
            <img 
              src="https://avatars.githubusercontent.com/u/136629321?v=4" 
              alt="Tibutti" 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://tryhackme.com/img/badges/default.png";
              }}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-xl font-bold text-white mr-2">Tibutti</h3>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">0x6</Badge>
            </div>
            <div className="flex items-center mt-1">
              <a 
                href={`https://tryhackme.com/p/${userId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-300 hover:text-white transition-colors flex items-center"
              >
                tryhackme.com
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#1a2332] rounded p-2">
            <Award className="mx-auto h-5 w-5 text-yellow-400 mb-1" />
            <p className="text-lg font-bold text-white">267685</p>
            <p className="text-xs text-gray-400">Punkty</p>
          </div>
          <div className="bg-[#1a2332] rounded p-2">
            <Clock className="mx-auto h-5 w-5 text-green-400 mb-1" />
            <p className="text-lg font-bold text-white">0</p>
            <p className="text-xs text-gray-400">Dni</p>
          </div>
          <div className="bg-[#1a2332] rounded p-2">
            <UserCheck className="mx-auto h-5 w-5 text-purple-400 mb-1" />
            <p className="text-lg font-bold text-white">5</p>
            <p className="text-xs text-gray-400">Pokoje</p>
          </div>
        </div>
        
        <div className="mt-2 bg-[#1a2332] rounded p-2 text-center">
          <Monitor className="mx-auto h-5 w-5 text-blue-400 mb-1" />
          <p className="text-lg font-bold text-white">13</p>
          <p className="text-xs text-gray-400">Odznaki</p>
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