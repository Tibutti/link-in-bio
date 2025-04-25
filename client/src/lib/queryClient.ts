import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  // Pobierz token autoryzacyjny z localStorage
  const authToken = localStorage.getItem('authToken');
  
  // Przygotuj nagłówki
  const headers: HeadersInit = {
    ...(options?.body ? { "Content-Type": "application/json" } : {}),
    ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {})
  };
  
  const res = await fetch(url, {
    headers,
    credentials: "include",
    ...options,
  });

  await throwIfResNotOk(res);
  
  // Obsługa odpowiedzi 204 No Content - zwracamy pusty obiekt zamiast próbować parsować JSON
  if (res.status === 204) {
    return {} as T;
  }
  
  // Dla innych odpowiedzi parsujemy JSON
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Pobierz token autoryzacyjny z localStorage
    const authToken = localStorage.getItem('authToken');
    
    // Przygotuj nagłówki z tokenem autoryzacyjnym jeśli istnieje
    const headers: HeadersInit = authToken 
      ? { "Authorization": `Bearer ${authToken}` }
      : {};
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    // Obsługa odpowiedzi 204 No Content
    if (res.status === 204) {
      return {} as T;
    }
    
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
