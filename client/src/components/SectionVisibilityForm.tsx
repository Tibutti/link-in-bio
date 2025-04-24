import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useMemo } from "react";
import { GripVertical } from "lucide-react";

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

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const sectionVisibilitySchema = z.object({
  showImage: z.boolean().default(true),
  showContact: z.boolean().default(true),
  showSocial: z.boolean().default(true),
  showKnowledge: z.boolean().default(true),
  showFeatured: z.boolean().default(true),
  showTryHackMe: z.boolean().default(true),
  showTechnologies: z.boolean().default(true),
  showGithubStats: z.boolean().default(true),
});

type SectionVisibilityFormValues = z.infer<typeof sectionVisibilitySchema>;

// Interfejs dla pozycji sekcji z informacją o kolejności
interface SectionItem {
  id: string;
  name: string;
  description: string;
  fieldName: keyof SectionVisibilityFormValues;
  order: number;
  fixed?: boolean; // Czy pozycja jest zablokowana (nie można jej przesuwać)
}

interface SectionVisibilityFormProps {
  profileId: number;
  showImage: boolean;
  showContact: boolean;
  showSocial: boolean;
  showKnowledge: boolean;
  showFeatured: boolean;
  showTryHackMe: boolean;
  showTechnologies: boolean;
  showGithubStats: boolean;
  sectionOrder?: string[]; // Lista ID sekcji w odpowiedniej kolejności
  onSuccess?: () => void;
}

// Sortable item component
interface SortableSectionItemProps {
  id: string;
  item: SectionItem;
  isFixed?: boolean;
  children: React.ReactNode;
}

function SortableSectionItem({ id, item, isFixed = false, children }: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id, 
    disabled: isFixed 
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} className="relative">
      {!isFixed && (
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab text-gray-400 touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </div>
      )}
      <div className={`${isFixed ? '' : 'pl-8'}`}>
        {children}
      </div>
    </div>
  );
}

