import { type SocialLink } from "@shared/schema";
import { motion } from "framer-motion";
import { 
  FaInstagram, FaLinkedin, FaYoutube, FaTiktok, 
  FaDribbble, FaBehance, FaGithub, FaMedium, FaFacebook,
  FaPatreon, FaSoundcloud, FaSpotify, FaTwitch, FaReddit,
  FaSnapchat, FaPinterest, FaWhatsapp, FaTelegram, 
  FaDev, FaStackOverflow
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiHashnode, SiSubstack } from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import AccordionSection from "./AccordionSection";
import { useTranslation } from "react-i18next";

interface SocialLinksProps {
  links: SocialLink[];
  onLinkClick: (url: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  // Social Media
  instagram: FaInstagram,
  twitter: FaXTwitter, // Zaktualizowano na X (dawniej Twitter)
  x: FaXTwitter,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  facebook: FaFacebook,
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  patreon: FaPatreon,
  soundcloud: FaSoundcloud,
  spotify: FaSpotify,
  twitch: FaTwitch,
  reddit: FaReddit,
  snapchat: FaSnapchat,
  pinterest: FaPinterest,
  
  // Knowledge & Portfolio Platforms
  dribbble: FaDribbble,
  behance: FaBehance,
  github: FaGithub,
  medium: FaMedium,
  substack: SiSubstack,
  devto: FaDev,
  hashnode: SiHashnode,
  stackoverflow: FaStackOverflow
};

export default function SocialLinks({ links, onLinkClick }: SocialLinksProps) {
  const { t } = useTranslation();
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Podziel linki na kategorie
  const socialLinks = links.filter(link => link.category === 'social');
  const knowledgeLinks = links.filter(link => link.category === 'knowledge');

  // Funkcja do renderowania pojedynczego linku
  const renderLinkItem = (link: SocialLink) => {
    const Icon = iconMap[link.iconName.toLowerCase()] || FaInstagram;
    
    return (
      <motion.a
        key={link.id}
        href="#"
        onClick={(e) => { 
          e.preventDefault(); 
          onLinkClick(link.url); 
        }}
        className="block w-full p-4 bg-background dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 border border-border dark:border-gray-700 group"
        variants={item}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary group-hover:bg-primary transition-colors duration-300">
            <Icon className="text-muted-foreground group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="ml-4">
            <span className="font-medium text-foreground">{link.platform}</span>
            <p className="text-sm text-muted-foreground">{link.username}</p>
          </div>
          <div className="ml-auto">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
      </motion.a>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sekcja mediów społecznościowych */}
      {socialLinks.length > 0 && (
        <AccordionSection 
          title={t('sections.social')}
          value="social"
          badge={
            <Badge variant="outline" className="bg-primary/10 text-foreground dark:text-foreground">
              {socialLinks.length}
            </Badge>
          }
        >
          <motion.section 
            className="space-y-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {socialLinks.map(renderLinkItem)}
          </motion.section>
        </AccordionSection>
      )}
      
      {/* Sekcja platform wiedzy i twórczości */}
      {knowledgeLinks.length > 0 && (
        <AccordionSection 
          title={t('sections.knowledge')}
          value="knowledge"
          badge={
            <Badge variant="outline" className="bg-primary/10 text-foreground dark:text-foreground">
              {knowledgeLinks.length}
            </Badge>
          }
        >
          <motion.section 
            className="space-y-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {knowledgeLinks.map(renderLinkItem)}
          </motion.section>
        </AccordionSection>
      )}
    </div>
  );
}
