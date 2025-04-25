import { ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AccordionSectionProps {
  title: string;
  value: string;
  badge?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function AccordionSection({ 
  title, 
  value, 
  badge,
  children,
  defaultOpen = false
}: AccordionSectionProps) {
  return (
    <div 
      className="mb-6" 
      id={value}
      tabIndex={-1} // Umożliwia ustawienie fokusa na sekcji dla dostępności
    >
      <Accordion 
        type="single" 
        collapsible 
        className="w-full rounded-lg border border-border shadow-sm overflow-hidden bg-background dark:bg-gray-800"
        defaultValue={defaultOpen ? value : undefined}
      >
        <AccordionItem value={value} className="border-b-0 border-t-0 border-x-0 transition-all duration-300">
          <AccordionTrigger 
            className="py-4 px-5 text-xl font-bold text-foreground hover:no-underline bg-gradient-to-r from-background to-muted/10 dark:from-background/80 dark:to-muted/20 group-data-[state=open]:rounded-b-none"
            aria-controls={`content-${value}`}
            aria-expanded="false"
          >
            <div className="flex items-center w-full justify-between">
              <span>{title}</span>
              {badge && (
                <div className="flex items-center gap-2">
                  {badge}
                  <div className="w-4"></div> {/* Przestrzeń na ikonę strzałki */}
                </div>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent 
            className="bg-background dark:bg-gray-800"
            id={`content-${value}`}
          >
            <div className="pt-2 pb-4 px-5">
              {children}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}