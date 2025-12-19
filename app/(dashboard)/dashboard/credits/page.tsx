import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { defaultLocale } from '@/i18n/config';

export default async function CreditsDashboardPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';

  let locale = defaultLocale;
  if (acceptLanguage.includes('fr')) locale = 'fr';
  else if (acceptLanguage.includes('es')) locale = 'es';
  else if (acceptLanguage.includes('de')) locale = 'de';
  else if (acceptLanguage.includes('pt')) locale = 'pt';
  else if (acceptLanguage.includes('ar')) locale = 'ar';
  else if (acceptLanguage.includes('zh')) locale = 'zh';

  redirect(`/${locale}/dashboard/credits`);
}
