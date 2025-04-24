import { useState, useEffect } from 'react';
import { ChevronUpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Pomocnik dla czytników ekranowych - dostępność
interface AccessibilityHelperProps {
  title: string;
  shortcutKey?: string;
}

function AccessibilityHelper({ title, shortcutKey }: AccessibilityHelperProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-white text-center py-2 px-4 sr-only">
      {shortcutKey ? (
        <p>
          Naciśnij {shortcutKey}, aby {title.toLowerCase()}
        </p>
      ) : (
        <p>{title}</p>
      )}
    </div>
  );
}

export default function SectionNavHints() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  useEffect(() => {
    // Funkcja obsługująca przewijanie strony
    const handleScroll = () => {
      // Pokazuj przycisk "do góry" tylko gdy strona jest przewinięta 
      setShowScrollToTop(window.scrollY > 300);
    };
    
    // Dodaj nasłuchiwanie przewijania
    window.addEventListener('scroll', handleScroll);
    
    // Wykonaj od razu, aby poprawnie pokazać/ukryć przycisk przy ładowaniu
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
    
    // Ustawienie fokusa na nagłówku po przewinięciu
    setTimeout(() => {
      const header = document.getElementById('profile-header');
      if (header) {
        header.focus();
      }
    }, 500);
  };

  // Dodajemy obsługę skrótu klawiaturowego (Alt+T) do przewijania do góry
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

  return (
    <>
      {/* Pomocnik dla czytników ekranowych */}
      <AccessibilityHelper 
        title="Strona posiada przyciski nawigacyjne dostępne przez klawiaturę" 
        shortcutKey="Alt+T"
      />
      
      {/* Przycisk przewijania do góry */}
      {showScrollToTop && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          onClick={scrollToTop}
          aria-label="Przewiń do góry strony (Alt+T)"
          title="Przewiń do góry (Alt+T)"
        >
          <ChevronUpCircle className="h-6 w-6" />
        </motion.button>
      )}
    </>
  );
}