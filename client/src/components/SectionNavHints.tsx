import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpCircle } from 'lucide-react';

interface NavSection {
  id: string;
  title: string;
}

export default function SectionNavHints() {
  const [visibleSections, setVisibleSections] = useState<NavSection[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Lista wszystkich sekcji do obserwowania
  const sections: NavSection[] = [
    { id: 'profile-header', title: 'Profil' },
    { id: 'social', title: 'Media społecznościowe' },
    { id: 'knowledge', title: 'Publikacje i twórczość' },
    { id: 'featured', title: 'Wybrane projekty' },
    { id: 'technologies', title: 'Umiejętności techniczne' },
    { id: 'github', title: 'GitHub' },
    { id: 'tryhackme', title: 'TryHackMe' }
  ];

  useEffect(() => {
    // Obserwuj przewijanie strony, aby pokazać/ukryć przycisk "do góry"
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);

    // Inicjalizacja obserwatora przecięcia (intersection observer)
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id;
          const section = sections.find(s => s.id === sectionId);
          
          if (section) {
            if (entry.isIntersecting) {
              setActiveSection(sectionId);
              setVisibleSections(prevSections => {
                if (!prevSections.some(s => s.id === sectionId)) {
                  return [...prevSections, section].sort((a, b) => 
                    sections.findIndex(s => s.id === a.id) - sections.findIndex(s => s.id === b.id)
                  );
                }
                return prevSections;
              });
            } else {
              setVisibleSections(prevSections => 
                prevSections.filter(s => s.id !== sectionId)
              );
            }
          }
        });
      },
      { threshold: 0.1 } // Sekcja jest uznawana za widoczną, gdy 10% jest w widoku
    );

    // Obserwuj wszystkie sekcje
    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observerRef.current?.disconnect();
    };
  }, []);

  // Funkcja przewijania do sekcji
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Ustawienie fokusa na sekcji dla dostępności
      element.focus();
    }
  };

  // Funkcja przewijania do góry strony
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Ustawienie fokusa na głównym elemencie strony dla dostępności
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.focus();
    }
  };

  if (visibleSections.length === 0) return null;

  return (
    <>
      {/* Przyciski pomijania treści - widoczne tylko przy nawigacji klawiaturą */}
      <div className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-4 focus-within:left-4 focus-within:z-50">
        <button
          className="bg-primary text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          onClick={() => document.querySelector('main')?.focus()}
        >
          Przejdź do głównej treści
        </button>
      </div>

      {/* Pływająca nawigacja po sekcjach */}
      <nav 
        className="fixed bottom-6 left-4 z-40" 
        aria-label="Nawigacja po sekcjach"
      >
        <div className="flex flex-col items-start space-y-2">
          <AnimatePresence>
            {visibleSections.map((section) => (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                  activeSection === section.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => scrollToSection(section.id)}
                aria-current={activeSection === section.id ? 'true' : 'false'}
              >
                {section.title}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </nav>

      {/* Przycisk "do góry" */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-4 z-40 p-2 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={scrollToTop}
            aria-label="Przewiń do góry strony"
          >
            <ChevronUpCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}