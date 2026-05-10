import ko from '../../i18n/support.ko.json';
import en from '../../i18n/support.en.json';

export type SupportLocale = 'ko' | 'en';
export type SupportStrings = typeof ko;

const STRINGS: Record<SupportLocale, SupportStrings> = { ko, en };

export function getSupportStrings(locale: SupportLocale): SupportStrings {
  return STRINGS[locale] ?? STRINGS.en;
}

export function detectSupportLocale(): SupportLocale {
  if (typeof document === 'undefined') return 'en';
  const lang = (document.documentElement.lang || 'en').toLowerCase();
  return lang.startsWith('ko') ? 'ko' : 'en';
}
