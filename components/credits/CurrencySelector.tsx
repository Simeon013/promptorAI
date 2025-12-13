'use client';

import { useState, useEffect } from 'react';
import { CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from '@/config/currencies';
import { ChevronDown } from 'lucide-react';

interface CurrencySelectorProps {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  className?: string;
}

export function CurrencySelector({ value, onChange, className = '' }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.currency-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const selectedCurrency = CURRENCIES[value];

  return (
    <div className={`currency-selector relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors"
      >
        <span className="text-xl">{selectedCurrency.flag}</span>
        <span className="font-medium">{selectedCurrency.code}</span>
        <span className="text-muted-foreground">{selectedCurrency.symbol}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-50 min-w-[200px] bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
            const currency = CURRENCIES[code];
            const isSelected = code === value;

            return (
              <button
                key={code}
                onClick={() => {
                  onChange(code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                  isSelected ? 'bg-purple-500/10' : ''
                }`}
              >
                <span className="text-xl">{currency.flag}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium">{currency.code}</p>
                  <p className="text-xs text-muted-foreground">{currency.name}</p>
                </div>
                <span className="text-muted-foreground">{currency.symbol}</span>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-purple-600" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
