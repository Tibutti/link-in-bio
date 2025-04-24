import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Profiler } from '@sentry/react';
import { initSentry } from "./lib/sentry";

// Inicjalizuj Sentry
initSentry();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Profiler name="App">
      <App />
    </Profiler>
  </QueryClientProvider>
);
