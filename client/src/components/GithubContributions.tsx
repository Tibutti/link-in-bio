import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaGithub } from "react-icons/fa";
import { type GithubContribution, type ContributionData } from "@shared/schema";

interface GithubContributionsProps {
  profileId: number;
  username?: string;
  contributionData?: GithubContribution | any; // Używamy any, ponieważ API zwraca rozszerzony typ
}

export default function GithubContributions({ 
  profileId, 
  username,
  contributionData 
}: GithubContributionsProps) {
  const [usernameInput, setUsernameInput] = useState(username || "");
  const [activeTab, setActiveTab] = useState<"graph" | "stats">("graph");
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(12);
  
  // Update cell size based on container width
  useEffect(() => {
    const updateCellSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width < 500) setCellSize(8);
        else if (width < 768) setCellSize(10);
        else setCellSize(12);
      }
    };
    
    updateCellSize();
    window.addEventListener("resize", updateCellSize);
    
    return () => window.removeEventListener("resize", updateCellSize);
  }, []);

  // Fetch contributions mutation
  const fetchContributionsMutation = useMutation({
    mutationFn: async (githubUsername: string) => {
      console.log("Pobieranie danych dla użytkownika GitHub:", githubUsername);
      
      // Add timestamp to force bypassing the cache
      const timestamp = Date.now();
      
      const response = await apiRequest(
        "GET", 
        `/api/github-contributions/${githubUsername}?t=${timestamp}`
      );
      return response;
    },
    onSuccess: (data: any) => {
      console.log("Pobrane dane GitHub:", data);
      
      // Force a refetch of the profile data so the UI gets updated
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      
      // Log the year of contributions to verify we're showing current data
      if (data?.contributionData?.days?.length > 0) {
        const dates = data.contributionData.days.map((d: { date: string }) => d.date).sort();
        const firstDate = new Date(dates[0]);
        const lastDate = new Date(dates[dates.length - 1]);
        console.log(`GitHub data range: ${firstDate.toLocaleDateString()} to ${lastDate.toLocaleDateString()}`);
      }
    },
    onError: (error) => {
      console.error("Błąd pobierania danych GitHub:", error);
    }
  });

  const handleFetchContributions = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput) {
      console.log("Wysyłanie żądania o dane GitHub dla:", usernameInput);
      fetchContributionsMutation.mutate(usernameInput);
    }
  };

  // Get contribution data from props or from the mutation result
  const contributions = contributionData?.contributionData || 
                        (fetchContributionsMutation.data as GithubContribution | undefined)?.contributionData;
  
  // Error handling
  const error = fetchContributionsMutation.error as Error | null;
                        
  // Handle error state
  if (error) {
    return (
      <motion.div 
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-center flex items-center justify-center">
          <FaGithub className="mr-2" />
          GitHub Contributions
        </h2>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-red-200 dark:border-red-800">
          <div className="text-center">
            <div className="text-red-500 text-3xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-600 mb-2">Error fetching GitHub data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
            <form onSubmit={handleFetchContributions} className="flex gap-2 max-w-md mx-auto mt-4">
              <Input
                placeholder="GitHub username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="submit"
                className="bg-gray-800 hover:bg-gray-700"
                disabled={!usernameInput || fetchContributionsMutation.isPending}
              >
                <FaGithub className="mr-2" />
                Try again
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!contributions && !fetchContributionsMutation.isPending) {
    return (
      <motion.div 
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-center flex items-center justify-center">
          <FaGithub className="mr-2" />
          GitHub Contributions
        </h2>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
            Wpisz nazwę użytkownika GitHub, aby wyświetlić statystyki aktywności.
          </p>
          <form onSubmit={handleFetchContributions} className="flex gap-2 max-w-md mx-auto">
            <Input
              placeholder="Nazwa użytkownika GitHub"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit"
              className="bg-gray-800 hover:bg-gray-700"
              disabled={!usernameInput || fetchContributionsMutation.isPending}
            >
              <FaGithub className="mr-2" />
              Połącz
            </Button>
          </form>
        </div>
      </motion.div>
    );
  }

  if (fetchContributionsMutation.isPending) {
    return (
      <motion.div 
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-center flex items-center justify-center">
          <FaGithub className="mr-2" />
          GitHub Contributions
        </h2>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Pobieranie danych z GitHub...</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Process contribution data for rendering
  const processData = (data: ContributionData) => {
    // Group by week
    const weeks: Array<Array<typeof data.days[0]>> = [];
    let currentWeek: Array<typeof data.days[0]> = [];
    
    // Sort days by date
    const sortedDays = [...data.days].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    sortedDays.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      
      // Start a new week on Sunday (0)
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(day);
      
      // Push the last week
      if (index === sortedDays.length - 1) {
        weeks.push(currentWeek);
      }
    });
    
    return { weeks, total: data.total };
  };

  // Znajdź GitHub contributions SVG bezpośrednio z GitHub
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [rawCalendarData, setRawCalendarData] = useState<string | null>(null);
  
  useEffect(() => {
    if (username) {
      // Gdy mamy nazwę użytkownika, pobierz kalendarz GitHub bezpośrednio
      const fetchGitHubCalendar = async () => {
        try {
          // Dodaj timestamp do zapytania, aby uniknąć cache'owania
          const timestamp = Date.now();
          
          // Poinformuj użytkownika, że próbujemy pobrać dane
          console.log(`Attempting to fetch GitHub calendar for ${username}`);
          
          // Wykorzystamy nowe API, które dostarcza nam SVG kalendarza
          if (contributions) {
            // Sprawdź, czy mamy już SVG kalendarza z serwera
            const contributionsWithSvg = contributions as any;
            if (contributionsWithSvg.svgCalendar) {
              setSvgContent(contributionsWithSvg.svgCalendar);
            }
            
            // Zapisz również dane surowe dla celów analitycznych
            if (contributionsWithSvg.contributionData) {
              setRawCalendarData(JSON.stringify(contributionsWithSvg.contributionData));
            }
          }
        } catch (error) {
          console.error("Error fetching GitHub calendar:", error);
        }
      };
      
      fetchGitHubCalendar();
    }
  }, [username, contributions]);

  const { weeks, total } = processData(contributions as ContributionData);
  
  // Calculate statistics
  const getStats = () => {
    if (!contributions) return null;
    
    // Always use the current date to ensure we're looking at data from 2025
    const today = new Date();
    // Set to exactly one year ago to match GitHub's timeframe
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    console.log(`Calculating stats for the period: ${oneYearAgo.toLocaleDateString()} to ${today.toLocaleDateString()}`);
    
    // Get all days from the data
    const allDays = (contributions as ContributionData).days;
    
    // Log the date range in the data to help debug
    if (allDays.length > 0) {
      const dates = allDays.map(d => d.date).sort();
      const firstDateInData = new Date(dates[0]);
      const lastDateInData = new Date(dates[dates.length - 1]);
      console.log(`Data date range: ${firstDateInData.toLocaleDateString()} to ${lastDateInData.toLocaleDateString()}`);
    }
    
    // Filter to include only dates within the last year (matching GitHub's timeframe)
    const daysInLastYear = allDays.filter((day) => {
      const date = new Date(day.date);
      return date >= oneYearAgo && date <= today;
    });
    
    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    
    // Sort by date descending to calculate current streak
    const sortedDays = [...daysInLastYear].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Calculate current streak
    for (let i = 0; i < sortedDays.length; i++) {
      if (sortedDays[i].count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let tempStreak = 0;
    for (const day of daysInLastYear) {
      if (day.count > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    // Calculate best day
    const bestDay = daysInLastYear.reduce(
      (max, day) => (day.count > max.count ? day : max),
      { date: "", count: 0, level: 0 as 0 }
    );
    
    return {
      totalContributions: total,
      currentStreak,
      longestStreak,
      bestDay
    };
  };
  
  const stats = getStats();

  // Get color for contribution level
  const getColorForLevel = (level: number) => {
    switch (level) {
      case 0: return "bg-gray-100 dark:bg-gray-800";
      case 1: return "bg-emerald-100 dark:bg-emerald-900";
      case 2: return "bg-emerald-300 dark:bg-emerald-700";
      case 3: return "bg-emerald-500 dark:bg-emerald-500";
      case 4: return "bg-emerald-700 dark:bg-emerald-300";
      default: return "bg-gray-100 dark:bg-gray-800";
    }
  };

  return (
    <motion.section 
      className="mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-4 text-center flex items-center justify-center">
        <FaGithub className="mr-2" />
        GitHub Contributions
      </h2>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "graph" | "stats")} className="w-full">
        <TabsList className="mx-auto mb-4">
          <TabsTrigger value="graph">Activity Graph</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          {svgContent && <TabsTrigger value="github">GitHub Calendar</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="graph" className="focus-visible:outline-none focus-visible:ring-0">
          <div 
            ref={containerRef} 
            className="overflow-x-auto bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800"
          >
            <div className="flex">
              {/* Month labels */}
              <div className="mt-6 pr-2 text-xs text-gray-400">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} style={{ height: `${cellSize}px` }} className="flex items-center justify-start">
                    {i === 0 && "Sun"}
                    {i === 1 && "Mon"}
                    {i === 2 && "Tue"}
                    {i === 3 && "Wed"}
                    {i === 4 && "Thu"}
                    {i === 5 && "Fri"}
                    {i === 6 && "Sat"}
                  </div>
                ))}
              </div>
              
              {/* Contribution grid */}
              <div className="relative">
                {/* Month labels */}
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => (
                    <div key={i} className="w-8 text-center">{month}</div>
                  ))}
                </div>
                
                {/* Contribution cells */}
                <div className="flex">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col">
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                        const day = week[dayIndex];
                        return (
                          <div
                            key={dayIndex}
                            className={cn(
                              "rounded-sm border border-gray-100 dark:border-gray-800",
                              day ? getColorForLevel(day.level) : "bg-gray-100 dark:bg-gray-800"
                            )}
                            style={{ 
                              width: `${cellSize}px`, 
                              height: `${cellSize}px`,
                              margin: "1px"
                            }}
                            title={day ? `${day.count} contribution${day.count !== 1 ? 's' : ''} on ${new Date(day.date).toLocaleDateString('en-US')}` : "No contributions"}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-2 flex items-center justify-end text-xs text-gray-500">
              <span className="mr-1">Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "rounded-sm mx-1",
                    getColorForLevel(level)
                  )}
                  style={{ width: "10px", height: "10px" }}
                />
              ))}
              <span className="ml-1">More</span>
            </div>
          </div>
        </TabsContent>
        
        {svgContent && (
          <TabsContent value="github" className="focus-visible:outline-none focus-visible:ring-0">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-x-auto">
              <div dangerouslySetInnerHTML={{ __html: svgContent }} />
            </div>
          </TabsContent>
        )}
        
        <TabsContent value="stats" className="focus-visible:outline-none focus-visible:ring-0">
          {stats && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 p-4 rounded-lg flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Contributions</h3>
                  <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                    {stats.totalContributions.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">in the last year</p>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Streak</h3>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {stats.currentStreak} {stats.currentStreak === 1 ? "day" : "days"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">consecutive days of activity</p>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Longest Streak</h3>
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                    {stats.longestStreak} {stats.longestStreak === 1 ? "day" : "days"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">best activity streak</p>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 p-4 rounded-lg flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Best Day</h3>
                  <p className="text-4xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                    {stats.bestDay.count}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    contributions on {new Date(stats.bestDay.date).toLocaleDateString('en-US')}
                  </p>
                </motion.div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex flex-col items-center mt-4 gap-2">
        <div className="text-xs text-gray-500">
          Showing data for user: <span className="font-semibold">{username || "not set"}</span>
        </div>
        
        <form onSubmit={handleFetchContributions} className="flex gap-2 w-full max-w-md">
          <Input
            placeholder="Change GitHub username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="flex-1 text-sm h-8"
            size={20}
          />
          <Button
            type="submit"
            variant="outline" 
            size="sm"
            disabled={!usernameInput || fetchContributionsMutation.isPending}
          >
            {fetchContributionsMutation.isPending ? 'Loading...' : 'Change'}
          </Button>
        </form>
      </div>
    </motion.section>
  );
}