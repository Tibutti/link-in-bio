import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

// Interfejsy dla danych użytkownika i profilu
interface User {
  id: number;
  username: string;
}

interface Profile {
  id: number;
  userId: number;
  name: string;
  // Pozostałe pola profilu...
}

// Kontekst autentykacji
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

// Domyślna wartość kontekstu
const defaultContext: AuthContextType = {
  user: null,
  profile: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshUserData: async () => {},
};

// Utworzenie kontekstu
export const AuthContext = createContext<AuthContextType>(defaultContext);

// Hook do wykorzystania w komponentach
export function useAuth() {
  return useContext(AuthContext);
}

// Provider do opakowania aplikacji
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Funkcja do odświeżania danych użytkownika
  const refreshUserData = async () => {
    try {
      setIsLoading(true);
      
      // Pobierz token z localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }
      
      // Pobierz dane zalogowanego użytkownika
      const userData = await apiRequest('/api/auth/me');
      
      if (userData && userData.user) {
        setUser(userData.user);
        
        // Jeśli istnieje profil, pobierz jego dane
        if (userData.user.id) {
          try {
            const profileData = await apiRequest(`/api/profile/user/${userData.user.id}`);
            setProfile(profileData);
            
            // Zapisz dane do localStorage
            localStorage.setItem('userData', JSON.stringify({
              user: userData.user,
              profile: profileData
            }));
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcja logowania
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Wykonaj żądanie logowania
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      // Zapisz token
      if (response && response.token) {
        localStorage.setItem('authToken', response.token);
        
        // Pobierz dane użytkownika
        await refreshUserData();
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcja wylogowania
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Wywołaj endpoint wylogowania
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
      
      // Usuń dane z localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Wyczyść stan
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Inicjalizacja - sprawdzenie czy użytkownik jest zalogowany
  useEffect(() => {
    const initAuth = async () => {
      // Sprawdź czy dane są w localStorage
      const userDataStr = localStorage.getItem('userData');
      const token = localStorage.getItem('authToken');
      
      if (userDataStr && token) {
        try {
          // Tymczasowo ustaw z localStorage
          const userData = JSON.parse(userDataStr);
          setUser(userData.user);
          setProfile(userData.profile);
          
          // Odśwież dane z serwera
          await refreshUserData();
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('userData');
          localStorage.removeItem('authToken');
        }
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  // Wartości kontekstu
  const contextValue: AuthContextType = {
    user,
    profile,
    isLoading,
    login,
    logout,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}