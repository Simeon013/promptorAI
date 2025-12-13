/**
 * Configuration des devises supportées
 */

export type CurrencyCode = 'XOF' | 'EUR' | 'USD';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string; // Emoji du drapeau
  decimals: number;
  displayFormat: string; // '{amount} {symbol}' ou '{symbol}{amount}'
  rateToXOF: number; // Taux de conversion vers FCFA
  rateFromXOF: number; // Taux de conversion depuis FCFA
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  XOF: {
    code: 'XOF',
    name: 'Franc CFA',
    symbol: 'FCFA',
    flag: '🇧🇯', // Bénin (UEMOA)
    decimals: 0,
    displayFormat: '{amount} {symbol}',
    rateToXOF: 1,
    rateFromXOF: 1,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    decimals: 2,
    displayFormat: '{amount}{symbol}',
    rateToXOF: 655.957,
    rateFromXOF: 0.001524,
  },
  USD: {
    code: 'USD',
    name: 'Dollar US',
    symbol: '$',
    flag: '🇺🇸',
    decimals: 2,
    displayFormat: '{symbol}{amount}',
    rateToXOF: 607.50,
    rateFromXOF: 0.001646,
  },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'XOF';

/**
 * Convertit un montant d'une devise vers une autre
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;

  // Convertir vers XOF d'abord
  const amountInXOF = amount * CURRENCIES[from].rateToXOF;

  // Puis vers la devise cible
  const result = amountInXOF * CURRENCIES[to].rateFromXOF;

  // Arrondir selon les décimales de la devise cible
  const decimals = CURRENCIES[to].decimals;
  return Math.round(result * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Formate un montant selon la devise
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const curr = CURRENCIES[currency];
  const formattedAmount = amount.toLocaleString('fr-FR', {
    minimumFractionDigits: curr.decimals,
    maximumFractionDigits: curr.decimals,
  });

  return curr.displayFormat
    .replace('{amount}', formattedAmount)
    .replace('{symbol}', curr.symbol);
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
