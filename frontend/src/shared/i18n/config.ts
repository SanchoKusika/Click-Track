import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

export const I18N_STORAGE_KEY = 'click_track_lang';
export const SUPPORTED_LANGUAGES = ['ru', 'en', 'uz'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: AppLanguage = 'ru';

function toAppLanguage(value: string | null | undefined): AppLanguage | null {
  if (!value) return null;
  const normalized = value.toLowerCase().split('-')[0];

  return SUPPORTED_LANGUAGES.find(lang => lang === normalized) ?? null;
}

function detectInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const fromStorage = toAppLanguage(localStorage.getItem(I18N_STORAGE_KEY));
  if (fromStorage) return fromStorage;

  return DEFAULT_LANGUAGE;
}

if (!i18n.isInitialized) {
  void i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      lng: detectInitialLanguage(),
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES,
      defaultNS: 'common',
      ns: ['common'],
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: '/locals/{{lng}}/{{ns}}.json',
      },
    });
}

i18n.on('languageChanged', language => {
  if (typeof window === 'undefined') return;
  const normalized = toAppLanguage(language) ?? DEFAULT_LANGUAGE;
  localStorage.setItem(I18N_STORAGE_KEY, normalized);
});

export default i18n;
