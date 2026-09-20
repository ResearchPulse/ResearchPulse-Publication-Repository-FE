export type Locale = 'vi' | 'en';

export interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  isReady: boolean;
}

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}
