import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
}

export function QRScanner({ open, onClose }: QRScannerProps) {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addContactMutation = useMutation({
    mutationFn: async (profileId: number) => {
      const response = await apiRequest("POST", "/api/contacts", {
        contactProfileId: profileId,
        category: "default",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Kontakt dodany",
        description: "Nowy kontakt został pomyślnie dodany do Twojego wizytownika.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Błąd podczas dodawania kontaktu",
        description: "Nie udało się dodać kontaktu: " + error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Symulacja skanowania kodu QR
    // W rzeczywistej implementacji użylibyśmy biblioteki jak "react-qr-reader"
    let scanTimer: NodeJS.Timeout;
    
    if (scanning) {
      scanTimer = setTimeout(() => {
        // Symulacja znalezienia kodu QR z URL przykładowego profilu
        const url = new URL("http://example.com?add_contact=1&profileId=103");
        const profileId = url.searchParams.get("profileId");
        
        if (profileId) {
          setScanning(false);
          addContactMutation.mutate(parseInt(profileId));
        } else {
          setError("Niepoprawny kod QR. Spróbuj ponownie.");
          setScanning(false);
        }
      }, 3000);
    }
    
    return () => {
      clearTimeout(scanTimer);
    };
  }, [scanning, addContactMutation]);

  const startScanning = () => {
    setError(null);
    setScanning(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Skanuj kod QR</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4">
          <div 
            className="w-[250px] h-[250px] bg-muted rounded-md flex items-center justify-center relative"
          >
            {scanning ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Skanowanie...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Camera className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground text-center">
                  {error || "Kliknij przycisk poniżej, aby rozpocząć skanowanie kodu QR"}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} type="button">
            <X className="h-4 w-4 mr-2" />
            Anuluj
          </Button>
          
          <Button 
            onClick={startScanning} 
            disabled={scanning || addContactMutation.isPending}
          >
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Skanowanie...
              </>
            ) : addContactMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Dodawanie...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                {error ? "Skanuj ponownie" : "Rozpocznij skanowanie"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}