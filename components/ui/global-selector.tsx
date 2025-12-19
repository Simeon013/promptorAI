'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { CURRENCIES, type CurrencyCode } from '@/config/currencies';
import { useCurrency } from '@/hooks/useCurrency';
import { FlagIcon } from '@/components/ui/flag-icon';
import { Globe, ChevronDown, Check, Languages, Coins, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'language' | 'currency';

interface GlobalSelectorProps {
  className?: string;
  compact?: boolean;
}

// Groupes de devises pour une meilleure organisation
const CURRENCY_GROUPS: { id: string; labelKey: string; currencies: CurrencyCode[] }[] = [
  {
    id: 'major',
    labelKey: 'majorCurrencies',
    currencies: ['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD'],
  },
  {
    id: 'africa',
    labelKey: 'africa',
    currencies: ['XOF', 'XAF', 'MAD', 'NGN', 'GHS', 'KES', 'ZAR'],
  },
  {
    id: 'asia',
    labelKey: 'asiaMiddleEast',
    currencies: ['CNY', 'INR', 'SAR', 'AED'],
  },
  {
    id: 'southAmerica',
    labelKey: 'southAmerica',
    currencies: ['BRL'],
  },
];

export function GlobalSelector({ className = '', compact = false }: GlobalSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('language');
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { currency, setCurrency, isLoading: currencyLoading } = useCurrency();
  const t = useTranslations('globalSelector');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle locale change
  const handleLocaleChange = (newLocale: Locale) => {
    const segments = pathname.split('/');
    const firstSegment = segments[1];
    const currentLocaleIndex = firstSegment ? locales.indexOf(firstSegment as Locale) : -1;

    let newPath: string;
    if (currentLocaleIndex !== -1 && segments.length > 1) {
      const newSegments = [segments[0], newLocale, ...segments.slice(2)];
      newPath = newSegments.join('/');
    } else {
      newPath = `/${newLocale}${pathname}`;
    }

    router.push(newPath);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Filter languages by search
  const filteredLocales = locales.filter((loc) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      loc.toLowerCase().includes(query) ||
      localeNames[loc].toLowerCase().includes(query)
    );
  });

  // Filter currencies by search
  const filterCurrencies = (currencies: CurrencyCode[]) => {
    if (!searchQuery) return currencies;
    const query = searchQuery.toLowerCase();
    return currencies.filter((code) => {
      const curr = CURRENCIES[code];
      return (
        code.toLowerCase().includes(query) ||
        curr.name.toLowerCase().includes(query) ||
        curr.nameEn.toLowerCase().includes(query) ||
        curr.symbol.toLowerCase().includes(query)
      );
    });
  };

  const selectedCurrency = CURRENCIES[currency];

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group flex items-center gap-2 rounded-xl border border-border/50
          bg-background/80 backdrop-blur-sm
          hover:bg-muted/50 hover:border-purple-500/30
          transition-all duration-200
          ${compact ? 'px-2.5 py-1.5' : 'px-3 py-2'}
          ${isOpen ? 'border-purple-500/50 shadow-lg shadow-purple-500/10' : ''}
        `}
      >
        <div className="flex items-center gap-1.5">
          <FlagIcon code={locale} size="sm" />
          <span className="text-xs font-medium text-muted-foreground">/</span>
          <span className="text-sm font-semibold text-foreground min-w-[28px]">
            {selectedCurrency.symbol}
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 right-0 z-50 min-w-[320px] bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
          >
            {/* Header with tabs */}
            <div className="border-b border-border/50">
              <div className="flex p-1.5 gap-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab('language'); setSearchQuery(''); }}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                    text-sm font-medium transition-all duration-200
                    ${activeTab === 'language'
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  <Languages className="h-4 w-4" />
                  {t('language')}
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('currency'); setSearchQuery(''); }}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                    text-sm font-medium transition-all duration-200
                    ${activeTab === 'currency'
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  <Coins className="h-4 w-4" />
                  {t('currency')}
                </button>
              </div>
            </div>

            {/* Search bar (only for currency) */}
            {activeTab === 'currency' && (
              <div className="p-3 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('searchCurrency')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <div className="max-h-[360px] overflow-y-auto">
              {/* Language Tab */}
              {activeTab === 'language' && (
                <div className="p-2">
                  <div className="grid grid-cols-1 gap-1">
                    {filteredLocales.map((loc) => {
                      const isSelected = loc === locale;
                      return (
                        <button
                          type="button"
                          key={loc}
                          onClick={() => handleLocaleChange(loc)}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl
                            transition-all duration-200
                            ${isSelected
                              ? 'bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/30'
                              : 'hover:bg-muted/50'
                            }
                          `}
                        >
                          <FlagIcon code={loc} size="md" />
                          <span className={`flex-1 text-left font-medium ${isSelected ? 'text-purple-600 dark:text-purple-400' : ''}`}>
                            {localeNames[loc]}
                          </span>
                          {isSelected && (
                            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Currency Tab */}
              {activeTab === 'currency' && (
                <div className="p-2">
                  {CURRENCY_GROUPS.map((group) => {
                    const filteredCurrencies = filterCurrencies(group.currencies);
                    if (filteredCurrencies.length === 0) return null;

                    return (
                      <div key={group.id} className="mb-2 last:mb-0">
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t(`currencyGroups.${group.labelKey}`)}
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          {filteredCurrencies.map((code) => {
                            const curr = CURRENCIES[code];
                            const isSelected = code === currency;

                            return (
                              <button
                                type="button"
                                key={code}
                                onClick={() => handleCurrencyChange(code)}
                                className={`
                                  flex items-center gap-3 px-4 py-3 rounded-xl
                                  transition-all duration-200
                                  ${isSelected
                                    ? 'bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/30'
                                    : 'hover:bg-muted/50'
                                  }
                                `}
                              >
                                <FlagIcon code={code} size="md" />
                                <div className="flex-1 text-left">
                                  <div className={`font-medium ${isSelected ? 'text-purple-600 dark:text-purple-400' : ''}`}>
                                    {curr.code}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {locale === 'fr' ? curr.name : curr.nameEn}
                                  </div>
                                </div>
                                <span className="text-sm text-muted-foreground font-mono">
                                  {curr.symbol}
                                </span>
                                {isSelected && (
                                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with current selection */}
            <div className="border-t border-border/50 p-3 bg-muted/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{t('currentSettings')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{localeNames[locale]}</span>
                  <span>•</span>
                  <span className="font-medium text-foreground">{selectedCurrency.code}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
