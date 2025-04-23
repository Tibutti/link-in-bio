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
      <CardContent className="p-0">
        <div className={`w-full flex justify-center transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <iframe 
            src={`https://tryhackme.com/api/v2/badges/public-profile?userPublicId=${userId}`} 
            style={{ border: 'none', width: '100%', height: '220px' }}
            title="TryHackMe Badge"
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </CardContent>
    </Card>
  );
}