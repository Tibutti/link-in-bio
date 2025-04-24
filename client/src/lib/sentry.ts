import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { CaptureConsole } from '@sentry/integrations';

export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn('Sentry DSN not provided. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new BrowserTracing(),
      new CaptureConsole({
        levels: ['error', 'warn']
      })
    ],
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    // Set environment (adjusts dynamically based on deployment)
    environment: import.meta.env.MODE,
    // If this is a development build, enable debug mode
    debug: import.meta.env.DEV,
    // Custom logic to include user information when possible
    beforeSend(event) {
      // Try to get user info from localStorage if available
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed?.user?.id) {
            event.user = {
              id: String(parsed.user.id),
              username: parsed.user.username
            };
          }
        }
      } catch (error) {
        // Ignore errors in getting user data
      }
      return event;
    }
  });
}