/**
 * Service de géolocalisation pour détecter automatiquement
 * la langue et la devise de l'utilisateur
 */

import { Locale, countryToLocale, defaultLocale } from '@/i18n/config';
import { CurrencyCode, countryToCurrency, DEFAULT_CURRENCY, getActiveCurrencyOrDefault } from '@/config/currencies';

export interface GeoLocation {
  country: string;       // Code pays ISO 3166-1 alpha-2 (ex: "FR", "US")
  countryName: string;   // Nom du pays
  city?: string;
  region?: string;
  timezone?: string;
  locale: Locale;
  currency: CurrencyCode;
}

// Cache de la géolocalisation (côté client)
let cachedGeoLocation: GeoLocation | null = null;

/**
 * Détecte la localisation de l'utilisateur via plusieurs méthodes
 * 1. Cache local
 * 2. API de géolocalisation (ipapi.co, ip-api.com, etc.)
 * 3. Fallback sur les préférences navigateur
 */
export async function detectGeoLocation(): Promise<GeoLocation> {
  // Retourner le cache si disponible
  if (cachedGeoLocation) {
    return cachedGeoLocation;
  }

  // Essayer de détecter via une API de géolocalisation
  try {
    const response = await fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      const country = data.country_code || data.country;

      const geoLocation: GeoLocation = {
        country: country,
        countryName: data.country_name || country,
        city: data.city,
        region: data.region,
        timezone: data.timezone,
        locale: getLocaleByCountry(country),
        currency: getCurrencyByCountry(country),
      };

      cachedGeoLocation = geoLocation;

      // Stocker en localStorage pour les visites futures
      if (typeof window !== 'undefined') {
        localStorage.setItem('promptor_geo', JSON.stringify(geoLocation));
      }

      return geoLocation;
    }
  } catch (error) {
    console.warn('Geolocation API failed, using fallback:', error);
  }

  // Fallback: utiliser les préférences du navigateur
  return getGeoLocationFromBrowser();
}

/**
 * Obtient la localisation depuis les préférences du navigateur
 */
export function getGeoLocationFromBrowser(): GeoLocation {
  if (typeof window === 'undefined') {
    return getDefaultGeoLocation();
  }

  // Vérifier le cache localStorage
  const cached = localStorage.getItem('promptor_geo');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Ignorer les erreurs de parsing
    }
  }

  // Détecter la langue depuis le navigateur
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || 'en';
  const parts = browserLang.split('-');
  const langCode = (parts[0] || 'en').toLowerCase();
  const countryCode = parts[1]?.toUpperCase() || '';

  // Mapper la langue vers une locale supportée
  let locale: Locale = defaultLocale;
  if (['fr', 'en', 'es', 'de', 'pt', 'ar', 'zh'].includes(langCode)) {
    locale = langCode as Locale;
  }

  // Déterminer la devise
  let currency: CurrencyCode = DEFAULT_CURRENCY;
  if (countryCode && countryToCurrency[countryCode]) {
    currency = countryToCurrency[countryCode];
  }

  const geoLocation: GeoLocation = {
    country: countryCode || 'US',
    countryName: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale,
    currency,
  };

  // Stocker pour les prochaines visites
  localStorage.setItem('promptor_geo', JSON.stringify(geoLocation));
  cachedGeoLocation = geoLocation;

  return geoLocation;
}

/**
 * Retourne les valeurs par défaut (français + XOF pour FedaPay)
 */
export function getDefaultGeoLocation(): GeoLocation {
  return {
    country: 'SN',
    countryName: 'Sénégal',
    timezone: 'Africa/Dakar',
    locale: defaultLocale,
    currency: DEFAULT_CURRENCY,
  };
}

/**
 * Obtient la locale pour un pays donné
 */
export function getLocaleByCountry(countryCode: string): Locale {
  return countryToLocale[countryCode.toUpperCase()] || defaultLocale;
}

/**
 * Obtient la devise pour un pays donné
 * Si la devise du pays n'est pas active (pas supportée par FedaPay),
 * retourne la devise par défaut (XOF)
 */
export function getCurrencyByCountry(countryCode: string): CurrencyCode {
  const countryCurrency = countryToCurrency[countryCode.toUpperCase()];
  if (countryCurrency) {
    return getActiveCurrencyOrDefault(countryCurrency);
  }
  return DEFAULT_CURRENCY;
}

/**
 * Met à jour les préférences de l'utilisateur (manuellement)
 */
export function setUserPreferences(locale?: Locale, currency?: CurrencyCode): void {
  if (typeof window === 'undefined') return;

  const current = cachedGeoLocation || getGeoLocationFromBrowser();

  const updated: GeoLocation = {
    ...current,
    locale: locale || current.locale,
    currency: currency || current.currency,
  };

  cachedGeoLocation = updated;
  localStorage.setItem('promptor_geo', JSON.stringify(updated));
}

/**
 * Réinitialise les préférences de l'utilisateur
 */
export function resetUserPreferences(): void {
  if (typeof window === 'undefined') return;

  cachedGeoLocation = null;
  localStorage.removeItem('promptor_geo');
}

/**
 * Hook-friendly: obtient les préférences depuis localStorage (synchrone)
 */
export function getStoredPreferences(): { locale: Locale; currency: CurrencyCode } | null {
  if (typeof window === 'undefined') return null;

  const cached = localStorage.getItem('promptor_geo');
  if (cached) {
    try {
      const data = JSON.parse(cached);
      return {
        locale: data.locale || defaultLocale,
        currency: data.currency || DEFAULT_CURRENCY,
      };
    } catch {
      return null;
    }
  }
  return null;
}
