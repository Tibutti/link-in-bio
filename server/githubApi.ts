import fetch from 'node-fetch';

// Typ danych dla kontrybucji GitHub
export interface GitHubContribution {
  date: string;
  count: number;
  level: number; // 0-4 poziom aktywności
}

// Funkcja do pobierania danych kontrybucji z GitHub
export async function fetchGitHubContributions(username: string): Promise<GitHubContribution[]> {
  try {
    // Pobierz dane użytkownika
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    
    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.statusText}`);
    }
    
    const userData = await userResponse.json();
    
    // Pobierz tygodnie kontrybucji - używamy SVG, bo nie wymaga tokena API
    // Format: https://github.com/users/username/contributions
    const svgUrl = `https://github.com/users/${username}/contributions`;
    const svgResponse = await fetch(svgUrl);
    
    if (!svgResponse.ok) {
      throw new Error(`Error fetching GitHub contributions: ${svgResponse.statusText}`);
    }
    
    const svgText = await svgResponse.text();
    
    // Parsuj dane kontrybucji z SVG
    const contributions = parseContributionsFromSvg(svgText);
    
    return contributions;
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return []; // Pusta tablica w przypadku błędu
  }
}

// Parsowanie danych kontrybucji z SVG
function parseContributionsFromSvg(svgText: string): GitHubContribution[] {
  const contributions: GitHubContribution[] = [];
  
  // Znajdź wszystkie prostokąty kontrybucji
  const rectRegex = /<rect[^>]*data-date="([^"]+)"[^>]*data-count="([^"]+)"[^>]*data-level="([^"]+)"[^>]*\/>/g;
  
  let match;
  while ((match = rectRegex.exec(svgText)) !== null) {
    const date = match[1];
    const count = parseInt(match[2], 10);
    const level = parseInt(match[3], 10);
    
    contributions.push({
      date,
      count,
      level
    });
  }
  
  return contributions;
}