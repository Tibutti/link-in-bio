import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import ContactsTable from "./ContactsTable";
import { QRScanner } from "./QRScanner";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function ContactsAdminPanel() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("contacts");

  const handleQRCodeDetected = (data: string) => {
    try {
      // Sprawdź, czy kod QR zawiera poprawny format danych kontaktowych
      if (data.includes('profile') && data.includes('add_contact=true')) {
        const url = new URL(data);
        const profileId = url.searchParams.get('profile');
        
        if (profileId) {
          window.location.href = `/?profile=${profileId}&add_contact=true`;
          
          toast({
            title: t("contacts.contact_qr_detected"),
            description: t("contacts.redirecting_to_add_contact"),
          });
        } else {
          throw new Error("Missing profile ID in QR code");
        }
      } else {
        toast({
          title: t("contacts.invalid_qr_code"),
          description: t("contacts.qr_code_not_contact"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast({
        title: t("contacts.invalid_qr_code"),
        description: t("contacts.qr_parse_error"),
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-blue-600">{t("contacts.contacts_manager")}</CardTitle>
        <CardDescription>
          {t("contacts.contacts_manager_description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="contacts">{t("contacts.my_contacts")}</TabsTrigger>
            <TabsTrigger value="scanner">{t("contacts.scan_qr")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contacts">
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>{t("contacts.info_title")}</AlertTitle>
                <AlertDescription>
                  {t("contacts.contacts_info")}
                </AlertDescription>
              </Alert>
              
              <ContactsTable />
            </div>
          </TabsContent>
          
          <TabsContent value="scanner">
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>{t("contacts.scanner_title")}</AlertTitle>
                <AlertDescription>
                  {t("contacts.scanner_description")}
                </AlertDescription>
              </Alert>
              
              <QRScanner onQRCodeDetected={handleQRCodeDetected} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}