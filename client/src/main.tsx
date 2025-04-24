import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ErrorBoundary } from '@sentry/react';
import { initSentry } from "./lib/sentry";

// Inicjalizuj Sentry
initSentry();

// Komponent błędu
const FallbackComponent = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center">
    <h1 className="text-2xl font-bold mb-4">Coś poszło nie tak</h1>
    <p className="mb-4">Przepraszamy, wystąpił nieoczekiwany błąd. Nasz zespół został o tym powiadomiony.</p>
    <button 
      onClick={() => window.location.reload()} 
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Odśwież stronę
    </button>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary fallback={FallbackComponent}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ErrorBoundary>
);
