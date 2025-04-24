import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Technology, TechnologyCategory, technologyCategories } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface TechnologiesSectionProps {
  profileId: number;
  showTechnologies?: boolean;
}

export default function TechnologiesSection({ profileId, showTechnologies = true }: TechnologiesSectionProps) {
  const [activeCategory, setActiveCategory] = useState<TechnologyCategory>('frontend');

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

  return (
    <div className="py-6 px-4 bg-white rounded-xl shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-center">Umiejętności techniczne</h2>
      
      <Tabs defaultValue={activeCategory} onValueChange={(value) => setActiveCategory(value as TechnologyCategory)}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
          {categoriesWithTechnologies.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {getCategoryDisplayName(category)}
            </TabsTrigger>
          ))}
        </TabsList>

        {categoriesWithTechnologies.map(category => (
          <TabsContent key={category} value={category} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {technologiesByCategory[category]?.map((tech: Technology) => (
                <TechnologyCard key={tech.id} technology={tech} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
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