export function SectionVisibilityForm({
  profileId,
  showImage = true,
  showContact = true,
  showSocial = true,
  showKnowledge = true,
  showFeatured = true,
  showTryHackMe = true,
  showTechnologies = true,
  showGithubStats = true,
  sectionOrder: initialSectionOrder,
  onSuccess
}: SectionVisibilityFormProps) {
  const { toast } = useToast();
  
  // Definicja domyślnych elementów sekcji
  const defaultSections: SectionItem[] = [
    {
      id: 'image',
      name: 'Zdjęcie profilowe',
      description: 'Pokazuj swoje zdjęcie profilowe na stronie',
      fieldName: 'showImage',
      order: 1,
      fixed: true
    },
    {
      id: 'contact',
      name: 'Informacje kontaktowe',
      description: 'Pokazuj dane kontaktowe (email, telefon) na stronie',
      fieldName: 'showContact',
      order: 2,
      fixed: true
    },
    {
      id: 'social',
      name: 'Media społecznościowe',
      description: 'Pokazuj linki do mediów społecznościowych na stronie',
      fieldName: 'showSocial',
      order: 3
    },
    {
      id: 'knowledge',
      name: 'Platformy wiedzy',
      description: 'Pokazuj linki do platform wiedzy na stronie',
      fieldName: 'showKnowledge',
      order: 4
    },
    {
      id: 'featured',
      name: 'Wyróżnione treści',
      description: 'Pokazuj wyróżnione treści na stronie',
      fieldName: 'showFeatured',
      order: 5
    },
    {
      id: 'github',
      name: 'Statystyki GitHub',
      description: 'Pokazuj statystyki i aktywność z GitHub na stronie',
      fieldName: 'showGithubStats',
      order: 6
    },
    {
      id: 'tryhackme',
      name: 'Odznaka TryHackMe',
      description: 'Pokazuj odznakę i statystyki z TryHackMe na stronie',
      fieldName: 'showTryHackMe',
      order: 7
    },
    {
      id: 'technologies',
      name: 'Technologie',
      description: 'Pokazuj sekcję technologii i umiejętności na stronie',
      fieldName: 'showTechnologies',
      order: 8
    }
  ];
  
  // Parsowanie kolejności sekcji z zapisanej konfiguracji lub użycie domyślnej
  const parseSectionOrder = () => {
    if (initialSectionOrder && initialSectionOrder.length > 0) {
      // Najpierw dodajemy elementy w zapisanej kolejności
      const parsedSections = initialSectionOrder.map((id, index) => {
        const existingSection = defaultSections.find(s => s.id === id);
        if (existingSection) {
          return { ...existingSection, order: index + 1 };
        }
        return null;
      }).filter(Boolean) as SectionItem[];
      
      // Dodajemy elementy, których nie ma w zapisanej kolejności
      const missingElements = defaultSections.filter(
        section => !initialSectionOrder.includes(section.id)
      );
      
      return [...parsedSections, ...missingElements].sort((a, b) => {
        // Zachowujemy pierwsze dwa elementy na stałych pozycjach
        if (a.id === 'image') return -1;
        if (b.id === 'image') return 1;
        if (a.id === 'contact') return -1;
        if (b.id === 'contact') return 1;
        return a.order - b.order;
      });
    }
    
    return defaultSections;
  };
  
  // Stan dla sekcji z możliwością sortowania
  const [sections, setSections] = useState<SectionItem[]>(parseSectionOrder());
  
  // Konfiguracja czujników dla dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Obsługa przeciągania elementów
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    setSections(items => {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      // Nie pozwalamy na przesuwanie elementów stałych
      if (items[oldIndex].fixed || items[newIndex].fixed) {
        return items;
      }
      
      // Tworzymy nową tablicę elementów w nowej kolejności
      const newArray = [...items];
      const movedItem = newArray.splice(oldIndex, 1)[0];
      newArray.splice(newIndex, 0, movedItem);
      
      // Aktualizujemy kolejność elementów
      return newArray.map((item, index) => ({
        ...item,
        order: index + 1
      }));
    });
  };
  
  // Tworzenie nowej kolejności sekcji do zapisania
  const getSectionOrderArray = () => {
    return sections.map(section => section.id);
  };
  
  const form = useForm<SectionVisibilityFormValues>({
    resolver: zodResolver(sectionVisibilitySchema),
    defaultValues: {
      showImage,
      showContact,
      showSocial,
      showKnowledge,
      showFeatured,
      showTryHackMe,
      showTechnologies,
      showGithubStats,
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async (values: SectionVisibilityFormValues & { sectionOrder?: string[] }) => {
      return apiRequest(`/api/profile/${profileId}/section-visibility`, {
        method: "PATCH",
        body: JSON.stringify({
          ...values,
          sectionOrder: getSectionOrderArray()
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Ustawienia widoczności zaktualizowane",
        description: "Twoje ustawienia zostały zapisane pomyślnie.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować ustawień widoczności.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: SectionVisibilityFormValues) => {
    updateMutation.mutate({
      ...values,
      sectionOrder: getSectionOrderArray()
    });
  };
  
  // Renderowanie elementy formularza dla określonej sekcji
  const renderSectionFormField = (section: SectionItem) => (
    <FormField
      key={section.id}
      control={form.control}
      name={section.fieldName}
      render={({ field }) => (
        <SortableSectionItem id={section.id} item={section} isFixed={section.fixed}>
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">{section.name}</FormLabel>
              <FormDescription>
                {section.description}
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        </SortableSectionItem>
      )}
    />
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Widoczność sekcji</CardTitle>
        <CardDescription>
          Zarządzaj widocznością i kolejnością sekcji na swojej stronie
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertDescription>
            Możesz zmieniać kolejność sekcji przeciągając je. Elementy "Zdjęcie profilowe" i "Informacje kontaktowe" zawsze będą na górze.
          </AlertDescription>
        </Alert>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sections.map(section => section.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {sections.map(section => renderSectionFormField(section))}
                </div>
              </SortableContext>
            </DndContext>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Zapisywanie..." : "Zapisz ustawienia"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}