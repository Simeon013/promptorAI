import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { successMetadata } from '@/config/seo';
import { SuccessContent } from './SuccessContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return successMetadata[locale as Locale] || successMetadata.fr;
}

export default async function SuccessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SuccessContent />;
}
