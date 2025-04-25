import { type FeaturedContent as FeaturedContentType } from "@shared/schema";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import AccordionSection from "./AccordionSection";
import { useTranslation } from "react-i18next";

interface FeaturedContentProps {
  contents: FeaturedContentType[];
  onContentClick: (url: string) => void;
}

export default function FeaturedContent({ contents, onContentClick }: FeaturedContentProps) {
  const { t } = useTranslation();
  
  return (
    <AccordionSection
      title={t('sections.featured')}
      value="featured"
      badge={
        <Badge variant="outline" className="bg-primary/10 text-foreground dark:text-foreground">
          {contents.length}
        </Badge>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contents.map((content, index) => (
          <motion.div
            key={content.id}
            className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => content.linkUrl && onContentClick(content.linkUrl)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + (index * 0.1) }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <img 
              src={content.imageUrl} 
              alt={content.title} 
              className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-70"></div>
            <div className="absolute bottom-0 left-0 p-3 text-white">
              <h3 className="font-medium text-sm">{content.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </AccordionSection>
  );
}
