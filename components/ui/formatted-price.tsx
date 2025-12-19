'use client';

import { formatCurrency, type CurrencyCode, CURRENCIES } from '@/config/currencies';

interface FormattedPriceProps {
  amount: number;
  currency: CurrencyCode;
  className?: string;
  showSymbol?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Composant pour afficher un prix formaté selon la devise
 */
export function FormattedPrice({
  amount,
  currency,
  className = '',
  showSymbol = true,
  size = 'md',
}: FormattedPriceProps) {
  const currencyInfo = CURRENCIES[currency];
  const formattedAmount = amount.toLocaleString(currencyInfo.locale, {
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals,
  });

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  if (!showSymbol) {
    return <span className={`${sizeClasses[size]} ${className}`}>{formattedAmount}</span>;
  }

  // Appliquer le format d'affichage de la devise
  const formatted = currencyInfo.displayFormat
    .replace('{amount}', formattedAmount)
    .replace('{symbol}', currencyInfo.symbol);

  return <span className={`${sizeClasses[size]} ${className}`}>{formatted}</span>;
}

/**
 * Affiche un prix avec le montant et le symbole séparés (pour un design plus flexible)
 */
export function PriceDisplay({
  amount,
  currency,
  amountClassName = '',
  symbolClassName = '',
}: {
  amount: number;
  currency: CurrencyCode;
  amountClassName?: string;
  symbolClassName?: string;
}) {
  const currencyInfo = CURRENCIES[currency];
  const formattedAmount = amount.toLocaleString(currencyInfo.locale, {
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals,
  });

  // Déterminer l'ordre (symbole avant ou après)
  const symbolBefore = currencyInfo.displayFormat.indexOf('{symbol}') < currencyInfo.displayFormat.indexOf('{amount}');

  if (symbolBefore) {
    return (
      <>
        <span className={symbolClassName}>{currencyInfo.symbol}</span>
        <span className={amountClassName}>{formattedAmount}</span>
      </>
    );
  }

  return (
    <>
      <span className={amountClassName}>{formattedAmount}</span>
      <span className={symbolClassName}> {currencyInfo.symbol}</span>
    </>
  );
}

/**
 * Formatage inline simple
 */
export function formatPriceInline(amount: number, currency: CurrencyCode): string {
  return formatCurrency(amount, currency);
}
