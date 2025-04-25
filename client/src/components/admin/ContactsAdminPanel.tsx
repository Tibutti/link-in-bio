import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactsTable } from "./ContactsTable";
import { QRScanner } from "./QRScanner";
import { PlusCircle, QrCode, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function ContactsAdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scannerOpen, setScannerOpen] = useState(false);
  
  const showNotImplemented = () => {
    toast({
      title: "Funkcja w trakcie implementacji",
      description: "Ta funkcjonalność będzie dostępna w kolejnych wersjach aplikacji.",
    });
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Wizytownik</CardTitle>
            <CardDescription>
              Zarządzaj swoimi zapisanymi kontaktami
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden md:flex"
              onClick={showNotImplemented}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importuj
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden md:flex"
              onClick={showNotImplemented}
            >
              <Download className="h-4 w-4 mr-2" />
              Eksportuj
            </Button>
            <Button 
              size="sm"
              onClick={() => setScannerOpen(true)}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Skanuj QR
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" className="mt-2">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Wszystkie</TabsTrigger>
            <TabsTrigger value="recent">Ostatnio dodane</TabsTrigger>
            <TabsTrigger value="categories">Kategorie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ContactsTable userId={user.id} />
          </TabsContent>
          
          <TabsContent value="recent">
            <div className="text-center p-8 text-muted-foreground">
              <p>Funkcja filtrowania według ostatnio dodanych kontaktów będzie dostępna wkrótce.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="categories">
            <div className="text-center p-8 text-muted-foreground">
              <p>Funkcja organizacji kontaktów według kategorii będzie dostępna wkrótce.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={showNotImplemented}
          className="text-xs"
        >
          Zarządzaj kategoriami
        </Button>
        <Button 
          variant="outline" 
          className="text-xs"
          onClick={showNotImplemented}
        >
          <PlusCircle className="h-3 w-3 mr-1" />
          Dodaj ręcznie
        </Button>
      </CardFooter>
      
      <QRScanner 
        open={scannerOpen} 
        onClose={() => setScannerOpen(false)} 
      />
    </Card>
  );
}