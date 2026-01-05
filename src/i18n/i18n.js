

// src/i18n/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translations (we'll create these next)
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';
import trTranslations from '../locales/tr.json';
import ruTranslations from '../locales/ru.json';

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    debug: process.env.NODE_ENV === 'development', // Debug only in dev
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    resources: {
      en: {
        translation: enTranslations,
      },
      es: {
        translation: esTranslations,
      },
      tr: {
        translation: trTranslations,
      },
      ru: {
        translation: ruTranslations,
      },
      // Add these ALIASES for display names
      English: {
        translation: enTranslations,
      },
      Spanish: {
        translation: esTranslations,
      },
      Turkish: {  // ← This allows "Turkish" as a valid language code
        translation: trTranslations,
      },
      Russian: {
        translation: ruTranslations,
      },
    },
    // Language detection order
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;