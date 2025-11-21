'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { locales, localeFlags, type Locale } from '@/i18n/config';

export function LanguageSelector() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = () => {
    // Toggle between locales
    const currentIndex = locales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % locales.length;
    const newLocale = locales[nextIndex] ?? 'fr';

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
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLocaleChange}
      className="h-9 px-2 font-medium"
    >
      <span className="mr-1">{localeFlags[locale]}</span>
      <span className="uppercase text-xs">{locale}</span>
    </Button>
  );
}
