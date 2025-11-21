import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { pricingMetadata } from '@/config/seo';
import { PricingContent } from './PricingContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pricingMetadata[locale as Locale] || pricingMetadata.fr;
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PricingContent />;
}
