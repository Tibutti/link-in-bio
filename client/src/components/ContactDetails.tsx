import { useState } from "react";
import { Mail, Phone, Copy, Check, FileText, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ContactDetailsProps {
  email?: string;
  phone?: string;
  cvUrl?: string;
}

export default function ContactDetails({ 
  email = "contact@example.com", 
  phone = "+48 123 456 789",
  cvUrl
}: ContactDetailsProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const copyToClipboard = async (text: string, type: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <motion.div
      className="my-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="overflow-hidden shadow-md border-0">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
            <div className="flex items-center p-4 gap-3">
              <div className="flex h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(email, 'email')}
                aria-label="Copy email address"
              >
                {copiedEmail ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex items-center p-4 gap-3">
              <div className="flex h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                <p className="text-sm font-medium truncate">{phone}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(phone, 'phone')}
                aria-label="Copy phone number"
              >
                {copiedPhone ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex items-center p-4 gap-3">
              <div className="flex h-10 w-10 rounded-full bg-primary/10 items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">CV</p>
                <p className="text-sm font-medium truncate">{cvUrl ? "Pobierz CV" : "CV niedostępne"}</p>
              </div>
              {cvUrl ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => window.open(cvUrl, '_blank')}
                  aria-label="Download CV"
                >
                  <Download className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-50 cursor-not-allowed"
                  disabled
                  aria-label="CV niedostępne"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}