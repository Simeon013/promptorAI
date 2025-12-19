'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
  CURRENCIES,
  formatCurrency,
  formatPrice,
  convertCurrency,
} from '@/config/currencies';
import {
  detectGeoLocation,
  getStoredPreferences,
  setUserPreferences,
  type GeoLocation
} from '@/lib/geo/geolocation';

interface UseCurrencyReturn {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  format: (amount: number) => string;
  formatWithSymbol: (amount: number) => string;
  convert: (amount: number, from: CurrencyCode) => number;
  currencyInfo: typeof CURRENCIES[CurrencyCode];
  isLoading: boolean;
  geoLocation: GeoLocation | null;
}

/**
 * Hook pour gérer la devise de l'utilisateur
 * - Détecte automatiquement la devise basée sur la géolocalisation
 * - Persiste le choix de l'utilisateur dans localStorage
 * - Fournit des fonctions de formatage et conversion
 */
export function useCurrency(): UseCurrencyReturn {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null);

  // Initialisation : charger la devise depuis localStorage ou détecter via géolocalisation
  useEffect(() => {
    const initCurrency = async () => {
      // D'abord, vérifier le localStorage
      const stored = getStoredPreferences();
      if (stored?.currency) {
        setCurrencyState(stored.currency);
        setIsLoading(false);
        return;
      }

      // Sinon, détecter via géolocalisation
      try {
        const geo = await detectGeoLocation();
        setGeoLocation(geo);
        setCurrencyState(geo.currency);
      } catch (error) {
        console.warn('Failed to detect geolocation:', error);
        // Fallback vers la devise par défaut
        setCurrencyState(DEFAULT_CURRENCY);
      } finally {
        setIsLoading(false);
      }
    };

    initCurrency();
  }, []);

  // Mettre à jour la devise et persister le choix
  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    setUserPreferences(undefined, newCurrency);
  }, []);

  // Formater un montant dans la devise courante
  const format = useCallback((amount: number): string => {
    return formatCurrency(amount, currency);
  }, [currency]);

  // Formater avec le symbole de devise natif
  const formatWithSymbol = useCallback((amount: number): string => {
    return formatPrice(amount, currency);
  }, [currency]);

  // Convertir un montant depuis une autre devise
  const convert = useCallback((amount: number, from: CurrencyCode): number => {
    return convertCurrency(amount, from, currency);
  }, [currency]);

  return {
    currency,
    setCurrency,
    format,
    formatWithSymbol,
    convert,
    currencyInfo: CURRENCIES[currency],
    isLoading,
    geoLocation,
  };
}

/**
 * Hook simplifié pour les composants qui ont juste besoin de formater des prix
 */
export function useFormatPrice() {
  const { currency, format, convert } = useCurrency();

  return {
    currency,
    format,
    // Convertir depuis XOF (devise de base de la DB) et formater
    formatFromBase: (amountInXOF: number) => format(convert(amountInXOF, 'XOF')),
    // Convertir depuis USD et formater
    formatFromUSD: (amountInUSD: number) => format(convert(amountInUSD, 'USD')),
  };
}
