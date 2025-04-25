import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, BarChart4, MessageSquareWarning } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Issue } from '@shared/schema';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface IssueSummary {
  total: number;
  byStatus: {
    open: number;
    in_progress: number;
    resolved: number;
  };
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  newestIssues: Issue[];
  oldestIssues: Issue[];
  mostCriticalIssues: Issue[];
}

interface IssueAnalysisResult {
  issue: Issue;
  analysis: string;
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return 'nieznana data';
  return new Date(dateString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getSeverityColor(severity: string | null) {
  switch (severity) {
    case 'critical':
      return 'bg-red-500 hover:bg-red-600';
    case 'high':
      return 'bg-amber-500 hover:bg-amber-600';
    case 'medium':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'low':
      return 'bg-green-500 hover:bg-green-600';
    default:
      return 'bg-slate-500 hover:bg-slate-600';
  }
}

function getStatusIcon(status: string | null) {
  switch (status) {
    case 'open':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'in_progress':
      return <Loader2 className="h-4 w-4 text-amber-500" />;
    case 'resolved':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
}

function getSeverityLabel(severity: string | null) {
  switch (severity) {
    case 'critical':
      return 'Krytyczny';
    case 'high':
      return 'Wysoki';
    case 'medium':
      return 'Średni';
    case 'low':
      return 'Niski';
    default:
      return 'Nieznany';
  }
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case 'open':
      return 'Otwarta';
    case 'in_progress':
      return 'W trakcie';
    case 'resolved':
      return 'Rozwiązana';
    default:
      return 'Nieznany';
  }
}

function IssueCard({ issue, onSelectIssue }: { issue: Issue; onSelectIssue: (issue: Issue) => void }) {
  return (
    <Card className="mb-2 shadow-sm">
      <CardHeader className="py-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-md">{issue.title}</CardTitle>
          <Badge className={cn("text-white font-semibold", getSeverityColor(issue.severity))}>
            {getSeverityLabel(issue.severity)}
          </Badge>
        </div>
        <CardDescription className="flex items-center mt-1">
          {getStatusIcon(issue.status)} 
          <span className="ml-1">{getStatusLabel(issue.status)}</span>
          <span className="mx-2">•</span> 
          <span>{formatDate(issue.createdAt)}</span>
        </CardDescription>
      </CardHeader>
      {issue.description && (
        <CardContent className="py-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {issue.description}
          </p>
        </CardContent>
      )}
      <CardFooter className="pt-1 pb-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onSelectIssue(issue)}
        >
          Analizuj usterkę
        </Button>
      </CardFooter>
    </Card>
  );
}

const IssueAnalyzer = () => {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const { toast } = useToast();
  
  // Pobieranie podsumowania usterek
  const { 
    data: summary, 
    isLoading: isSummaryLoading,
    error: summaryError
  } = useQuery<IssueSummary>({
    queryKey: ['/api/ai/issues/summary'],
    staleTime: 30000, // 30 sekund
  });
  
  // Pobieranie analizy wybranej usterki
  const { 
    data: analysisData, 
    isLoading: isAnalysisLoading,
    error: analysisError,
    refetch: refetchAnalysis
  } = useQuery<IssueAnalysisResult>({
    queryKey: ['/api/ai/issues', selectedIssue?.id, 'analyze'],
    enabled: !!selectedIssue,
    staleTime: 300000, // 5 minut - analizy nie zmieniają się często
  });
  
  // Mutacja do rozwiązywania usterki
  const resolveIssueMutation = useMutation({
    mutationFn: async (issueId: number) => {
      return apiRequest(`/api/issues/${issueId}/resolve`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Usterka rozwiązana",
        description: "Usterka została oznaczona jako rozwiązana.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai/issues/summary'] });
      if (selectedIssue) {
        queryClient.invalidateQueries({ queryKey: ['/api/profile', selectedIssue.profileId, 'issues'] });
      }
      setSelectedIssue(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Błąd",
        description: `Nie udało się rozwiązać usterki: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const onSelectIssue = (issue: Issue) => {
    setSelectedIssue(issue);
  };
  
  const formatAnalysis = (text: string) => {
    // Podziel tekst na sekcje
    const sections = text.split(/^(#{1,3} .+)$/m).filter(Boolean);
    
    if (sections.length <= 1) {
      // Jeśli nie ma wyraźnych sekcji, zwróć oryginalny tekst
      return <div className="whitespace-pre-wrap">{text}</div>;
    }
    
    // Grupuj nagłówki z ich zawartością
    const formattedSections = [];
    for (let i = 0; i < sections.length; i += 2) {
      const title = sections[i].replace(/^#{1,3} /, '').trim();
      const content = i + 1 < sections.length ? sections[i + 1].trim() : '';
      
      formattedSections.push(
        <div key={i} className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="whitespace-pre-wrap">{content}</div>
        </div>
      );
    }
    
    return formattedSections;
  };

  if (summaryError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Błąd ładowania danych</h3>
        <p className="text-red-700">{(summaryError as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analiza AI usterek</h2>
        {isSummaryLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {summary && (
          <>
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquareWarning className="h-5 w-5 mr-2" />
                  Wszystkie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary.total}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                  Otwarte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary.byStatus.open}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-lg flex items-center">
                  <Loader2 className="h-5 w-5 mr-2 text-amber-500" />
                  W trakcie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary.byStatus.in_progress}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                  Rozwiązane
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary.byStatus.resolved}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <Tabs defaultValue="critical">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="critical" className="flex-1">Krytyczne</TabsTrigger>
              <TabsTrigger value="newest" className="flex-1">Najnowsze</TabsTrigger>
              <TabsTrigger value="oldest" className="flex-1">Najstarsze</TabsTrigger>
            </TabsList>
            
            <TabsContent value="critical" className="mt-0">
              <h3 className="text-lg font-medium mb-3">Usterki o najwyższym priorytecie</h3>
              {summary?.mostCriticalIssues.length === 0 && (
                <p className="text-muted-foreground">Brak usterek do wyświetlenia</p>
              )}
              {summary?.mostCriticalIssues.map(issue => (
                <IssueCard 
                  key={issue.id} 
                  issue={issue} 
                  onSelectIssue={onSelectIssue} 
                />
              ))}
            </TabsContent>
            
            <TabsContent value="newest" className="mt-0">
              <h3 className="text-lg font-medium mb-3">Najnowsze usterki</h3>
              {summary?.newestIssues.length === 0 && (
                <p className="text-muted-foreground">Brak usterek do wyświetlenia</p>
              )}
              {summary?.newestIssues.map(issue => (
                <IssueCard 
                  key={issue.id} 
                  issue={issue} 
                  onSelectIssue={onSelectIssue} 
                />
              ))}
            </TabsContent>
            
            <TabsContent value="oldest" className="mt-0">
              <h3 className="text-lg font-medium mb-3">Najstarsze usterki</h3>
              {summary?.oldestIssues.length === 0 && (
                <p className="text-muted-foreground">Brak usterek do wyświetlenia</p>
              )}
              {summary?.oldestIssues.map(issue => (
                <IssueCard 
                  key={issue.id} 
                  issue={issue} 
                  onSelectIssue={onSelectIssue} 
                />
              ))}
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Analiza usterki</h3>
          {!selectedIssue ? (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <MessageSquareWarning className="h-16 w-16 text-muted-foreground mb-3" />
                <p className="text-lg text-muted-foreground text-center">
                  Wybierz usterkę z listy, aby zobaczyć analizę AI
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedIssue.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      {getStatusIcon(selectedIssue.status)} 
                      <span className="ml-1">{getStatusLabel(selectedIssue.status)}</span>
                      <span className="mx-2">•</span> 
                      <span>{formatDate(selectedIssue.createdAt)}</span>
                    </CardDescription>
                  </div>
                  <Badge className={cn("text-white font-semibold", getSeverityColor(selectedIssue.severity))}>
                    {getSeverityLabel(selectedIssue.severity)}
                  </Badge>
                </div>
              </CardHeader>
              
              {selectedIssue.description && (
                <CardContent className="pb-0">
                  <Accordion type="single" collapsible defaultValue="description">
                    <AccordionItem value="description">
                      <AccordionTrigger className="text-md py-2">Opis usterki</AccordionTrigger>
                      <AccordionContent>
                        <p className="whitespace-pre-wrap text-sm">{selectedIssue.description}</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              )}
              
              <CardContent>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-3">Analiza sztucznej inteligencji</h3>
                  
                  {isAnalysisLoading ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p className="text-muted-foreground">Analizuję usterkę...</p>
                    </div>
                  ) : analysisError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-700">Błąd podczas analizy: {(analysisError as Error).message}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => refetchAnalysis()} 
                        className="mt-2"
                      >
                        Spróbuj ponownie
                      </Button>
                    </div>
                  ) : analysisData ? (
                    <div className="prose prose-slate max-w-none">
                      {formatAnalysis(analysisData.analysis)}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Kliknij przycisk "Analizuj", aby uzyskać szczegółową analizę usterki.
                    </p>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedIssue(null)}
                >
                  Powrót
                </Button>
                
                <div className="space-x-2">
                  {selectedIssue.status !== 'resolved' && (
                    <Button 
                      variant="default" 
                      onClick={() => resolveIssueMutation.mutate(selectedIssue.id)}
                      disabled={resolveIssueMutation.isPending}
                    >
                      {resolveIssueMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Przetwarzanie...
                        </>
                      ) : (
                        <>Oznacz jako rozwiązane</>
                      )}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueAnalyzer;