'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { ChevronDown, Check } from 'lucide-react';
import { FlagIcon } from '@/components/ui/flag-icon';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export function LanguageSelector({ compact = false, className = '' }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.language-selector')) {
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

  const handleLocaleChange = (newLocale: Locale) => {
    // Remove current locale from pathname if present
    const segments = pathname.split('/');
    const firstSegment = segments[1];
    const currentLocaleIndex = firstSegment ? locales.indexOf(firstSegment as Locale) : -1;

    let newPath: string;
    if (currentLocaleIndex !== -1 && segments.length > 1) {
      // Replace the locale segment
      const newSegments = [segments[0], newLocale, ...segments.slice(2)];
      newPath = newSegments.join('/');
    } else {
      // Add locale to the beginning
      newPath = `/${newLocale}${pathname}`;
    }

    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className={`language-selector relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors ${
          compact ? 'px-2 py-1.5' : 'px-3 py-2'
        }`}
      >
        <FlagIcon code={locale} size={compact ? 'sm' : 'md'} />
        {!compact && <span className="font-medium text-sm">{localeNames[locale]}</span>}
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-50 min-w-[180px] bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          {locales.map((loc) => {
            const isSelected = loc === locale;

            return (
              <button
                type="button"
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors ${
                  isSelected ? 'bg-purple-500/10' : ''
                }`}
              >
                <FlagIcon code={loc} size="md" />
                <span className="flex-1 text-left font-medium">{localeNames[loc]}</span>
                {isSelected && (
                  <Check className="h-4 w-4 text-purple-600" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
