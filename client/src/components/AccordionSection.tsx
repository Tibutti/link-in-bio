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
    <div className="mb-6">
      <Accordion 
        type="single" 
        collapsible 
        className="w-full rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white"
        defaultValue={defaultOpen ? value : undefined}
      >
        <AccordionItem value={value} className="border-b-0 border-t-0 border-x-0 transition-all duration-300">
          <AccordionTrigger 
            className="py-4 px-5 text-xl font-bold text-gray-800 hover:no-underline bg-gradient-to-r from-white to-gray-50 group-data-[state=open]:rounded-b-none"
          >
            <div className="flex items-center">
              {title}
              {badge && (
                <div className="ml-2">
                  {badge}
                </div>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-white">
            <div className="pt-2 pb-4 px-5">
              {children}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}