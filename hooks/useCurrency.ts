'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
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

// Custom event pour synchroniser la devise entre tous les composants
const CURRENCY_CHANGE_EVENT = 'promptor:currencyChange';

// Store global pour la devise
let currentCurrency: CurrencyCode = DEFAULT_CURRENCY;
let listeners: Set<() => void> = new Set();

function emitCurrencyChange(currency: CurrencyCode) {
  currentCurrency = currency;
  // Notifier tous les listeners
  listeners.forEach(listener => listener());
  // Émettre un événement custom pour les composants qui n'utilisent pas le hook
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CURRENCY_CHANGE_EVENT, { detail: { currency } }));
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentCurrency;
}

function getServerSnapshot() {
  return DEFAULT_CURRENCY;
}

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
 * - Synchronise automatiquement entre tous les composants
 */
export function useCurrency(): UseCurrencyReturn {
  // Utilise useSyncExternalStore pour synchroniser entre tous les composants
  const currency = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isLoading, setIsLoading] = useState(true);
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null);

  // Initialisation : charger la devise depuis localStorage ou détecter via géolocalisation
  useEffect(() => {
    const initCurrency = async () => {
      // D'abord, vérifier le localStorage
      const stored = getStoredPreferences();
      if (stored?.currency) {
        currentCurrency = stored.currency;
        listeners.forEach(listener => listener());
        setIsLoading(false);
        return;
      }

      // Sinon, détecter via géolocalisation
      try {
        const geo = await detectGeoLocation();
        setGeoLocation(geo);
        currentCurrency = geo.currency;
        listeners.forEach(listener => listener());
      } catch (error) {
        console.warn('Failed to detect geolocation:', error);
        // Fallback vers la devise par défaut
        currentCurrency = DEFAULT_CURRENCY;
        listeners.forEach(listener => listener());
      } finally {
        setIsLoading(false);
      }
    };

    initCurrency();
  }, []);

  // Mettre à jour la devise et persister le choix
  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setUserPreferences(undefined, newCurrency);
    emitCurrencyChange(newCurrency);
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
