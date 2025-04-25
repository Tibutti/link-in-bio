import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QRScannerProps {
  onQRCodeDetected: (data: string) => void;
}

export function QRScanner({ onQRCodeDetected }: QRScannerProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [reader] = useState(new BrowserMultiFormatReader());

  useEffect(() => {
    return () => {
      if (isScanning) {
        reader.reset();
      }
    };
  }, [reader, isScanning]);

  const startScanning = async () => {
    if (!videoRef.current) return;
    
    try {
      setIsScanning(true);
      
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        toast({
          title: t("qr_scanner.no_camera"),
          description: t("qr_scanner.no_camera_description"),
          variant: "destructive",
        });
        setIsScanning(false);
        return;
      }
      
      // Preferujemy tylną kamerę na urządzeniach mobilnych
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('tylni') ||
        device.label.toLowerCase().includes('tylna')
      );
      
      const selectedDevice = backCamera || videoDevices[0];
      
      await reader.decodeFromVideoDevice(
        selectedDevice?.deviceId as string | null || null, 
        videoRef.current, 
        (result, error) => {
          if (result) {
            const qrData = result.getText();
            onQRCodeDetected(qrData);
            stopScanning();
            
            toast({
              title: t("qr_scanner.code_detected"),
              description: t("qr_scanner.processing_data"),
            });
          }
          
          if (error && !(error instanceof TypeError)) {
            // TypeError jest zgłaszany, gdy nie ma kodu QR w kadrze - to normalne
            console.error("QR Scanner error:", error);
          }
        }
      );
    } catch (error) {
      console.error("Error starting QR scanner:", error);
      toast({
        title: t("qr_scanner.error"),
        description: t("qr_scanner.camera_access_error"),
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    reader.reset();
    setIsScanning(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative">
        {isScanning ? (
          <>
            <video 
              ref={videoRef} 
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-primary/70 rounded-lg"></div>
            </div>
            <Button 
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={stopScanning}
            >
              <XCircle className="mr-1 h-4 w-4" />
              {t("qr_scanner.stop_scanning")}
            </Button>
          </>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center p-4 text-center space-y-4">
            <Camera className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-medium">{t("qr_scanner.scan_title")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("qr_scanner.scan_description")}
              </p>
            </div>
            <Button onClick={startScanning}>
              <Camera className="mr-2 h-4 w-4" />
              {t("qr_scanner.start_scanning")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}