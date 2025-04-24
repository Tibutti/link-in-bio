import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ErrorTestButtonProps {
  variant?: "destructive" | "outline" | "secondary" | "ghost" | "link" | "default";
}

export default function ErrorTestButton({ variant = "destructive" }: ErrorTestButtonProps) {
  const [showInfo, setShowInfo] = useState(false);
  const { toast } = useToast();
  
  // Funkcja wywoływana po kliknięciu przycisku
  const handleTestClick = () => {
    // Pokaż komunikat o wysłaniu błędu
    setShowInfo(true);
    
    // Wyślij testowe zdarzenie do Sentry
    Sentry.captureMessage("To jest testowa wiadomość z aplikacji", "info");
    
    // Pokaż powiadomienie
    toast({
      title: "Test Sentry",
      description: "Testowa wiadomość została wysłana do Sentry",
    });
    
    // Ukryj wskaźnik po 3 sekundach
    setTimeout(() => setShowInfo(false), 3000);
  };
  
  // Funkcja wywołująca faktyczny błąd JavaScript
  const triggerRealError = () => {
    try {
      // Celowo wywołujemy błąd (to naprawdę spowoduje crash)
      const obj: any = null;
      console.log(obj.nonExistentProperty); // To spowoduje błąd null pointer
    } catch (error) {
      // Ten kod nie zostanie wykonany w przypadku prawdziwego błędu
      // ponieważ ErrorBoundary przechwyci błąd
      Sentry.captureException(error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-2">
        <Button 
          variant={variant}
          onClick={handleTestClick}
          className="mb-2"
        >
          Test Sentry
        </Button>
        
        <Button 
          variant="destructive"
          onClick={triggerRealError}
          className="mb-2"
          size="sm"
        >
          Wywołaj błąd
        </Button>
      </div>
      
      {showInfo && (
        <div className="text-sm text-green-600 bg-green-100 p-2 rounded border border-green-300">
          Wiadomość została wysłana do Sentry
        </div>
      )}
    </div>
  );
}