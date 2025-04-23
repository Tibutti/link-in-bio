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
    
    // Przygotowujemy pustą tablicę kontrybucji - nie będziemy generować sztucznych danych
    const emptyContributions: GitHubContribution[] = [];
    // Jeśli nie uda się pobrać prawdziwych danych, zwrócimy pustą tablicę
    
    // Spróbuj pobrać rzeczywiste dane z GitHub
    try {
      console.log(`Fetching SVG from GitHub for ${username}...`);
      // Najpierw próbujemy bezpośredniego SVG, który nie wymaga parsowania HTML
      const directSvgUrl = `https://github.com/${username}/contributions`;
      
      // Pobierz też stronę HTML jako rezerwę
      const htmlUrl = `https://github.com/users/${username}/contributions`;
      const svgResponse = await fetch(htmlUrl);
      
      if (svgResponse.ok) {
        const svgText = await svgResponse.text();
        console.log(`SVG fetched successfully, length: ${svgText.length} chars`);
        
        // Parsuj dane kontrybucji z SVG
        const contributions = parseContributionsFromSvg(svgText);
        
        if (contributions.length > 0) {
          console.log(`Parsed ${contributions.length} contribution days from SVG`);
          return contributions;
        } else {
          console.log(`No contributions found in SVG, returning empty data`);
        }
      } else {
        console.log(`Error fetching GitHub contributions SVG: ${svgResponse.statusText}`);
      }
    } catch (svgError) {
      console.error('Error parsing GitHub SVG:', svgError);
    }
    
    // Jeśli nie udało się pobrać rzeczywistych danych, zwróć pustą tablicę
    console.log("Nie znaleziono danych kontrybucji GitHub");
    return emptyContributions;
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return []; // Pusta tablica w przypadku błędu
  }
}

// Parsowanie danych kontrybucji z SVG
function parseContributionsFromSvg(svgText: string): GitHubContribution[] {
  const contributions: GitHubContribution[] = [];
  
  try {
    console.log('Otrzymany tekst SVG o długości:', svgText.length);
    
    // GitHub może używać różnych formatów atrybutów, sprawdzimy kilka wariantów
    
    // Wariant 1: Standardowy format z atrybutami data-date, data-count, data-level
    const rectRegex1 = /<rect[^>]*data-date="([^"]+)"[^>]*data-count="([^"]+)"[^>]*data-level="([^"]+)"[^>]*\/?>/g;
    
    // Wariant 2: Format z klasami jako poziomami (stosowany w nowszym interfejsie GitHub)
    const rectRegex2 = /<rect[^>]*data-date="([^"]+)"[^>]*data-count="([^"]+)"[^>]*class="([^"]*ContributionCalendar-day[^"]*)"[^>]*\/?>/g;
    
    // Wariant 3: Format JSON w danych JS
    const jsonRegex = /data-graph-url="\/users\/Tibutti\/contributions"[^>]*data-from="([^"]+)"[^>]*data-to="([^"]+)"/;
    const contributionCountRegex = /<h2[^>]*>(\d+)\s+contributions\s+in the last year<\/h2>/;
    
    // Próba wariantu 1
    let match;
    let found = false;
    
    while ((match = rectRegex1.exec(svgText)) !== null) {
      found = true;
      const date = match[1];
      const count = parseInt(match[2], 10);
      const level = parseInt(match[3], 10);
      
      contributions.push({
        date,
        count,
        level
      });
    }
    
    // Jeśli wariant 1 nie zadziałał, próbuj wariantu 2
    if (!found) {
      while ((match = rectRegex2.exec(svgText)) !== null) {
        found = true;
        const date = match[1];
        const count = parseInt(match[2], 10);
        
        // Określ poziom na podstawie klasy
        let level = 0;
        const className = match[3];
        if (className.includes('level-1')) level = 1;
        else if (className.includes('level-2')) level = 2;
        else if (className.includes('level-3')) level = 3;
        else if (className.includes('level-4')) level = 4;
        
        contributions.push({
          date,
          count,
          level
        });
      }
    }
    
    // Jeśli żadna opcja nie zadziałała, po prostu logujemy informację
    if (!found) {
      // Wydobądź liczbę kontrybucji jako informację diagnostyczną
      const countMatch = contributionCountRegex.exec(svgText);
      const totalContributions = countMatch ? parseInt(countMatch[1], 10) : 0;
      
      console.log(`Znaleziono ${totalContributions} kontrybucji w tekście HTML, ale nie można ich dokładnie umiejscowić`);
      
      // W przyszłości można byłoby rozwinąć ten kod o pobieranie danych z API GitHub z wykorzystaniem tokenu
      console.log("Nie znaleziono danych kontrybucji w SVG");
    }
    
    console.log(`Rozpoznano ${contributions.length} dni kontrybucji`);
    return contributions;
  } catch (error) {
    console.error('Błąd podczas parsowania SVG:', error);
    return [];
  }
}