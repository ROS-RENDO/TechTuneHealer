import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  translations,
  type Language,
  type TranslationKey,
  type TranslationDictionary,
} from "../constants/translations";

const LANGUAGE_STORAGE_KEY = "@techtune_app_language";

interface LanguageState {
  language: Language;
  isInitialized: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  initLanguage: () => Promise<void>;
  t: (key: TranslationKey, fallback?: string) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: "en",
  isInitialized: false,

  setLanguage: async (lang: Language) => {
    set({ language: lang });
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      console.warn("Failed to persist language choice:", e);
    }
  },

  initLanguage: async () => {
    try {
      const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLang === "en" || savedLang === "km") {
        set({ language: savedLang, isInitialized: true });
        return;
      }
    } catch (e) {
      console.warn("Failed to read persisted language choice:", e);
    }
    set({ isInitialized: true });
  },

  t: (key: TranslationKey, fallback?: string) => {
    const currentLang = get().language;
    const dictionary = translations[currentLang] || translations.en;
    if (dictionary && dictionary[key]) {
      return dictionary[key];
    }
    // Fallback to English
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback || (key as string);
  },
}));

// Convenience React hook
export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useLanguageStore((state) => state.t);

  return {
    language,
    setLanguage,
    t: (key: TranslationKey, fallback?: string) => {
      const dict = translations[language] || translations.en;
      return dict[key] || translations.en[key] || fallback || (key as string);
    },
    isKhmer: language === "km",
  };
}

export { type Language, type TranslationKey, type TranslationDictionary };
