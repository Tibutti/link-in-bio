import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import * as Sentry from "@sentry/react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, AlertTriangle, BugPlay, ServerCrash, MessageSquare, Laptop, Server } from "lucide-react";

export default function SentryTestPanel() {
  const { toast } = useToast();
  const [activeTest, setActiveTest] = useState<string | null>(null);

  const showToast = (title: string, description: string) => {
    toast({
      title,
      description,
    });
  };

  const handleInfoMessage = () => {
    setActiveTest("info");
    Sentry.captureMessage("To jest testowa wiadomość informacyjna", "info");
    showToast("Wiadomość wysłana", "Informacja została wysłana do Sentry");
    setTimeout(() => setActiveTest(null), 3000);
  };

  const handleWarningMessage = () => {
    setActiveTest("warning");
    Sentry.captureMessage("To jest testowe ostrzeżenie", "warning");
    showToast("Ostrzeżenie wysłane", "Ostrzeżenie zostało wysłane do Sentry");
    setTimeout(() => setActiveTest(null), 3000);
  };

  const handleErrorMessage = () => {
    setActiveTest("error");
    Sentry.captureMessage("To jest testowy błąd", "error");
    showToast("Błąd wysłany", "Błąd został wysłany do Sentry");
    setTimeout(() => setActiveTest(null), 3000);
  };

  const handleExceptionTest = () => {
    setActiveTest("exception");
    try {
      throw new Error("Ręcznie wygenerowany wyjątek testowy");
    } catch (error) {
      Sentry.captureException(error);
      showToast("Wyjątek wysłany", "Wyjątek został wysłany do Sentry");
    }
    setTimeout(() => setActiveTest(null), 3000);
  };

  const handleNullPointerError = () => {
    setActiveTest("nullpointer");
    try {
      // Celowo tworzymy błąd null pointer (TypeScript wie, że to błąd, ale wyłączamy sprawdzanie)
      // @ts-ignore
      const obj: any = null;
      // @ts-ignore
      console.log(obj.nonExistentProperty);
    } catch (error) {
      Sentry.captureException(error);
      showToast("Błąd null pointer", "Błąd null pointer został wysłany do Sentry");
    }
    setTimeout(() => setActiveTest(null), 3000);
  };

  const handleUndefinedMethodError = () => {
    setActiveTest("undefinedmethod");
    try {
      // Celowo wywołujemy nieistniejącą metodę
      // @ts-ignore - Wyłączamy sprawdzanie TypeScript, bo celowo generujemy błąd
      const obj = {} as any;
      // @ts-ignore
      obj.nonExistentMethod();
    } catch (error) {
      Sentry.captureException(error);
      showToast("Błąd wywołania metody", "Błąd wywołania nieistniejącej metody został wysłany do Sentry");
    }
    setTimeout(() => setActiveTest(null), 3000);
  };

  const handleApiError = () => {
    setActiveTest("apierror");
    // Symulujemy błąd API
    fetch('/api/non-existent-endpoint')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Błąd API: ${response.status}`);
        }
        return response.json();
      })
      .catch(error => {
        Sentry.captureException(error);
        showToast("Błąd API", "Błąd API został wysłany do Sentry");
      })
      .finally(() => {
        setTimeout(() => setActiveTest(null), 3000);
      });
  };

  const handleUnhandledPromiseRejection = () => {
    setActiveTest("promise");
    // Celowo tworzymy nieobsłużone odrzucenie obietnicy
    new Promise((_, reject) => {
      reject(new Error("Testowe odrzucenie obietnicy"));
    });
    
    showToast("Odrzucenie obietnicy", "Odrzucenie obietnicy zostało wygenerowane");
    setTimeout(() => setActiveTest(null), 3000);
  };

  const handleRealCrash = () => {
    setActiveTest("crash");
    // To spowoduje prawdziwy crash aplikacji, który zostanie przechwycony przez ErrorBoundary
    const crashFunc = () => {
      const obj = null;
      // @ts-ignore
      obj.nonExistentMethod();
    };
    
    // Dodajemy małe opóźnienie, żeby komunikat był widoczny
    setTimeout(() => {
      showToast("Uwaga!", "Za chwilę aplikacja ulegnie awarii...");
      setTimeout(crashFunc, 1500);
    }, 500);
  };

  const getButtonStatus = (testType: string): "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" => {
    return activeTest === testType ? "secondary" : "default";
  };

  const handleServerErrorTest = () => {
    setActiveTest("servererror");
    fetch('/api/test-server-error')
      .catch(error => {
        showToast("Błąd serwera", "Wygenerowano błąd na serwerze");
      })
      .finally(() => {
        setTimeout(() => setActiveTest(null), 3000);
      });
  };

  const handleServerMessageTest = () => {
    setActiveTest("servermessage");
    fetch('/api/test-server-message')
      .then(response => response.json())
      .then(data => {
        showToast("Wiadomość serwera", data.message || "Wiadomość została wysłana z serwera");
      })
      .catch(error => {
        console.error("Błąd podczas wysyłania wiadomości z serwera:", error);
      })
      .finally(() => {
        setTimeout(() => setActiveTest(null), 3000);
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BugPlay className="h-5 w-5" />
          Panel testowy Sentry
        </CardTitle>
        <CardDescription>
          Narzędzia do testowania raportowania różnych typów błędów do Sentry
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="frontend" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="frontend" className="flex items-center gap-2">
              <Laptop className="h-4 w-4" /> Frontend
            </TabsTrigger>
            <TabsTrigger value="backend" className="flex items-center gap-2">
              <Server className="h-4 w-4" /> Backend
            </TabsTrigger>
          </TabsList>
          
          {/* Zawartość zakładki Frontend */}
          <TabsContent value="frontend" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Raportowanie wiadomości</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button 
                  variant={getButtonStatus("info")} 
                  onClick={handleInfoMessage}
                  className="w-full"
                >
                  Informacja
                </Button>
                <Button 
                  variant={getButtonStatus("warning")} 
                  onClick={handleWarningMessage}
                  className="w-full"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Ostrzeżenie
                </Button>
                <Button 
                  variant={getButtonStatus("error")} 
                  onClick={handleErrorMessage}
                  className="w-full"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Błąd
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Raportowanie wyjątków</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button 
                  variant={getButtonStatus("exception")}
                  onClick={handleExceptionTest}
                  className="w-full"
                >
                  Wyjątek
                </Button>
                <Button 
                  variant={getButtonStatus("nullpointer")} 
                  onClick={handleNullPointerError}
                  className="w-full"
                >
                  Null pointer
                </Button>
                <Button 
                  variant={getButtonStatus("undefinedmethod")} 
                  onClick={handleUndefinedMethodError}
                  className="w-full"
                >
                  Brak metody
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Błędy asynchroniczne</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  variant={getButtonStatus("apierror")} 
                  onClick={handleApiError}
                  className="w-full"
                >
                  Błąd API
                </Button>
                <Button 
                  variant={getButtonStatus("promise")} 
                  onClick={handleUnhandledPromiseRejection}
                  className="w-full"
                >
                  Odrzucenie obietnicy
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Prawdziwa awaria aplikacji</h3>
              <div className="flex justify-center">
                <Button 
                  variant="destructive" 
                  onClick={handleRealCrash}
                  className="w-full md:w-1/2"
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Wywołaj awarię aplikacji
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Zawartość zakładki Backend */}
          <TabsContent value="backend" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Błędy serwera</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <Button 
                  variant={getButtonStatus("servererror")} 
                  onClick={handleServerErrorTest}
                  className="w-full"
                >
                  <ServerCrash className="mr-2 h-4 w-4" />
                  Wygeneruj błąd serwera
                </Button>
                <Button 
                  variant={getButtonStatus("servermessage")} 
                  onClick={handleServerMessageTest}
                  className="w-full"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Wyślij wiadomość z serwera
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Informacje:</strong> Backend używa tych samych mechanizmów do raportowania błędów co frontend, ale działa po stronie serwera.
                </p>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>Błędy są przechwytywane przez middleware Sentry</li>
                  <li>Dodatkowe konteksty są dołączane do raportów (URL, metoda HTTP)</li>
                  <li>Wiadomości i wyjątki są raportowane z oznaczeniem źródła</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-3">API do testowania błędów</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 border rounded bg-gray-50 text-sm">
                  <code className="block font-mono bg-gray-100 p-2 rounded mb-2">/api/test-server-error</code>
                  <p>Generuje nieobsłużony błąd na serwerze, który jest raportowany do Sentry.</p>
                </div>
                <div className="p-3 border rounded bg-gray-50 text-sm">
                  <code className="block font-mono bg-gray-100 p-2 rounded mb-2">/api/test-server-message</code>
                  <p>Wysyła testową wiadomość z serwera do Sentry i zwraca potwierdzenie.</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}