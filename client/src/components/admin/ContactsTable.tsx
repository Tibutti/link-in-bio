import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Contact, Profile } from "@shared/schema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Phone, 
  Mail, 
  Briefcase, 
  Tag 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { pl, enUS } from "date-fns/locale";
import ContactForm from "./ContactForm";
// Path corrected for module import
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ContactsTable() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const language = localStorage.getItem("i18nextLng") || "pl";
  const dateLocale = language.startsWith("en") ? enUS : pl;

  // Pobieranie kontaktów
  const { data: contacts = [], isLoading, isError } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: async ({ signal }) => {
      const res = await fetch("/api/contacts", { signal });
      if (!res.ok) throw new Error("Failed to fetch contacts");
      return res.json();
    },
  });

  // Mutacja usuwania kontaktu
  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      return apiRequest(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: t("contacts.contact_deleted"),
        description: t("contacts.contact_deleted_success"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: (error) => {
      toast({
        title: t("contacts.contact_delete_error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (contactId: number) => {
    if (window.confirm(t("contacts.confirm_delete"))) {
      deleteContactMutation.mutate(contactId);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingContact(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingContact(null);
  };

  if (isLoading) {
    return <div className="text-center py-4">{t("ui.loading")}</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-4 text-red-500">
        {t("contacts.error_loading")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("contacts.your_contacts")}</h3>
        <Button onClick={handleAddNew}>
          {t("contacts.add_contact")}
        </Button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">{t("contacts.no_contacts")}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleAddNew}
          >
            {t("contacts.add_first_contact")}
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("contacts.name")}</TableHead>
                <TableHead>{t("contacts.info")}</TableHead>
                <TableHead>{t("contacts.category")}</TableHead>
                <TableHead>{t("contacts.added")}</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact: Contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">
                    <div>
                      {contact.name}
                      {contact.company && (
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {contact.company}
                        </div>
                      )}
                      {contact.position && (
                        <div className="text-xs text-muted-foreground italic mt-1">
                          {contact.position}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {contact.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          <a 
                            href={`mailto:${contact.email}`}
                            className="text-blue-500 hover:underline"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          <a 
                            href={`tel:${contact.phone}`}
                            className="text-blue-500 hover:underline"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {contact.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {contact.addedAt && formatDistanceToNow(new Date(contact.addedAt), {
                      addSuffix: true,
                      locale: dateLocale,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">{t("common.open_menu")}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t("contacts.actions")}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(contact)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          {t("common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600" 
                          onClick={() => handleDelete(contact.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? t("contacts.edit_contact") : t("contacts.add_contact")}
            </DialogTitle>
          </DialogHeader>
          <ContactForm 
            contact={editingContact} 
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
              handleFormClose();
            }}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}