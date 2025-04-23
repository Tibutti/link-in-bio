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
        <div className="flex justify-center w-full">
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
            <iframe 
              src={`https://tryhackme.com/api/v2/badges/public-profile?userPublicId=${userId}`} 
              style={{ 
                border: 'none', 
                width: '100%', 
                maxWidth: '550px', 
                height: '250px',
                margin: '0 auto',
                display: 'block',
              }}
              title="TryHackMe Badge"
              onLoad={() => setIsLoaded(true)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}