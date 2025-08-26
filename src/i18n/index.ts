import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import en from './en.json';
import ar from './ar.json';

const resources = { en: { translation: en }, ar: { translation: ar } } as const;

const locales = RNLocalize.getLocales();
const defaultLang = locales[0]?.languageCode === 'ar' ? 'ar' : 'en';

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: defaultLang,
  fallbackLng: defaultLang,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Change language function
export const changeLanguage = async (lng: string) => {
  try {
    const loaded = await i18n.changeLanguage(lng);
    return loaded;
  } catch (error) {
    return false;
  }
};

export default i18n;
