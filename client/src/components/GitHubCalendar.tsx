import { type Profile } from '@shared/schema';

interface GitHubCalendarProps {
  profile: Profile;
}

export default function GitHubCalendar({ profile }: GitHubCalendarProps) {
  // Jeśli użytkownik nie ma nazwy użytkownika GitHub, nie wyświetlaj tego komponentu
  if (!profile.githubUsername) return null;

  // URL do wykresu kontrybucji GitHub
  const username = profile.githubUsername || '';
  // Dodajemy kolor (hex bez znaku #) - używamy różowego zgodnie z motywem "radical"
  const contributionColor = '9c0079'; // ciemny róż, pasujący do motywu
  // Użyjmy wykresu bezpośrednio z GitHub, który pokazuje aktywność w kolorach
  const contributionsUrl = `https://ghchart.rshah.org/${contributionColor}/${username}`;

  return (
    <div className="w-full mt-4">
      <h2 className="text-lg font-semibold mb-2 text-center">Aktywność na GitHub</h2>
      {/* Obraz z aktywnością GitHub */}
      <div className="rounded-md overflow-hidden shadow-md bg-white p-2">
        <img
          src={contributionsUrl}
          alt={`Aktywność GitHub użytkownika ${username}`}
          width="100%"
          className="max-w-full h-auto"
          loading="lazy"
        />
      </div>
    </div>
  );
}