/**
 * Configuration des devises supportées
 * Système international avec détection automatique par pays
 *
 * Phase 1: FedaPay uniquement (XOF, EUR, GNF)
 * Phase 2: Stripe pour internationalisation (USD, GBP, etc.)
 */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'XOF' | 'XAF' | 'MAD' | 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'BRL' | 'CNY' | 'INR' | 'CAD' | 'AUD' | 'CHF' | 'SAR' | 'AED' | 'GNF';

export type PaymentGateway = 'fedapay' | 'stripe' | 'none';

export interface Currency {
  code: CurrencyCode;
  name: string;
  nameEn: string; // Nom en anglais pour l'affichage international
  symbol: string;
  flag: string;
  decimals: number;
  displayFormat: string; // '{amount} {symbol}' ou '{symbol}{amount}'
  rateToUSD: number; // Taux de conversion vers USD (devise de référence)
  locale: string; // Locale pour le formatage des nombres
  isActive: boolean; // Si la devise est actuellement disponible
  gateway: PaymentGateway; // Gateway de paiement pour cette devise
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  // ============================================
  // DEVISES ACTIVES - FedaPay (Phase 1)
  // ============================================

  // Euro - Supporté par FedaPay
  EUR: {
    code: 'EUR',
    name: 'Euro',
    nameEn: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    decimals: 2,
    displayFormat: '{amount} {symbol}',
    rateToUSD: 1.08,
    locale: 'fr-FR',
    isActive: true,
    gateway: 'fedapay',
  },

  // Franc CFA UEMOA - Devise principale FedaPay
  XOF: {
    code: 'XOF',
    name: 'Franc CFA (UEMOA)',
    nameEn: 'CFA Franc BCEAO',
    symbol: 'FCFA',
    flag: '🇧🇯',
    decimals: 0,
    displayFormat: '{amount} {symbol}',
    rateToUSD: 0.00165,
    locale: 'fr-BJ',
    isActive: true,
    gateway: 'fedapay',
  },

  // Franc guinéen - Supporté par FedaPay
  GNF: {
    code: 'GNF',
    name: 'Franc guinéen',
    nameEn: 'Guinean Franc',
    symbol: 'GNF',
    flag: '🇬🇳',
    decimals: 0,
    displayFormat: '{amount} {symbol}',
    rateToUSD: 0.000116,
    locale: 'fr-GN',
    isActive: true,
    gateway: 'fedapay',
  },

  // ============================================
  // DEVISES INACTIVES - Stripe (Phase 2)
  // À activer lors de l'internationalisation
  // ============================================

  // Dollar américain
  USD: {
    code: 'USD',
    name: 'Dollar américain',
    nameEn: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    decimals: 2,
    displayFormat: '{symbol}{amount}',
    rateToUSD: 1,
    locale: 'en-US',
    isActive: false, // À activer avec Stripe
    gateway: 'stripe',
  },

  // Livre sterling
  GBP: {
    code: 'GBP',
    name: 'Livre sterling',
    nameEn: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    decimals: 2,
    displayFormat: '{symbol}{amount}',
    rateToUSD: 1.27,
    locale: 'en-GB',
    isActive: false,
    gateway: 'stripe',
  },

  // Franc suisse
  CHF: {
    code: 'CHF',
    name: 'Franc suisse',
    nameEn: 'Swiss Franc',
    symbol: 'CHF',
    flag: '🇨🇭',
    decimals: 2,
    displayFormat: '{symbol} {amount}',
    rateToUSD: 1.13,
    locale: 'fr-CH',
    isActive: false,
    gateway: 'stripe',
  },

  // Dollar canadien
  CAD: {
    code: 'CAD',
    name: 'Dollar canadien',
    nameEn: 'Canadian Dollar',
    symbol: 'CA$',
    flag: '🇨🇦',
    decimals: 2,
    displayFormat: '{symbol}{amount}',
    rateToUSD: 0.74,
    locale: 'en-CA',
    isActive: false,
    gateway: 'stripe',
  },

  // Dollar australien
  AUD: {
    code: 'AUD',
    name: 'Dollar australien',
    nameEn: 'Australian Dollar',
    symbol: 'A$',
    flag: '🇦🇺',
    decimals: 2,
    displayFormat: '{symbol}{amount}',
    rateToUSD: 0.65,
    locale: 'en-AU',
    isActive: false,
    gateway: 'stripe',
  },

  // Franc CFA CEMAC
  XAF: {
    code: 'XAF',
    name: 'Franc CFA (CEMAC)',
    nameEn: 'CFA Franc BEAC',
    symbol: 'FCFA',
    flag: '🇨🇲',
    decimals: 0,
    displayFormat: '{amount} {symbol}',
    rateToUSD: 0.00165,
    locale: 'fr-CM',
    isActive: false, // Pas supporté par FedaPay, à activer avec autre gateway
    gateway: 'none',
  },

