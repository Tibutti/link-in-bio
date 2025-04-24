import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Technology, TechnologyCategory, technologyCategories } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit, Eye, EyeOff, Trash, GripVertical, Code, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
// Importując po nazwie funkcji (nie jako domyślny eksport)
import { TechnologyForm } from "@/components/TechnologyForm";

interface TechnologiesAdminPanelProps {
  profileId: number;
}

export default function TechnologiesAdminPanel({ profileId }: TechnologiesAdminPanelProps) {
  const [activeCategory, setActiveCategory] = useState<TechnologyCategory>("frontend");
  const [isAddingTechnology, setIsAddingTechnology] = useState(false);
  const [editingTechnology, setEditingTechnology] = useState<Technology | null>(null);
  const queryClient = useQueryClient();

  // Pobieranie wszystkich technologii
  const { data: technologies = [], isLoading } = useQuery<Technology[]>({
    queryKey: [`/api/profile/${profileId}/technologies`],
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

  // Ustawienie dostępnych kategorii dla zakładek
  const categoriesWithTechnologies = Object.keys(technologiesByCategory).filter(
    category => technologiesByCategory[category]?.length > 0
  ) as TechnologyCategory[];

  // Czujniki dla drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Obsługa zmiany kolejności w kategorii
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = technologiesByCategory[activeCategory].findIndex(
        (t: Technology) => t.id === active.id
      );
      const newIndex = technologiesByCategory[activeCategory].findIndex(
        (t: Technology) => t.id === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // Tworzymy nową posortowaną tablicę technologii
        const newTechnologies = [...technologiesByCategory[activeCategory]];
        const [removed] = newTechnologies.splice(oldIndex, 1);
        newTechnologies.splice(newIndex, 0, removed);

        // Przygotowanie ID do przesortowania
        const orderedIds = newTechnologies.map((tech: Technology) => tech.id);

        // Wysyłamy do serwera nową kolejność
        try {
          await apiRequest(`/api/profile/${profileId}/technologies/category/${activeCategory}/reorder`, {
            method: "POST",
            body: JSON.stringify({ orderedIds }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          // Odświeżamy dane
          queryClient.invalidateQueries({
            queryKey: [`/api/profile/${profileId}/technologies`]
          });
        } catch (error) {
          console.error("Błąd podczas zmiany kolejności technologii:", error);
        }
      }
    }
  };

  // Obsługa zmiany widoczności technologii
  const handleToggleVisibility = async (technology: Technology) => {
    try {
      await apiRequest(`/api/technologies/${technology.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isVisible: !technology.isVisible }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Odświeżamy dane
      queryClient.invalidateQueries({
        queryKey: [`/api/profile/${profileId}/technologies`]
      });
    } catch (error) {
      console.error("Błąd podczas zmiany widoczności technologii:", error);
    }
  };

  // Obsługa usuwania technologii
  const handleDeleteTechnology = async (id: number) => {
    try {
      await apiRequest(`/api/technologies/${id}`, {
        method: "DELETE"
      });

      // Odświeżamy dane
      queryClient.invalidateQueries({
        queryKey: [`/api/profile/${profileId}/technologies`]
      });
    } catch (error) {
      console.error("Błąd podczas usuwania technologii:", error);
    }
  };

  // Obsługa dodawania/edycji technologii
  const handleTechnologyFormSuccess = () => {
    setIsAddingTechnology(false);
    setEditingTechnology(null);
    queryClient.invalidateQueries({
      queryKey: [`/api/profile/${profileId}/technologies`]
    });
  };

  if (isLoading) {
    return <div className="p-4 text-center">Ładowanie technologii...</div>;
  }

  // Wyświetlamy panel do dodawania/edycji technologii
  if (isAddingTechnology || editingTechnology) {
    return (
      <TechnologyForm
        profileId={profileId}
        technology={editingTechnology || undefined}
        onSuccess={handleTechnologyFormSuccess}
        onCancel={() => {
          setIsAddingTechnology(false);
          setEditingTechnology(null);
        }}
      />
    );
  }

  // Dodajemy wszystkie kategorie, nawet jeśli nie mają jeszcze technologii
  // Tworzymy zbiór kategorii jako zwykłą tablicę, aby uniknąć problemów z typowaniem Set
  const allCategoriesSet = new Set([...categoriesWithTechnologies, ...technologyCategories]);
  const allCategories = Array.from(allCategoriesSet) as TechnologyCategory[];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Technologie
        </CardTitle>
        <Button onClick={() => setIsAddingTechnology(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Dodaj technologię
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeCategory} onValueChange={(value) => setActiveCategory(value as TechnologyCategory)}>
          <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-6">
            {allCategories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {getCategoryDisplayName(category)}
              </TabsTrigger>
            ))}
          </TabsList>

          {allCategories.map(category => (
            <TabsContent key={category} value={category} className="space-y-4">
              {technologiesByCategory[category]?.length ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={technologiesByCategory[category]?.map((tech: Technology) => tech.id) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {technologiesByCategory[category]?.map((technology: Technology) => (
                        <SortableTechnologyItem
                          key={technology.id}
                          technology={technology}
                          onToggleVisibility={handleToggleVisibility}
                          onEdit={() => setEditingTechnology(technology)}
                          onDelete={handleDeleteTechnology}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="p-4 text-center text-gray-500 border rounded-md">
                  Brak technologii w tej kategorii. Kliknij "Dodaj technologię", aby dodać pierwszą.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface SortableTechnologyItemProps {
  technology: Technology;
  onToggleVisibility: (technology: Technology) => void;
  onEdit: () => void;
  onDelete: (id: number) => void;
}

function SortableTechnologyItem({ technology, onToggleVisibility, onEdit, onDelete }: SortableTechnologyItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: technology.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 border rounded-md ${technology.isVisible ? 'bg-white' : 'bg-gray-50'}`}
    >
      <div className="flex items-center flex-1">
        <div {...attributes} {...listeners} className="cursor-grab pr-3">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>

        <div className="flex items-center flex-1">
          {technology.logoUrl && (
            <div className="h-8 w-8 mr-3 flex items-center justify-center">
              <img 
                src={technology.logoUrl} 
                alt={`${technology.name} logo`} 
                className="max-h-8 max-w-8"
              />
            </div>
          )}
          <div>
            <div className="font-medium">{technology.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {getCategoryDisplayName(technology.category)}
              </Badge>
              {technology.proficiencyLevel !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {technology.proficiencyLevel}%
                </Badge>
              )}
              {technology.yearsOfExperience && (
                <Badge variant="outline" className="text-xs">
                  {technology.yearsOfExperience} {technology.yearsOfExperience === 1 ? 'rok' : 'lat'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={technology.isVisible}
          onCheckedChange={() => onToggleVisibility(technology)}
          aria-label={technology.isVisible ? "Ukryj" : "Pokaż"}
        />
        <Button variant="ghost" size="icon" onClick={onEdit} title="Edytuj">
          <Edit className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Usuń">
              <Trash className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
              <AlertDialogDescription>
                Zamierzasz usunąć technologię "{technology.name}". Ta akcja jest nieodwracalna.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anuluj</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(technology.id)}>Usuń</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
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