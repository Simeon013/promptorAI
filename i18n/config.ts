export const locales = ['fr', 'en', 'es', 'de', 'pt', 'ar', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  ar: 'العربية',
  zh: '中文',
};

export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  de: '🇩🇪',
  pt: '🇧🇷',
  ar: '🇸🇦',
  zh: '🇨🇳',
};

// Mapping pays -> locale (pour la détection automatique)
export const countryToLocale: Record<string, Locale> = {
  // Français
  FR: 'fr', BJ: 'fr', SN: 'fr', CI: 'fr', ML: 'fr', BF: 'fr', NE: 'fr', TG: 'fr',
  CM: 'fr', GA: 'fr', CG: 'fr', CD: 'fr', MG: 'fr', BE: 'fr', CH: 'fr', CA: 'fr',
  LU: 'fr', MC: 'fr', HT: 'fr',
  // Anglais
  US: 'en', GB: 'en', AU: 'en', NZ: 'en', IE: 'en', ZA: 'en', NG: 'en', GH: 'en',
  KE: 'en', IN: 'en', PH: 'en', SG: 'en', MY: 'en', PK: 'en',
  // Espagnol
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', CL: 'es', VE: 'es', EC: 'es',
  GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es',
  CR: 'es', PA: 'es', UY: 'es', PR: 'es',
  // Allemand
  DE: 'de', AT: 'de', LI: 'de',
  // Portugais
  PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt',
  // Arabe
  SA: 'ar', AE: 'ar', EG: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar', IQ: 'ar', JO: 'ar',
  LB: 'ar', KW: 'ar', QA: 'ar', BH: 'ar', OM: 'ar', YE: 'ar', LY: 'ar', SD: 'ar',
  // Chinois
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh',
};

// RTL languages (right-to-left)
export const rtlLocales: Locale[] = ['ar'];
