export const locales = ['es', 'en', 'de', 'pl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  de: 'Deutsch',
  pl: 'Polski',
};

export function getLocalePath(locale: Locale, path = '/'): string {
  if (locale === defaultLocale) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${cleanPath === '/' ? '/' : cleanPath}`;
}
