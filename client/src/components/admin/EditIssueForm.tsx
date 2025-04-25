import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";

// Typ dla usterki
type Issue = {
  id: number;
  profileId: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  severity: "low" | "medium" | "high" | "critical" | null;
  status: string;
  isResolved: boolean | null;
  createdAt: string;
  resolvedAt: string | null;
};

// Schemat walidacji dla formularza edycji usterki
const editIssueSchema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  status: z.enum(["open", "in_progress", "resolved"]).default("open"),
});

type FormValues = z.infer<typeof editIssueSchema>;

type EditIssueFormProps = {
  issue: Issue;
  onSuccess: () => void;
  onCancel: () => void;
};

export function EditIssueForm({ issue, onSuccess, onCancel }: EditIssueFormProps) {
  const { toast } = useToast();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(issue.imageUrl);

  const defaultValues: FormValues = {
    title: issue.title,
    description: issue.description || "",
    imageUrl: issue.imageUrl || "",
    severity: issue.severity || "medium",
    status: issue.status as "open" | "in_progress" | "resolved",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(editIssueSchema),
    defaultValues,
  });

  // Mutacja do uploadowania pliku
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      // Pobranie tokenu uwierzytelniającego z localStorage
      const token = localStorage.getItem('authToken');
      
      // Przygotowanie nagłówków z tokenem uwierzytelniającym
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Wystąpił błąd podczas przesyłania obrazu');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Ustawienie URL z odpowiedzi od serwera
      form.setValue('imageUrl', data.url);
      setExistingImageUrl(data.url); // Aktualizacja stanu dla podglądu
      setUploadingImage(false);
      toast({
        title: "Obraz przesłany",
        description: "Obraz został pomyślnie przesłany.",
      });
    },
    onError: (error: Error) => {
      setUploadingImage(false);
      toast({
        title: "Błąd podczas przesyłania obrazu",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Obsługa zmiany pliku
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    
    if (file) {
      // Sprawdzenie typu pliku
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        toast({
          title: "Nieprawidłowy format pliku",
          description: "Dozwolone są tylko pliki obrazów (JPG, PNG, GIF, WEBP).",
          variant: "destructive",
        });
        return;
      }
      
      // Sprawdzenie rozmiaru pliku (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Plik jest zbyt duży",
          description: "Maksymalny rozmiar pliku to 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Tworzenie URL dla podglądu
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  // Funkcja uploadująca obraz
  const uploadImage = async () => {
    if (selectedFile) {
      setUploadingImage(true);
      await uploadImageMutation.mutateAsync(selectedFile);
    }
  };

  const updateIssueMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return apiRequest(`/api/issues/${issue.id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Usterka zaktualizowana",
        description: "Usterka została pomyślnie zaktualizowana",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Błąd podczas aktualizacji usterki",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormValues) => {
    // Jeśli mamy plik do przesłania i zmodyfikowaliśmy obraz
    if (selectedFile && previewUrl) {
      await uploadImage();
      // Po przesłaniu obrazu form.getValues('imageUrl') będzie zaktualizowane
    }
    
    updateIssueMutation.mutate(data);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edytuj usterkę</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tytuł</FormLabel>
                  <FormControl>
                    <Input placeholder="Wprowadź tytuł usterki" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis (opcjonalnie)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Opisz problem szczegółowo..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obraz (opcjonalnie)</FormLabel>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      id="issue-image-upload-edit"
                      onChange={handleFileChange}
                    />
                    
                    {/* Przycisk do wyboru pliku */}
                    <div>
                      <label htmlFor="issue-image-upload-edit" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md w-fit">
                          <Upload className="h-4 w-4" />
                          <span>{existingImageUrl ? 'Zmień obraz' : 'Wybierz obraz'}</span>
                        </div>
                      </label>
                      
                      {selectedFile && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Wybrany plik: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                        </p>
                      )}
                    </div>
                    
                    {/* Przycisk do przesłania obrazu - przeniesiony wyżej */}
                    {selectedFile && !uploadingImage && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={uploadImage}
                        disabled={uploadingImage}
                        className="mt-2"
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Przesyłanie...
                          </>
                        ) : (
                          <>Prześlij nowy obraz</>
                        )}
                      </Button>
                    )}
                    
                    {/* Komunikat o trwającym uploadzie */}
                    {uploadingImage && (
                      <div className="text-sm text-amber-600 flex items-center gap-2 mt-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Przesyłanie obrazu...
                      </div>
                    )}
                    
                    {/* Podgląd istniejącego obrazu - zmniejszona maksymalna wysokość */}
                    {existingImageUrl && !previewUrl && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Obecny obraz:</p>
                        <div className="relative border rounded-md overflow-hidden" style={{ maxWidth: '100%' }}>
                          <img 
                            src={existingImageUrl} 
                            alt="Obecny obraz" 
                            className="max-w-full h-auto" 
                            style={{ maxHeight: '200px', objectFit: 'contain' }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Podgląd nowego obrazu - zmniejszona maksymalna wysokość */}
                    {previewUrl && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Podgląd nowego obrazu:</p>
                        <div className="relative border rounded-md overflow-hidden" style={{ maxWidth: '100%' }}>
                          <img 
                            src={previewUrl} 
                            alt="Podgląd" 
                            className="max-w-full h-auto" 
                            style={{ maxHeight: '200px', objectFit: 'contain' }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Ukryte pole z URL obrazu */}
                    <Input 
                      type="hidden"
                      {...field}
                      value={field.value || ""}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorytet</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz priorytet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Niski</SelectItem>
                      <SelectItem value="medium">Średni</SelectItem>
                      <SelectItem value="high">Wysoki</SelectItem>
                      <SelectItem value="critical">Krytyczny</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="open">Otwarta</SelectItem>
                      <SelectItem value="in_progress">W trakcie</SelectItem>
                      <SelectItem value="resolved">Rozwiązana</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Przyciski w sticky footer dla lepszej dostępności */}
            <div className="sticky bottom-0 pt-4 pb-2 bg-background flex justify-end space-x-2">
              <Button variant="outline" onClick={onCancel} type="button">
                Anuluj
              </Button>
              <Button
                type="submit"
                disabled={updateIssueMutation.isPending}
              >
                {updateIssueMutation.isPending ? "Aktualizowanie..." : "Zapisz zmiany"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}