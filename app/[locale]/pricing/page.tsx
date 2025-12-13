import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PricingContent } from './PricingContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PricingContent />
      </main>
      <Footer />
    </div>
  );
}
