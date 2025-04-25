import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, CheckCircle, AlertTriangle, CircleAlert, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { CreateIssueForm } from "./CreateIssueForm";
import { EditIssueForm } from "./EditIssueForm";

type Issue = {
  id: number;
  profileId: number;
  title: string;
  description: string | null;
  severity: "low" | "medium" | "high" | "critical" | null;
  status: string;
  isResolved: boolean | null;
  createdAt: string;
  resolvedAt: string | null;
};

type IssuesTableProps = {
  profileId: number;
};

const getSeverityBadge = (severity: Issue["severity"]) => {
  switch (severity) {
    case "low":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Niska</Badge>;
    case "medium":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">Średnia</Badge>;
    case "high":
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-100">Wysoka</Badge>;
    case "critical":
      return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">Krytyczna</Badge>;
    default:
      return <Badge variant="outline">Nieznana</Badge>;
  }
};

const getSeverityIcon = (severity: Issue["severity"]) => {
  switch (severity) {
    case "low":
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
    case "medium":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "high":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case "critical":
      return <CircleAlert className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

const getStatusBadge = (status: string, isResolved: boolean | null) => {
  if (isResolved) {
    return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">Rozwiązana</Badge>;
  }

  switch (status) {
    case "open":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Otwarta</Badge>;
    case "in_progress":
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">W trakcie</Badge>;
    default:
      return <Badge variant="outline">Nieznany</Badge>;
  }
};

export default function IssuesTable({ profileId }: IssuesTableProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: issues, isLoading } = useQuery<Issue[]>({
    queryKey: ["/api/profile", profileId, "issues"],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${profileId}/issues`);
      if (!response.ok) {
        throw new Error("Nie udało się pobrać usterek");
      }
      return response.json();
    },
  });

  const deleteIssueMutation = useMutation({
    mutationFn: async (issueId: number) => {
      return apiRequest("DELETE", `/api/issues/${issueId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", profileId, "issues"] });
      toast({
        title: "Usterka usunięta",
        description: "Usterka została pomyślnie usunięta",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Błąd podczas usuwania usterki",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resolveIssueMutation = useMutation({
    mutationFn: async (issueId: number) => {
      return apiRequest("POST", `/api/issues/${issueId}/resolve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", profileId, "issues"] });
      toast({
        title: "Usterka rozwiązana",
        description: "Usterka została oznaczona jako rozwiązana",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Błąd podczas oznaczania usterki jako rozwiązanej",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reopenIssueMutation = useMutation({
    mutationFn: async (issueId: number) => {
      return apiRequest("POST", `/api/issues/${issueId}/reopen`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile", profileId, "issues"] });
      toast({
        title: "Usterka otwarta ponownie",
        description: "Usterka została ponownie otwarta",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Błąd podczas ponownego otwierania usterki",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsEditDialogOpen(true);
  };

  const handleResolve = (issue: Issue) => {
    resolveIssueMutation.mutate(issue.id);
  };

  const handleReopen = (issue: Issue) => {
    reopenIssueMutation.mutate(issue.id);
  };

  const confirmDelete = () => {
    if (selectedIssue) {
      deleteIssueMutation.mutate(selectedIssue.id);
    }
  };

  if (isLoading) {
    return <div>Ładowanie usterek...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Usterki</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>Dodaj usterkę</Button>
      </div>

      {issues && issues.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Tytuł</TableHead>
              <TableHead>Priorytet</TableHead>
              <TableHead>Data zgłoszenia</TableHead>
              <TableHead>Data rozwiązania</TableHead>
              <TableHead className="w-[50px]">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>
                  {getStatusBadge(issue.status, issue.isResolved)}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(issue.severity)}
                    <span>{issue.title}</span>
                  </div>
                  {issue.description && (
                    <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                  )}
                </TableCell>
                <TableCell>{getSeverityBadge(issue.severity)}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true, locale: pl })}
                </TableCell>
                <TableCell>
                  {issue.resolvedAt ? formatDistanceToNow(new Date(issue.resolvedAt), { addSuffix: true, locale: pl }) : "-"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Otwórz menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(issue)}>
                        Edytuj
                      </DropdownMenuItem>
                      {!issue.isResolved ? (
                        <DropdownMenuItem onClick={() => handleResolve(issue)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Oznacz jako rozwiązaną
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleReopen(issue)}>
                          Otwórz ponownie
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(issue)}
                      >
                        Usuń
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-10 bg-muted rounded-md">
          <p className="text-muted-foreground">Nie znaleziono żadnych usterek</p>
          <Button 
            variant="link" 
            className="mt-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Dodaj pierwszą usterkę
          </Button>
        </div>
      )}

      {/* Dialog formularza dodawania usterki */}
      {isCreateDialogOpen && (
        <CreateIssueForm
          profileId={profileId}
          onSuccess={() => {
            setIsCreateDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["/api/profile", profileId, "issues"] });
          }}
          onCancel={() => setIsCreateDialogOpen(false)}
        />
      )}

      {/* Dialog formularza edycji usterki */}
      {isEditDialogOpen && selectedIssue && (
        <EditIssueForm
          issue={selectedIssue}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["/api/profile", profileId, "issues"] });
          }}
          onCancel={() => setIsEditDialogOpen(false)}
        />
      )}

      {/* Dialog potwierdzenia usunięcia */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę usterkę?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Usterka zostanie trwale usunięta z systemu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}