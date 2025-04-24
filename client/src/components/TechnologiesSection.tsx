import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Technology, TechnologyCategory, technologyCategories } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

interface TechnologiesSectionProps {
  profileId: number;
  showTechnologies?: boolean;
}

export default function TechnologiesSection({ profileId, showTechnologies = true }: TechnologiesSectionProps) {
  // Pobieranie wszystkich technologii
  const { data: technologies = [], isLoading } = useQuery<Technology[]>({
    queryKey: [`/api/profile/${profileId}/technologies`],
    enabled: showTechnologies,
    staleTime: 1000 * 60 * 5, // 5 minut
  });

  // Grupowanie technologii według kategorii
  const technologiesByCategory = technologies.reduce((acc: Record<string, Technology[]>, tech: Technology) => {
    if (!acc[tech.category]) {
      acc[tech.category] = [];
    }
    acc[tech.category].push(tech);
    return acc;
  }, {} as Record<string, Technology[]>);

  // Sortowanie technologii według ich kolejności
  Object.keys(technologiesByCategory).forEach(category => {
    technologiesByCategory[category].sort((a: Technology, b: Technology) => (a.order || 0) - (b.order || 0));
  });

  if (!showTechnologies) return null;
  if (isLoading) return <div className="py-6 px-4 text-center">Ładowanie technologii...</div>;
  if (technologies.length === 0) return null;

  // Znajdujemy kategorie, które mają przypisane technologie
  const categoriesWithTechnologies = Object.keys(technologiesByCategory).filter(
    category => technologiesByCategory[category]?.length > 0
  ) as TechnologyCategory[];

  // Animacje dla kart technologii
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

  return (
    <div className="mb-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="technologies" className="border-b border-t-0 border-x-0">
          <AccordionTrigger className="py-4 text-xl font-bold text-gray-800 hover:no-underline">
            Umiejętności techniczne
            <div className="ml-2 text-primary">
              <span className="text-sm">{technologies.length}</span>
            </div>
          </AccordionTrigger>
          
          <AccordionContent>
            <div className="py-2">
              {categoriesWithTechnologies.map((category) => (
                <Accordion 
                  key={category} 
                  type="single" 
                  collapsible 
                  className="w-full mb-2 border rounded-lg overflow-hidden"
                >
                  <AccordionItem value={category} className="border-0">
                    <AccordionTrigger className="px-4 py-3 bg-gray-50 hover:no-underline">
                      <div className="flex items-center">
                        <span className="font-medium">{getCategoryDisplayName(category)}</span>
                        <Badge variant="outline" className="ml-2">
                          {technologiesByCategory[category].length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4"
                        variants={container}
                        initial="hidden"
                        animate="show"
                      >
                        {technologiesByCategory[category]?.map((tech: Technology) => (
                          <motion.div key={tech.id} variants={item}>
                            <TechnologyCard technology={tech} />
                          </motion.div>
                        ))}
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

interface TechnologyCardProps {
  technology: Technology;
}

function TechnologyCard({ technology }: TechnologyCardProps) {
  return (
    <div className="flex flex-col p-4 border rounded-lg bg-gray-50 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-3">
        {technology.logoUrl && (
          <div className="h-10 w-10 mr-3 flex items-center justify-center">
            <img 
              src={technology.logoUrl} 
              alt={`${technology.name} logo`} 
              className="max-h-10 max-w-10"
            />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-lg leading-tight">{technology.name}</h3>
          <Badge variant="outline" className="mt-1">
            {technology.yearsOfExperience 
              ? `${technology.yearsOfExperience} ${technology.yearsOfExperience === 1 ? 'rok' : 'lat'} doświadczenia` 
              : getCategoryDisplayName(technology.category)}
          </Badge>
        </div>
      </div>
      
      {technology.proficiencyLevel !== undefined && technology.proficiencyLevel !== null && technology.proficiencyLevel > 0 && (
        <div className="mt-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Poziom umiejętności</span>
            <span>{technology.proficiencyLevel}%</span>
          </div>
          <Progress value={technology.proficiencyLevel} className="h-2" />
        </div>
      )}
    </div>
  );
}

// Funkcja pomocnicza do formatowania nazw kategorii
function getCategoryDisplayName(category: string): string {
  const displayNames: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    mobile: 'Mobile',
    devops: 'DevOps',
    database: 'Bazy danych',
    cloud: 'Chmura',
    testing: 'Testowanie',
    design: 'Design',
    other: 'Inne'
  };
  
  return displayNames[category] || category;
}