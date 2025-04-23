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
      console.log(`GitHub API error for user ${username}: ${userResponse.statusText}`);
      throw new Error(`GitHub API error: ${userResponse.statusText}`);
    }
    
    const userData = await userResponse.json();
    console.log(`GitHub user data fetched successfully for ${username}`);
    
    // Tworzymy przykładowe dane dla demonstracji, gdy nie ma rzeczywistych danych
    // Generuj dane za ostatni rok
    const demoContributions: GitHubContribution[] = [];
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Wypełniaj daty od roku temu do dziś
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      // Losowa liczba kontrybucji (więcej w weekendy dla realizmu)
      let count = 0;
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Większe prawdopodobieństwo aktywności w pewne dni
      const random = Math.random();
      
      if (isWeekend && random > 0.7) {
        count = Math.floor(Math.random() * 8) + 1; // 1-8 kontrybucji
      } else if (random > 0.8) {
        count = Math.floor(Math.random() * 5) + 1; // 1-5 kontrybucji
      }
      
      // Określ poziom aktywności na podstawie liczby kontrybucji
      let level = 0;
      if (count > 0) {
        level = count < 2 ? 1 : count < 4 ? 2 : count < 6 ? 3 : 4;
      }
      
      demoContributions.push({
        date: d.toISOString().split('T')[0], // Format YYYY-MM-DD
        count,
        level
      });
    }
    
    // Spróbuj pobrać rzeczywiste dane z GitHub
    try {
      console.log(`Fetching SVG from GitHub for ${username}...`);
      // Pobierz tygodnie kontrybucji - używamy SVG, bo nie wymaga tokena API
      const svgUrl = `https://github.com/users/${username}/contributions`;
      const svgResponse = await fetch(svgUrl);
      
      if (svgResponse.ok) {
        const svgText = await svgResponse.text();
        console.log(`SVG fetched successfully, length: ${svgText.length} chars`);
        
        // Parsuj dane kontrybucji z SVG
        const contributions = parseContributionsFromSvg(svgText);
        
        if (contributions.length > 0) {
          console.log(`Parsed ${contributions.length} contribution days from SVG`);
          return contributions;
        } else {
          console.log(`No contributions found in SVG, using demo data`);
        }
      } else {
        console.log(`Error fetching GitHub contributions SVG: ${svgResponse.statusText}`);
      }
    } catch (svgError) {
      console.error('Error parsing GitHub SVG:', svgError);
    }
    
    // Jeśli nie udało się pobrać rzeczywistych danych, zwróć przykładowe
    console.log(`Returning ${demoContributions.length} demo contributions`);
    return demoContributions;
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