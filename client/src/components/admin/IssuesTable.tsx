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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, CheckCircle, AlertTriangle, CircleAlert, AlertCircle, X, Maximize2 } from "lucide-react";
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
  imageUrl: string | null;
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
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isImageZoomDialogOpen, setIsImageZoomDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: issues, isLoading, error } = useQuery<Issue[]>({
    queryKey: ["/api/profile", profileId, "issues"],
    queryFn: async () => {
      return await apiRequest(`/api/profile/${profileId}/issues`);
    },
  });

  const deleteIssueMutation = useMutation({
    mutationFn: async (issueId: number) => {
      return apiRequest(`/api/issues/${issueId}`, {
        method: "DELETE"
      });
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
      return apiRequest(`/api/issues/${issueId}/resolve`, {
        method: "POST"
      });
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
      return apiRequest(`/api/issues/${issueId}/reopen`, {
        method: "POST"
      });
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

  const handleRowClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDetailsDialogOpen(true);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>, imageUrl: string) => {
    e.stopPropagation(); // Zapobiega wywołaniu handleRowClick po kliknięciu w obraz
    setZoomedImage(imageUrl);
    setIsImageZoomDialogOpen(true);
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
              <TableRow 
                key={issue.id} 
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => handleRowClick(issue)}
              >
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
                  {issue.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={issue.imageUrl} 
                        alt="Zdjęcie usterki" 
                        className="max-h-20 max-w-40 object-cover rounded-md cursor-zoom-in hover:opacity-80 transition-opacity" 
                        onClick={(e) => handleImageClick(e, issue.imageUrl!)}
                      />
                    </div>
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
                      <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                        <span className="sr-only">Otwórz menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(issue);
                      }}>
                        Edytuj
                      </DropdownMenuItem>
                      {!issue.isResolved ? (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(issue);
                        }}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Oznacz jako rozwiązaną
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleReopen(issue);
                        }}>
                          Otwórz ponownie
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(issue);
                        }}
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
              Ta akcja jest nieodwarcalna. Usterka zostanie trwale usunięta z systemu.
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

      {/* Dialog ze szczegółami usterki */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        {selectedIssue && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getSeverityIcon(selectedIssue.severity)}
                <span>{selectedIssue.title}</span>
                <span className="ml-3">{getStatusBadge(selectedIssue.status, selectedIssue.isResolved)}</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Priorytet</h4>
                  <div>{getSeverityBadge(selectedIssue.severity)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Status</h4>
                  <div>{getStatusBadge(selectedIssue.status, selectedIssue.isResolved)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Data zgłoszenia</h4>
                  <div>{formatDistanceToNow(new Date(selectedIssue.createdAt), { addSuffix: true, locale: pl })}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Data rozwiązania</h4>
                  <div>
                    {selectedIssue.resolvedAt 
                      ? formatDistanceToNow(new Date(selectedIssue.resolvedAt), { addSuffix: true, locale: pl }) 
                      : "-"}
                  </div>
                </div>
              </div>
              
              {selectedIssue.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Opis</h4>
                  <div className="p-4 bg-muted rounded-md">
                    {selectedIssue.description.split('\n').map((line, i) => (
                      <p key={i} className="mb-2">{line}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedIssue.imageUrl && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Zdjęcie</h4>
                  <div className="relative inline-block">
                    <img 
                      src={selectedIssue.imageUrl} 
                      alt="Zdjęcie usterki" 
                      className="max-h-60 rounded-md cursor-zoom-in hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        setZoomedImage(selectedIssue.imageUrl!);
                        setIsImageZoomDialogOpen(true);
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/70 hover:bg-white"
                      onClick={() => {
                        setZoomedImage(selectedIssue.imageUrl!);
                        setIsImageZoomDialogOpen(true);
                      }}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => handleEdit(selectedIssue)}>
                Edytuj
              </Button>
              {!selectedIssue.isResolved ? (
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    handleResolve(selectedIssue);
                    setIsDetailsDialogOpen(false);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Oznacz jako rozwiązaną
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => {
                    handleReopen(selectedIssue);
                    setIsDetailsDialogOpen(false);
                  }}
                >
                  Otwórz ponownie
                </Button>
              )}
              <Button 
                variant="destructive"
                onClick={() => {
                  setIsDetailsDialogOpen(false);
                  handleDelete(selectedIssue);
                }}
              >
                Usuń
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Dialog powiększenia obrazu */}
      <Dialog open={isImageZoomDialogOpen} onOpenChange={setIsImageZoomDialogOpen}>
        <DialogContent className="max-w-4xl p-1">
          <div className="relative w-full h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/30 hover:bg-black/50 text-white"
              onClick={() => setIsImageZoomDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            {zoomedImage && (
              <img 
                src={zoomedImage} 
                alt="Powiększone zdjęcie usterki" 
                className="max-w-full max-h-[80vh] object-contain mx-auto"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}