import { type Profile } from '@shared/schema';

interface GitHubCalendarProps {
  profile: Profile;
}

export default function GitHubCalendar({ profile }: GitHubCalendarProps) {
  // Jeśli użytkownik nie ma nazwy użytkownika GitHub, nie wyświetlaj tego komponentu
  if (!profile.githubUsername) return null;

  // URL do widoku aktywności GitHub (z pewnym zabezpieczeniem, gdyby githubUsername był null)
  const username = profile.githubUsername || '';
  const contributionsUrl = `https://github-contributions.vercel.app/user/${username}`;

  return (
    <div className="w-full mt-4">
      <h2 className="text-lg font-semibold mb-2 text-center">Aktywność na GitHub</h2>
      <div className="rounded-md overflow-hidden shadow-md">
        <iframe
          src={contributionsUrl}
          frameBorder="0"
          width="100%"
          height="200"
          title="GitHub Contributions"
          loading="lazy"
          className="bg-white"
        />
      </div>
    </div>
  );
}