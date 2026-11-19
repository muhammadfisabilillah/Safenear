import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import id from './locales/id.json';

const resources = {
  en: { translation: en },
  id: { translation: id },
};

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('safe-near-lang') : null;
const browserLang = typeof window !== 'undefined' ? navigator.language.slice(0, 2) : 'en';
const initialLang =
  savedLang || (resources[browserLang as keyof typeof resources] ? browserLang : 'en');

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  debug: process.env.NODE_ENV === 'development',
});

export function changeLanguage(lng: string) {
  i18n.changeLanguage(lng);
  if (typeof window !== 'undefined') {
    localStorage.setItem('safe-near-lang', lng);
  }
}

export default i18n;
