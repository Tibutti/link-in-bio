import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Tłumaczenia
const resources = {
  en: {
    translation: {
      // Ogólne
      profile: {
        title: "Profile",
        bio: "Bio",
        contact: {
          title: "Contact",
          email: "Email",
          phone: "Phone",
          cv: "Download CV"
        }
      },
      // Sekcje
      sections: {
        technologies: "Technical Skills",
        social: "Social Media",
        knowledge: "Knowledge Platforms",
        featured: "Featured Content",
        github: "GitHub Stats",
        tryHackMe: "TryHackMe"
      },
      // Kategorie technologii
      technology: {
        categories: {
          frontend: "Frontend",
          backend: "Backend",
          mobile: "Mobile",
          devops: "DevOps",
          database: "Databases",
          cloud: "Cloud",
          testing: "Testing",
          design: "Design",
          other: "Other"
        },
        proficiencyLevel: "Proficiency level",
        yearsOfExperience_one: "{{count}} year of experience",
        yearsOfExperience_other: "{{count}} years of experience"
      },
      // Przełącznik motywu
      theme: {
        toggle: "Toggle theme",
        light: "Light",
        dark: "Dark",
        system: "System"
      },
      // Przełącznik języka
      language: {
        toggle: "Change language",
        polish: "Polish",
        english: "English"
      },
      // Elementy UI
      ui: {
        loading: "Loading...",
        noData: "No data available"
      },
      // Panel administracyjny
      admin: {
        panel: "Admin Panel",
        login: "Login",
        logout: "Logout"
      },
      // Kontakty i Wizytownik
      contacts: {
        title: "Contacts",
        contact_added: "Contact Added",
        contact_added_success: "Contact has been added to your contacts",
        contact_add_error: "Error adding contact",
        add_contact_title: "Add to Contacts",
        add_contact_description: "Do you want to add {{name}} to your contacts?",
        add_to_contacts: "Add to Contacts",
        scan_qr: "Scan QR Code"
      },
      // Wspólne elementy
      common: {
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        close: "Close"
      }
    }
  },
  pl: {
    translation: {
      // Ogólne
      profile: {
        title: "Profil",
        bio: "Bio",
        contact: {
          title: "Kontakt",
          email: "Email",
          phone: "Telefon",
          cv: "Pobierz CV"
        }
      },
      // Sekcje
      sections: {
        technologies: "Umiejętności techniczne",
        social: "Media społecznościowe",
        knowledge: "Platformy wiedzy",
        featured: "Wyróżnione treści",
        github: "Statystyki GitHub",
        tryHackMe: "TryHackMe"
      },
      // Kategorie technologii
      technology: {
        categories: {
          frontend: "Frontend",
          backend: "Backend",
          mobile: "Mobile",
          devops: "DevOps",
          database: "Bazy danych",
          cloud: "Chmura",
          testing: "Testowanie",
          design: "Design",
          other: "Inne"
        },
        proficiencyLevel: "Poziom umiejętności",
        yearsOfExperience_one: "{{count}} rok doświadczenia",
        yearsOfExperience_other: "{{count}} lat doświadczenia"
      },
      // Przełącznik motywu
      theme: {
        toggle: "Zmień motyw",
        light: "Jasny",
        dark: "Ciemny",
        system: "Systemowy"
      },
      // Przełącznik języka
      language: {
        toggle: "Zmień język",
        polish: "Polski",
        english: "Angielski"
      },
      // Elementy UI
      ui: {
        loading: "Ładowanie...",
        noData: "Brak dostępnych danych"
      },
      // Panel administracyjny
      admin: {
        panel: "Panel administracyjny",
        login: "Zaloguj się",
        logout: "Wyloguj się"
      },
      // Kontakty i Wizytownik
      contacts: {
        title: "Kontakty",
        contact_added: "Kontakt dodany",
        contact_added_success: "Kontakt został dodany do Twoich kontaktów",
        contact_add_error: "Błąd podczas dodawania kontaktu",
        add_contact_title: "Dodaj do kontaktów",
        add_contact_description: "Czy chcesz dodać {{name}} do swoich kontaktów?",
        add_to_contacts: "Dodaj do kontaktów",
        scan_qr: "Skanuj kod QR"
      },
      // Wspólne elementy
      common: {
        save: "Zapisz",
        cancel: "Anuluj",
        delete: "Usuń",
        edit: "Edytuj",
        close: "Zamknij"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "pl",
    interpolation: {
      escapeValue: false // React już zapobiega XSS
    }
  });

export default i18n;