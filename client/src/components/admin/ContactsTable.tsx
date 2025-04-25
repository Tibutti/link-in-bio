import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash, Edit, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Contact } from "@shared/schema";
import { ContactForm } from "./ContactForm";

interface ContactsTableProps {
  userId: number;
}

export function ContactsTable({ userId }: ContactsTableProps) {
  const { toast } = useToast();
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  
  const { data: contacts, isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    enabled: Boolean(userId),
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Kontakt usunięty",
        description: "Kontakt został pomyślnie usunięty z Twojego wizytownika.",
      });
    },
    onError: (error) => {
      toast({
        title: "Błąd podczas usuwania",
        description: "Nie udało się usunąć kontaktu: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveContact = () => {
    setEditingContact(null);
    queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
  };

  const handleDeleteContact = () => {
    if (contactToDelete) {
      deleteContactMutation.mutate(contactToDelete.id);
      setContactToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>Nie masz jeszcze żadnych kontaktów w swoim wizytowniku.</p>
        <p className="mt-2">Dodaj kontakty skanując kod QR z profili innych użytkowników.</p>
      </div>
    );
  }

  return (
    <div>
      {editingContact && (
        <ContactForm
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onSuccess={handleSaveContact}
        />
      )}

      <AlertDialog open={Boolean(contactToDelete)} onOpenChange={(open) => !open && setContactToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć ten kontakt?</AlertDialogTitle>
            <AlertDialogDescription>
              {contactToDelete?.contactProfileId && (
                <span>
                  Kontakt zostanie trwale usunięty z Twojego wizytownika. Tej operacji nie można cofnąć.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteContact}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteContactMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash className="h-4 w-4 mr-2" />
              )}
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Profil</TableHead>
            <TableHead>Kategoria</TableHead>
            <TableHead>Data dodania</TableHead>
            <TableHead>Ostatnio oglądane</TableHead>
            <TableHead>Notatki</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">
                {contact.contactProfileId}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {contact.category || "Domyślna"}
                </Badge>
              </TableCell>
              <TableCell>
                {contact.addedAt && format(new Date(contact.addedAt), "dd MMM yyyy", { locale: pl })}
              </TableCell>
              <TableCell>
                {contact.lastViewedAt && format(new Date(contact.lastViewedAt), "dd MMM yyyy", { locale: pl })}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {contact.notes || "-"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      // TODO: Implement view contact details
                      toast({
                        title: "Funkcja w trakcie implementacji",
                        description: "Podgląd szczegółów kontaktu będzie dostępny wkrótce.",
                      });
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingContact(contact)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setContactToDelete(contact)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}