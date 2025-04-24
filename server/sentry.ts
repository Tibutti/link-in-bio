import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction } from 'express';

export function initSentry() {
  // Sprawdź czy DSN jest dostępny
  if (!process.env.VITE_SENTRY_DSN) {
    console.warn('Sentry DSN not provided for server. Error tracking disabled.');
    return;
  }

  // Inicjalizacja Sentry dla backendu
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: '1.0.0', // Wersja aplikacji, powinna być zgodna z frontendem
    tracesSampleRate: 0.5,
    
    // Możemy dodać dodatkowe informacje kontekstowe
    beforeSend(event) {
      // Można tu dodać dodatkowe informacje specyficzne dla serwera
      if (event && typeof event === 'object') {
        // @ts-ignore - dodajemy własne pole
        event.server_name = 'profile-linktree-server';
      }
      return event;
    }
  });
}

// Middleware do przechwytywania błędów Express
export function sentryErrorHandler() {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    // Raportowanie błędu do Sentry
    Sentry.captureException(err);
    next(err);
  };
}

// Middleware do inicjalizacji Sentry na początku żądania
export function sentryRequestHandler() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Dodajemy dodatkowe informacje do kontekstu Sentry dla każdego żądania
    try {
      Sentry.addBreadcrumb({
        category: 'http',
        message: `${req.method} ${req.path}`,
        level: 'info',
        data: {
          method: req.method,
          url: req.url,
          query: req.query,
          headers: req.headers
        }
      });
    } catch (e) {
      console.warn('Błąd podczas dodawania kontekstu Sentry:', e);
    }
    
    next();
  };
}

// Funkcja pomocnicza do zgłaszania błędów
export function captureException(error: Error) {
  return Sentry.captureException(error);
}

// Funkcja pomocnicza do zgłaszania wiadomości
export function captureMessage(message: string, level: string = 'info') {
  return Sentry.captureMessage(message, level as Sentry.SeverityLevel);
}

// Test API do wywołania błędu na backendzie - przydatne do testowania integracji
export function createTestServerErrorRoute(app: any) {
  app.get('/api/test-server-error', (_req: Request, _res: Response) => {
    // Celowo generujemy błąd na serwerze
    throw new Error('Testowy błąd serwera dla Sentry');
  });

  app.get('/api/test-server-message', (_req: Request, res: Response) => {
    // Wysyłamy wiadomość do Sentry
    captureMessage('Testowa wiadomość z serwera Node.js', 'info');
    res.json({ success: true, message: 'Test message sent to Sentry' });
  });
}