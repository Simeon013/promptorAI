import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import CheckoutContent from './CheckoutContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === 'fr' ? 'Finaliser l\'achat - Promptor' : 'Complete Purchase - Promptor',
    description: locale === 'fr'
      ? 'Finalisez votre achat de crédits et commencez à utiliser Promptor'
      : 'Complete your credit purchase and start using Promptor',
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CheckoutContent />;
}
