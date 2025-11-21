import { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://promptor.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/pricing'];
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate entries for each route and each locale
  routes.forEach((route) => {
    locales.forEach((locale) => {
      const url = `${siteUrl}/${locale}${route}`;

      // Create alternate language links
      const alternates = {
        languages: {} as Record<string, string>,
      };

      locales.forEach((altLocale) => {
        const altUrl = `${siteUrl}/${altLocale}${route}`;
        alternates.languages[altLocale] = altUrl;
      });

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : 0.8,
        alternates,
      });
    });
  });

  return sitemapEntries;
}
