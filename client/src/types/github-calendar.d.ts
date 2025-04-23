declare module 'github-calendar' {
  export default function GitHubCalendar(
    selector: string,
    username: string,
    options?: {
      responsive?: boolean;
      tooltips?: boolean;
      global_stats?: boolean;
      summary_text?: string;
    }
  ): void;
}