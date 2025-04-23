import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TryHackMeBadgeProps {
  userId: string;
}

export default function TryHackMeBadge({ userId }: TryHackMeBadgeProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ustawienie flagi załadowania po renderze iFrame
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>TryHackMe</CardTitle>
        <CardDescription>
          Statystyki i osiągnięcia z platformy TryHackMe
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 flex items-center justify-center">
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
              maxWidth: '320px', 
              height: '130px', 
              position: 'relative',
              margin: '0 auto',
              overflow: 'hidden'
            }}>
              <iframe 
                src={`https://tryhackme.com/api/v2/badges/public-profile?userPublicId=${userId}`} 
                style={{ 
                  border: 'none', 
                  width: '300px', 
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
      </CardContent>
    </Card>
  );
}