import * as Sentry from '@sentry/react';

export function initSentry() {
  // Sprawdź czy DSN jest dostępny
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn('Sentry DSN not provided. Error tracking disabled.');
    return;
  }

  // Inicjalizacja Sentry z minimalną konfiguracją
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN as string,
    environment: import.meta.env.MODE,
    debug: import.meta.env.DEV,
    release: '1.0.0',
    tracesSampleRate: 0.5,
    
    // Dodaj informacje o użytkowniku gdy są dostępne
    beforeSend(event) {
      // Próba pobrania informacji o użytkowniku z localStorage
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
        // Ignoruj błędy przy pobieraniu danych użytkownika
      }
      return event;
    }
  });
}