import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Copy, 
  Check,
  X,
  QrCode
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

interface QuickShareButtonsProps {
  url?: string;
  title?: string;
}

export function QuickShareButtons({ 
  url = window.location.href, 
  title = 'Sprawdź mój profil!' 
}: QuickShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();

  // Encoded data for sharing
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  // Share URLs
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  // Copy URL to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      
      toast({
        title: 'Skopiowano!',
        description: 'Link został skopiowany do schowka',
      });
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się skopiować linku',
        variant: 'destructive',
      });
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      } 
    }
  };

  const buttonVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      } 
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="flex flex-col gap-2 mb-2 items-end"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
          >
            <motion.div variants={buttonVariants}>
              <Button 
                size="icon" 
                variant="outline" 
                className="bg-background h-10 w-10 rounded-full shadow-md hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 transition-colors"
                onClick={() => window.open(twitterShareUrl, '_blank')}
                aria-label="Udostępnij na Twitter"
              >
                <Twitter size={18} />
              </Button>
            </motion.div>
            
            <motion.div variants={buttonVariants}>
              <Button 
                size="icon" 
                variant="outline" 
                className="bg-background h-10 w-10 rounded-full shadow-md hover:bg-blue-700 hover:text-white transition-colors"
                onClick={() => window.open(facebookShareUrl, '_blank')}
                aria-label="Udostępnij na Facebook"
              >
                <Facebook size={18} />
              </Button>
            </motion.div>
            
            <motion.div variants={buttonVariants}>
              <Button 
                size="icon" 
                variant="outline" 
                className="bg-background h-10 w-10 rounded-full shadow-md hover:bg-blue-800 hover:text-white transition-colors"
                onClick={() => window.open(linkedinShareUrl, '_blank')}
                aria-label="Udostępnij na LinkedIn"
              >
                <Linkedin size={18} />
              </Button>
            </motion.div>
            
            <motion.div variants={buttonVariants}>
              <Button 
                size="icon" 
                variant="outline" 
                className="bg-background h-10 w-10 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={copyToClipboard}
                aria-label="Kopiuj link"
              >
                {isCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              </Button>
            </motion.div>
            
            <motion.div variants={buttonVariants}>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="bg-background h-10 w-10 rounded-full shadow-md hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-600 transition-colors"
                    aria-label="Pokaż kod QR"
                  >
                    <QrCode size={18} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Kod QR</DialogTitle>
                    <DialogDescription>
                      Zeskanuj kod, aby otworzyć link do profilu
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <QRCodeSVG 
                        value={url}
                        size={200}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"L"}
                        includeMargin={true}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          size="icon" 
          className={`h-12 w-12 rounded-full shadow-lg ${isOpen ? 'bg-gray-700' : 'bg-primary'} transition-colors`}
          onClick={toggleOpen}
          aria-label={isOpen ? "Zamknij" : "Udostępnij"}
        >
          {isOpen ? <X size={20} /> : <Share2 size={20} />}
        </Button>
      </motion.div>
    </div>
  );
}