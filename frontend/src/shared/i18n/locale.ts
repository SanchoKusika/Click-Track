import { DEFAULT_LANGUAGE, type AppLanguage, SUPPORTED_LANGUAGES } from './config';

const LOCALE_BY_LANGUAGE: Record<AppLanguage, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  uz: 'uz-UZ',
};

export function getLanguage(value: string | null | undefined): AppLanguage {
  const normalized = value?.toLowerCase().split('-')[0];
  if (!normalized) return DEFAULT_LANGUAGE;

  return (SUPPORTED_LANGUAGES.find(lang => lang === normalized) ?? DEFAULT_LANGUAGE) as AppLanguage;
}

export function getIntlLocale(value: string | null | undefined): string {
  return LOCALE_BY_LANGUAGE[getLanguage(value)];
}

export function formatDate(
  value: string | number | Date,
  language: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Date(value).toLocaleDateString(getIntlLocale(language), options);
}
