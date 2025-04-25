import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Contact } from "@shared/schema";
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
  SelectValue 
} from "@/components/ui/select";

const ContactSchema = z.object({
  name: z.string().min(2, { message: "Imię jest wymagane i musi mieć co najmniej 2 znaki" }),
  email: z.string().email({ message: "Nieprawidłowy format adresu email" }).optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  website: z.string().url({ message: "Nieprawidłowy format adresu URL" }).optional().nullable(),
  notes: z.string().optional().nullable(),
  category: z.string().min(1, { message: "Kategoria jest wymagana" }),
});

type ContactFormValues = z.infer<typeof ContactSchema>;

interface ContactFormProps {
  contact?: Contact | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ContactForm({ contact, onSuccess, onCancel }: ContactFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const defaultValues: ContactFormValues = {
    name: contact?.name || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    company: contact?.company || "",
    position: contact?.position || "",
    website: contact?.website || "",
    notes: contact?.notes || "",
    category: contact?.category || "Business",
  };

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(ContactSchema),
    defaultValues,
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      return apiRequest("/api/contacts", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: t("contacts.contact_added"),
        description: t("contacts.contact_added_success"),
      });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: t("contacts.contact_add_error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      if (!contact) return null;
      return apiRequest(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: t("contacts.contact_updated"),
        description: t("contacts.contact_updated_success"),
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: t("contacts.contact_update_error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    if (contact) {
      updateContactMutation.mutate(data);
    } else {
      createContactMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("contacts.name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("contacts.name_placeholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("contacts.email")}</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder={t("contacts.email_placeholder")} 
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("contacts.phone")}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t("contacts.phone_placeholder")} 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("contacts.company")}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t("contacts.company_placeholder")} 
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
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("contacts.position")}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t("contacts.position_placeholder")} 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("contacts.website")}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t("contacts.website_placeholder")} 
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
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("contacts.category")}</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("contacts.select_category")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Business">{t("contacts.categories.business")}</SelectItem>
                  <SelectItem value="Personal">{t("contacts.categories.personal")}</SelectItem>
                  <SelectItem value="Family">{t("contacts.categories.family")}</SelectItem>
                  <SelectItem value="Friend">{t("contacts.categories.friend")}</SelectItem>
                  <SelectItem value="Other">{t("contacts.categories.other")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("contacts.notes")}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t("contacts.notes_placeholder")} 
                  className="min-h-[100px]" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={createContactMutation.isPending || updateContactMutation.isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button 
            type="submit"
            disabled={createContactMutation.isPending || updateContactMutation.isPending}
          >
            {createContactMutation.isPending || updateContactMutation.isPending 
              ? t("common.saving")
              : contact 
                ? t("common.update") 
                : t("common.save")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}