  // Dirham marocain
  MAD: {
    code: 'MAD',
    name: 'Dirham marocain',
    nameEn: 'Moroccan Dirham',
    symbol: 'DH',
    flag: '🇲🇦',
    decimals: 2,
    displayFormat: '{amount} {symbol}',
    rateToUSD: 0.099,
    locale: 'ar-MA',
    isActive: false,
    gateway: 'stripe',
  },

  // Naira nigérian
  NGN: {
    code: 'NGN',
    name: 'Naira nigérian',
    nameEn: 'Nigerian Naira',
    symbol: '₦',
    flag: '🇳🇬',
    decimals: 0,
    displayFormat: '{symbol}{amount}',
    rateToUSD: 0.00063,
    locale: 'en-NG',
    isActive: false,
    gateway: 'stripe',
  },

  // Cedi ghanéen
  GHS: {
    code: 'GHS',
    name: 'Cedi ghanéen',
    nameEn: 'Ghanaian Cedi',
    symbol: 'GH₵',
    flag: '🇬🇭',
    decimals: 2,
    displayFormat: '{symbol}{amount}',
    rateToUSD: 0.064,
    locale: 'en-GH',
    isActive: false,
    gateway: 'stripe',
  },

  // Shilling kényan
  KES: {
    code: 'KES',
    name: 'Shilling kényan',
    nameEn: 'Kenyan Shilling',
    symbol: 'KSh',
    flag: '🇰🇪',
    decimals: 0,
    displayFormat: '{symbol}{amount}',
    rateToUSD: 0.0077,
    locale: 'en-KE',
    isActive: false,
    gateway: 'stripe',
  },

  // Rand sud-africain
  ZAR: {
    code: 'ZAR',
    name: 'Rand sud-africain',
    nameEn: 'South African Rand',
    symbol: 'R',
    flag: '🇿🇦',
    decimals: 2,
    displayFormat: '{symbol}{amount}',
    rateToUSD: 0.055,
    locale: 'en-ZA',
    isActive: false,
    gateway: 'stripe',
  },

  // Yuan chinois
  CNY: {
    code: 'CNY',
    name: 'Yuan chinois',
    nameEn: 'Chinese Yuan',
    symbol: '¥',
    flag: '🇨🇳',
    decimals: 2,
    displayFormat: '{symbol}{amount}',
    rateToUSD: 0.14,
    locale: 'zh-CN',
    isActive: false,
    gateway: 'stripe',
  },

  // Roupie indienne
  INR: {
    code: 'INR',
    name: 'Roupie indienne',
    nameEn: 'Indian Rupee',
    symbol: '₹',
    flag: '🇮🇳',
    decimals: 0,
    displayFormat: '{symbol}{amount}',
    rateToUSD: 0.012,
    locale: 'en-IN',
    isActive: false,
    gateway: 'stripe',
  },

  // Riyal saoudien
  SAR: {
    code: 'SAR',
    name: 'Riyal saoudien',
    nameEn: 'Saudi Riyal',
    symbol: 'SAR',
    flag: '🇸🇦',
    decimals: 2,
    displayFormat: '{amount} {symbol}',
    rateToUSD: 0.27,
    locale: 'ar-SA',
    isActive: false,
    gateway: 'stripe',
  },

  // Dirham émirati
  AED: {
    code: 'AED',
    name: 'Dirham émirati',
    nameEn: 'UAE Dirham',
    symbol: 'AED',
    flag: '🇦🇪',
    decimals: 2,
    displayFormat: '{amount} {symbol}',
    rateToUSD: 0.27,
    locale: 'ar-AE',
    isActive: false,
    gateway: 'stripe',
  },

  // Real brésilien
  BRL: {
    code: 'BRL',
    name: 'Real brésilien',
    nameEn: 'Brazilian Real',
    symbol: 'R$',
    flag: '🇧🇷',
    decimals: 2,
    displayFormat: '{symbol}{amount}',
    rateToUSD: 0.20,
    locale: 'pt-BR',
    isActive: false,
    gateway: 'stripe',
  },
};

// Devise par défaut (XOF pour FedaPay - Phase 1)
export const DEFAULT_CURRENCY: CurrencyCode = 'XOF';

/**
 * Obtient uniquement les devises actives
 */
export function getActiveCurrencies(): Currency[] {
  return Object.values(CURRENCIES).filter(c => c.isActive);
}

/**
 * Obtient les codes des devises actives
 */
export function getActiveCurrencyCodes(): CurrencyCode[] {
  return getActiveCurrencies().map(c => c.code);
}

/**
 * Vérifie si une devise est active
 */
export function isCurrencyActive(code: CurrencyCode): boolean {
  return CURRENCIES[code]?.isActive ?? false;
}

/**
 * Obtient une devise active par défaut si la devise demandée n'est pas active
 */
