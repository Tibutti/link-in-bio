import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ContactDetailsFormProps {
  profileId: number;
  email?: string;
  phone?: string;
  onSuccess: () => void;
}

const contactDetailsSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres email" }).or(z.literal("")),
  phone: z.string().optional(),
});

type ContactDetailsFormValues = z.infer<typeof contactDetailsSchema>;

export function ContactDetailsForm({ profileId, email = "", phone = "", onSuccess }: ContactDetailsFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactDetailsFormValues>({
    resolver: zodResolver(contactDetailsSchema),
    defaultValues: {
      email,
      phone,
    },
  });

  const onSubmit = async (values: ContactDetailsFormValues) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest(`/api/profile/${profileId}/contact`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      
      toast({
        title: "Zaktualizowano dane kontaktowe",
        description: "Twoje dane kontaktowe zostały pomyślnie zaktualizowane",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      onSuccess();
    } catch (error) {
      console.error("Błąd podczas aktualizacji danych kontaktowych:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować danych kontaktowych",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dane kontaktowe</CardTitle>
        <CardDescription>
          Zaktualizuj swój adres email i numer telefonu
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adres email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numer telefonu</FormLabel>
                  <FormControl>
                    <Input placeholder="+48 123 456 789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}