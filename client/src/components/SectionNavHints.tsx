import { useState, useEffect } from 'react';
import { ChevronUpCircle } from 'lucide-react';

export default function SectionNavHints() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  useEffect(() => {
    // Funkcja obsługująca przewijanie strony
    const handleScroll = () => {
      // Pokazuj przycisk "do góry" tylko gdy strona jest przewinięta więcej niż 300px
      setShowScrollToTop(window.scrollY > 300);
    };
    
    // Dodaj nasłuchiwanie przewijania
    window.addEventListener('scroll', handleScroll);
    
    // Sprawdzamy pozycję scrollY na starcie
    handleScroll();
    
    // Oczyszczenie nasłuchiwania przy odmontowaniu komponentu
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Funkcja przewijania do góry strony
  const scrollToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth'
    });
  };

  // Skrót klawiaturowy Alt+T do przewijania do góry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        scrollToTop();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Jeśli showScrollToTop jest false, nie renderujemy przycisku
  if (!showScrollToTop) {
    return null;
  }

  // Renderujemy zwykły przycisk (bez animacji, które mogą być problematyczne)
  return (
    <button
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300"
      onClick={scrollToTop}
      aria-label="Przewiń do góry strony (Alt+T)"
      title="Przewiń do góry (Alt+T)"
    >
      <ChevronUpCircle className="h-6 w-6" />
    </button>
  );
}