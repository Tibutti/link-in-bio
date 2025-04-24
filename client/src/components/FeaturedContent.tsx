import { type FeaturedContent as FeaturedContentType } from "@shared/schema";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FeaturedContentProps {
  contents: FeaturedContentType[];
  onContentClick: (url: string) => void;
}

export default function FeaturedContent({ contents, onContentClick }: FeaturedContentProps) {
  return (
    <section className="mb-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="featured" className="border-b border-t-0 border-x-0">
          <AccordionTrigger className="py-4 text-xl font-bold text-gray-800 hover:no-underline">
            Wybrane projekty
            <div className="ml-2 text-primary">
              <span className="text-sm">{contents.length}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
