'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { CURRENCIES, type CurrencyCode } from '@/config/currencies';
import { ChevronDown, Search } from 'lucide-react';
import { FlagIcon } from '@/components/ui/flag-icon';

interface CurrencySelectorProps {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  className?: string;
  compact?: boolean;
}

// Groupes de devises pour une meilleure organisation
const CURRENCY_GROUPS: { label: string; labelEn: string; currencies: CurrencyCode[] }[] = [
  {
    label: 'Devises principales',
    labelEn: 'Major currencies',
    currencies: ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD'],
  },
  {
    label: 'Afrique',
    labelEn: 'Africa',
    currencies: ['XOF', 'XAF', 'MAD', 'NGN', 'GHS', 'KES', 'ZAR'],
  },
  {
    label: 'Asie & Moyen-Orient',
    labelEn: 'Asia & Middle East',
    currencies: ['CNY', 'INR', 'SAR', 'AED'],
  },
  {
    label: 'Amérique du Sud',
    labelEn: 'South America',
    currencies: ['BRL'],
  },
];

export function CurrencySelector({ value, onChange, className = '', compact = false }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const locale = useLocale();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.currency-selector')) {
        setIsOpen(false);
        setSearchQuery('');
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

  // Filtrer les devises par recherche
  const filterCurrencies = (currencies: CurrencyCode[]) => {
    if (!searchQuery) return currencies;
    const query = searchQuery.toLowerCase();
    return currencies.filter((code) => {
      const currency = CURRENCIES[code];
      return (
        code.toLowerCase().includes(query) ||
        currency.name.toLowerCase().includes(query) ||
        currency.nameEn.toLowerCase().includes(query) ||
        currency.symbol.toLowerCase().includes(query)
      );
    });
  };

  return (
    <div className={`currency-selector relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors ${
          compact ? 'px-2 py-1.5' : 'px-4 py-2'
        }`}
      >
        <FlagIcon code={selectedCurrency.code} size={compact ? 'sm' : 'md'} />
        <span className="font-medium">{selectedCurrency.code}</span>
        {!compact && <span className="text-muted-foreground">{selectedCurrency.symbol}</span>}
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-50 min-w-[280px] max-h-[400px] bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          {/* Barre de recherche */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={locale === 'fr' ? 'Rechercher une devise...' : 'Search currency...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Liste des devises groupées */}
          <div className="overflow-y-auto max-h-[320px]">
            {CURRENCY_GROUPS.map((group) => {
              const filteredCurrencies = filterCurrencies(group.currencies);
              if (filteredCurrencies.length === 0) return null;

              return (
                <div key={group.label}>
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/30 uppercase tracking-wider">
                    {locale === 'fr' ? group.label : group.labelEn}
                  </div>
                  {filteredCurrencies.map((code) => {
                    const currency = CURRENCIES[code];
                    const isSelected = code === value;

                    return (
                      <button
                        type="button"
                        key={code}
                        onClick={() => {
                          onChange(code);
                          setIsOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors ${
                          isSelected ? 'bg-purple-500/10' : ''
                        }`}
                      >
                        <FlagIcon code={code} size="md" />
                        <div className="flex-1 text-left">
                          <p className="font-medium">{currency.code}</p>
                          <p className="text-xs text-muted-foreground">
                            {locale === 'fr' ? currency.name : currency.nameEn}
                          </p>
                        </div>
                        <span className="text-muted-foreground text-sm">{currency.symbol}</span>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-purple-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
