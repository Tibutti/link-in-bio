import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Terminal, Loader2 } from "lucide-react";
import { Technology, technologyCategories } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface TechnologyFormProps {
  profileId: number;
  technology?: Technology;
  onSuccess: () => void;
  onCancel: () => void;
}

// Mapa nazwanych etykiet dla kategorii
const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  mobile: "Mobile",
  devops: "DevOps",
  database: "Bazy danych",
  cloud: "Chmura",
  testing: "Testowanie",
  design: "Design",
  other: "Inne",
};

// Schema dla formularza
const technologyFormSchema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  logoUrl: z.string().url("Wprowadź poprawny URL do logo").optional().nullable(),
  category: z.enum(technologyCategories, {
    required_error: "Wybierz kategorię technologii",
  }),
  proficiencyLevel: z.number().min(0).max(100).default(50),
  yearsOfExperience: z.number().min(0).max(50).optional().nullable(),
  isVisible: z.boolean().default(true),
});

type TechnologyFormValues = z.infer<typeof technologyFormSchema>;

export function TechnologyForm({ profileId, technology, onSuccess, onCancel }: TechnologyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!technology;

  const form = useForm<TechnologyFormValues>({
    resolver: zodResolver(technologyFormSchema),
    defaultValues: {
      name: technology?.name || "",
      logoUrl: technology?.logoUrl || "",
      category: technology?.category || "frontend",
      proficiencyLevel: technology?.proficiencyLevel || 50,
      yearsOfExperience: technology?.yearsOfExperience || 0,
      isVisible: technology?.isVisible !== undefined ? technology.isVisible : true,
    },
  });

  async function onSubmit(values: TechnologyFormValues) {
    setIsSubmitting(true);
    try {
      if (isEditing && technology) {
        // Aktualizacja istniejącej technologii
        await apiRequest(`/api/technologies/${technology.id}`, {
          method: "PATCH",
          data: values,
        });
      } else {
        // Dodawanie nowej technologii
        await apiRequest(`/api/profile/${profileId}/technologies`, {
          method: "POST",
          data: values,
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Błąd podczas zapisywania technologii:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            {isEditing ? "Edytuj technologię" : "Dodaj nową technologię"}
          </CardTitle>
          <div className="w-9" /> {/* Element dla zachowania wyśrodkowania */}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa technologii</FormLabel>
                  <FormControl>
                    <Input placeholder="np. React, Python, Docker" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL logo</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.svg" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    Link do logo w formacie SVG (preferowany) lub PNG
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz kategorię" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {technologyCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {CATEGORY_LABELS[category] || category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="proficiencyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poziom umiejętności: {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    Określ swój poziom znajomości tej technologii
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yearsOfExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lata doświadczenia</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      {...field}
                      onChange={e => field.onChange(e.target.valueAsNumber)}
                      value={field.value || 0}
                    />
                  </FormControl>
                  <FormDescription>
                    Podaj liczbę lat doświadczenia z tą technologią
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isVisible"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Widoczność</FormLabel>
                    <FormDescription>
                      Czy ta technologia ma być widoczna na stronie profilu?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onCancel} type="button">
                Anuluj
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? "Zapisz zmiany" : "Dodaj technologię"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}