export function getActiveCurrencyOrDefault(code: CurrencyCode): CurrencyCode {
  if (isCurrencyActive(code)) {
    return code;
  }
  return DEFAULT_CURRENCY;
}

// Mapping pays -> devise
export const countryToCurrency: Record<string, CurrencyCode> = {
  // Zone USD
  US: 'USD', EC: 'USD', SV: 'USD', PA: 'USD',

  // Zone Euro
  FR: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR', NL: 'EUR', BE: 'EUR',
  AT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR', LU: 'EUR', SK: 'EUR', SI: 'EUR',
  EE: 'EUR', LV: 'EUR', LT: 'EUR', CY: 'EUR', MT: 'EUR', HR: 'EUR',

  // Livre sterling
  GB: 'GBP',

  // Franc suisse
  CH: 'CHF', LI: 'CHF',

  // Dollar canadien
  CA: 'CAD',

  // Dollar australien
  AU: 'AUD', NZ: 'AUD',

  // Zone XOF (UEMOA)
  BJ: 'XOF', BF: 'XOF', CI: 'XOF', GW: 'XOF', ML: 'XOF', NE: 'XOF', SN: 'XOF', TG: 'XOF',

  // Zone XAF (CEMAC)
  CM: 'XAF', CF: 'XAF', TD: 'XAF', CG: 'XAF', GQ: 'XAF', GA: 'XAF',

  // Maroc
  MA: 'MAD',

  // Nigeria
  NG: 'NGN',

  // Ghana
  GH: 'GHS',

  // Kenya
  KE: 'KES',

  // Afrique du Sud
  ZA: 'ZAR',

  // Chine
  CN: 'CNY', HK: 'CNY', MO: 'CNY',

  // Inde
  IN: 'INR',

  // Arabie Saoudite
  SA: 'SAR',

  // Émirats Arabes Unis
  AE: 'AED',

  // Brésil
  BR: 'BRL',

  // Amérique latine (USD par défaut car dollarisé ou préféré)
  MX: 'USD', CO: 'USD', AR: 'USD', PE: 'USD', CL: 'USD', VE: 'USD',
};

/**
 * Convertit un montant d'une devise vers une autre
 * Utilise USD comme devise pivot
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;

  // Convertir vers USD d'abord (devise pivot)
  const amountInUSD = amount * CURRENCIES[from].rateToUSD;

  // Puis vers la devise cible
  const result = amountInUSD / CURRENCIES[to].rateToUSD;

  // Arrondir selon les décimales de la devise cible
  const decimals = CURRENCIES[to].decimals;
  return Math.round(result * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Formate un montant selon la devise
 * @param amount - Montant à formater
 * @param currency - Code de la devise
 * @param locale - Locale optionnelle pour le formatage (sinon utilise la locale de la devise)
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  locale?: string
): string {
  const curr = CURRENCIES[currency];
  const useLocale = locale || curr.locale;

  const formattedAmount = amount.toLocaleString(useLocale, {
    minimumFractionDigits: curr.decimals,
    maximumFractionDigits: curr.decimals,
  });

  return curr.displayFormat
    .replace('{amount}', formattedAmount)
    .replace('{symbol}', curr.symbol);
}

/**
 * Formate un prix avec le symbole de devise (format natif Intl)
 */
export function formatPrice(
  amount: number,
  currency: CurrencyCode,
  locale?: string
): string {
  const curr = CURRENCIES[currency];
  const useLocale = locale || curr.locale;

  try {
    return new Intl.NumberFormat(useLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: curr.decimals,
      maximumFractionDigits: curr.decimals,
    }).format(amount);
  } catch {
    // Fallback si le code devise n'est pas reconnu par Intl
    return formatCurrency(amount, currency, locale);
  }
}

/**
 * Obtient le prix d'un pack dans une devise donnée
 */
export function getPackPrice(
  basePrice: number,
  baseCurrency: CurrencyCode,
  targetCurrency: CurrencyCode
): number {
  return convertCurrency(basePrice, baseCurrency, targetCurrency);
}

/**
 * Calcule le prix par crédit
 */
export function getPricePerCredit(
  price: number,
  credits: number,
  currency: CurrencyCode
): string {
  const pricePerCredit = price / credits;
  const decimals = CURRENCIES[currency].decimals;

  return pricePerCredit.toFixed(decimals > 0 ? decimals : 2);
}

/**
 * Obtient la devise par défaut pour un pays donné
 */
export function getCurrencyByCountry(countryCode: string): CurrencyCode {
  return countryToCurrency[countryCode.toUpperCase()] || DEFAULT_CURRENCY;
}

/**
 * Liste des devises pour le sélecteur
 */
export function getCurrencyList(): Array<{ code: CurrencyCode; name: string; nameEn: string; symbol: string; flag: string }> {
  return Object.values(CURRENCIES).map(c => ({
    code: c.code,
    name: c.name,
    nameEn: c.nameEn,
    symbol: c.symbol,
    flag: c.flag,
  }));
}
