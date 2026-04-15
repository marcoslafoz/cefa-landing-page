export const locales = ['es', 'en', 'de', 'pl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  de: 'Deutsch',
  pl: 'Polski',
};

import es from '@/i18n/es.json';
import en from '@/i18n/en.json';
import de from '@/i18n/de.json';
import pl from '@/i18n/pl.json';

export const ui = { es, en, de, pl } as Record<Locale, Record<string, string>>;

export type TranslationKey = keyof typeof es;

export function useTranslations(locale: Locale) {
  return function t(key: TranslationKey): string {
    return ui[locale][key] ?? ui[defaultLocale][key] ?? key;
  };
}

export function getLocalePath(locale: Locale, path = '/'): string {
  if (locale === defaultLocale) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${cleanPath === '/' ? '/' : cleanPath}`;
}
