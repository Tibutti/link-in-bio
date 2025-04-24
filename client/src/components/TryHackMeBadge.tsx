import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, ExternalLink } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TryHackMeBadgeProps {
  userId?: string;
}

export default function TryHackMeBadge({ userId }: TryHackMeBadgeProps) {
  const [isLoaded, setIsLoaded] = useState(false);

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
        <h3 className="text-lg font-medium">Konto TryHackMe nie połączone</h3>
        <p className="text-sm text-muted-foreground">
          Połącz swoje konto TryHackMe, aby wyświetlić swoje osiągnięcia i odznaki.
        </p>
      </div>
      <Button 
        variant="outline"
        className="mt-2"
        onClick={() => window.open("https://tryhackme.com/", "_blank")}
      >
        Odwiedź TryHackMe
        <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  // Renderowanie zawartości dla przypadku gdy mamy userId
  const renderUserContent = () => (
    <div className="flex justify-center w-full relative">
      <div 
        className={`text-center transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%',
          overflow: 'hidden' 
        }}
      >
        <div style={{ 
          width: '100%', 
          maxWidth: '350px', 
          height: '130px', 
          position: 'relative',
          margin: '0 auto',
          overflow: 'hidden'
        }}>
          <iframe 
            src={`https://tryhackme.com/api/v2/badges/public-profile?userPublicId=${userId}`} 
            style={{ 
              border: 'none', 
              width: '330px', 
              height: '220px',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '0px' // Usunięcie marginesu górnego
            }}
            title="TryHackMe Badge"
            onLoad={() => setIsLoaded(true)}
            scrolling="no" // Wyłączenie przewijania
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="tryhackme" className="border-b border-t-0 border-x-0">
          <AccordionTrigger className="py-4 text-xl font-bold text-gray-800 hover:no-underline">
            TryHackMe
            {userId && (
              <div className="ml-2 text-primary">
                <span className="text-sm text-gray-600">ID: {userId}</span>
              </div>
            )}
          </AccordionTrigger>
          <AccordionContent>
            <div className="py-4">
              {userId ? renderUserContent() : renderNoUserContent()}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}