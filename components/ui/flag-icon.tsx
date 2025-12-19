'use client';

/**
 * Composant FlagIcon - Affiche des drapeaux de manière fiable sur toutes les plateformes
 * Utilise flag-icons CDN ou fallback sur le code pays
 */

import { useEffect, useState } from 'react';

interface FlagIconProps {
  code: string; // Code pays ISO 3166-1 alpha-2 (ex: 'fr', 'us', 'gb')
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackEmoji?: string;
}

// Mapping des codes langue/devise vers codes pays pour les drapeaux
const CODE_TO_COUNTRY: Record<string, string> = {
  // Langues
  en: 'gb',
  zh: 'cn',
  ar: 'sa',
  // Devises spéciales
  EUR: 'eu',
  USD: 'us',
  GBP: 'gb',
  CHF: 'ch',
  CAD: 'ca',
  AUD: 'au',
  XOF: 'bj',
  XAF: 'cm',
  MAD: 'ma',
  NGN: 'ng',
  GHS: 'gh',
  KES: 'ke',
  ZAR: 'za',
  CNY: 'cn',
  INR: 'in',
  SAR: 'sa',
  AED: 'ae',
  BRL: 'br',
};

const SIZE_CLASSES = {
  sm: 'w-4 h-3',
  md: 'w-5 h-4',
  lg: 'w-6 h-5',
  xl: 'w-8 h-6',
};

export function FlagIcon({ code, size = 'md', className = '', fallbackEmoji }: FlagIconProps) {
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Normaliser le code
  const normalizedCode = CODE_TO_COUNTRY[code] || CODE_TO_COUNTRY[code.toUpperCase()] || code.toLowerCase();

  // Générer l'emoji de fallback à partir du code pays
  const getFallbackEmoji = () => {
    if (fallbackEmoji) return fallbackEmoji;

    const countryCode = normalizedCode.toUpperCase();
    if (countryCode.length !== 2) return '🏳️';

    // Convertir le code pays en emoji drapeau (A=🇦, B=🇧, etc.)
    const codePoints = [...countryCode].map(
      char => 0x1F1E6 + char.charCodeAt(0) - 65
    );
    return String.fromCodePoint(...codePoints);
  };

  // Pendant le rendu serveur, afficher l'emoji
  if (!mounted) {
    return <span className={className}>{getFallbackEmoji()}</span>;
  }

  // Si l'image a échoué, afficher le code pays ou l'emoji
  if (imageError) {
    return (
      <span
        className={`inline-flex items-center justify-center font-bold text-xs bg-muted rounded ${className}`}
        title={normalizedCode.toUpperCase()}
      >
        {normalizedCode.toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${normalizedCode}.png`}
      srcSet={`https://flagcdn.com/w80/${normalizedCode}.png 2x`}
      alt={`${normalizedCode.toUpperCase()} flag`}
      className={`inline-block object-cover rounded-sm ${SIZE_CLASSES[size]} ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
}

// Export des mappings pour utilisation externe
export { CODE_TO_COUNTRY };
