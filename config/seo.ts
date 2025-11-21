import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://promptor.app';

export const defaultMetadata: Record<Locale, Metadata> = {
  fr: {
    title: {
      default: 'Promptor - Générateur de Prompts IA Optimisés',
      template: '%s | Promptor',
    },
    description:
      'Transformez vos idées en prompts IA professionnels. Générez et améliorez vos prompts pour ChatGPT, Midjourney, DALL-E et tous les modèles IA. Gratuit pour commencer.',
    keywords: [
      'promptor',
      'générateur de prompts',
      'prompts IA',
      'ChatGPT',
      'Midjourney',
      'DALL-E',
      'prompt engineering',
      'intelligence artificielle',
      'génération de texte',
      'optimisation de prompts',
    ],
    authors: [{ name: 'Promptor' }],
    creator: 'Promptor',
    publisher: 'Promptor',
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      url: siteUrl,
      siteName: 'Promptor',
      title: 'Promptor - Générateur de Prompts IA Optimisés',
      description:
        'Transformez vos idées en prompts IA professionnels. Générez et améliorez vos prompts pour ChatGPT, Midjourney, DALL-E et tous les modèles IA.',
      images: [
        {
          url: `${siteUrl}/og-image-fr.png`,
          width: 1200,
          height: 630,
          alt: 'Promptor - Générateur de Prompts IA',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Promptor - Générateur de Prompts IA Optimisés',
      description:
        'Transformez vos idées en prompts IA professionnels. Générez et améliorez vos prompts pour ChatGPT, Midjourney, DALL-E et tous les modèles IA.',
      images: [`${siteUrl}/og-image-fr.png`],
      creator: '@promptor',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `${siteUrl}/fr`,
      languages: {
        'fr-FR': `${siteUrl}/fr`,
        'en-US': `${siteUrl}/en`,
      },
    },
  },
  en: {
    title: {
      default: 'Promptor - Optimized AI Prompt Generator',
      template: '%s | Promptor',
    },
    description:
      'Transform your ideas into professional AI prompts. Generate and improve your prompts for ChatGPT, Midjourney, DALL-E and all AI models. Free to start.',
    keywords: [
      'promptor',
      'prompt generator',
      'AI prompts',
      'ChatGPT',
      'Midjourney',
      'DALL-E',
      'prompt engineering',
      'artificial intelligence',
      'text generation',
      'prompt optimization',
    ],
    authors: [{ name: 'Promptor' }],
    creator: 'Promptor',
    publisher: 'Promptor',
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: 'Promptor',
      title: 'Promptor - Optimized AI Prompt Generator',
      description:
        'Transform your ideas into professional AI prompts. Generate and improve your prompts for ChatGPT, Midjourney, DALL-E and all AI models.',
      images: [
        {
          url: `${siteUrl}/og-image-en.png`,
          width: 1200,
          height: 630,
          alt: 'Promptor - AI Prompt Generator',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Promptor - Optimized AI Prompt Generator',
      description:
        'Transform your ideas into professional AI prompts. Generate and improve your prompts for ChatGPT, Midjourney, DALL-E and all AI models.',
      images: [`${siteUrl}/og-image-en.png`],
      creator: '@promptor',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `${siteUrl}/en`,
      languages: {
        'fr-FR': `${siteUrl}/fr`,
        'en-US': `${siteUrl}/en`,
      },
    },
  },
};

export const pricingMetadata: Record<Locale, Metadata> = {
  fr: {
    title: 'Tarifs - Plans Starter, Pro et Enterprise',
    description:
      'Choisissez le plan Promptor qui correspond à vos besoins. Commencez gratuitement avec 10 prompts/mois. Plans Starter (9€), Pro (29€) et Enterprise disponibles.',
    openGraph: {
      title: 'Tarifs Promptor - Plans Starter, Pro et Enterprise',
      description:
        'Choisissez le plan qui correspond à vos besoins. Commencez gratuitement avec 10 prompts/mois.',
      url: `${siteUrl}/fr/pricing`,
      images: [
        {
          url: `${siteUrl}/og-pricing-fr.png`,
          width: 1200,
          height: 630,
          alt: 'Tarifs Promptor',
        },
      ],
    },
    alternates: {
      canonical: `${siteUrl}/fr/pricing`,
      languages: {
        'fr-FR': `${siteUrl}/fr/pricing`,
        'en-US': `${siteUrl}/en/pricing`,
      },
    },
  },
  en: {
    title: 'Pricing - Starter, Pro and Enterprise Plans',
    description:
      'Choose the Promptor plan that fits your needs. Start free with 10 prompts/month. Starter ($9), Pro ($29) and Enterprise plans available.',
    openGraph: {
      title: 'Promptor Pricing - Starter, Pro and Enterprise Plans',
      description:
        'Choose the plan that fits your needs. Start free with 10 prompts/month.',
      url: `${siteUrl}/en/pricing`,
      images: [
        {
          url: `${siteUrl}/og-pricing-en.png`,
          width: 1200,
          height: 630,
          alt: 'Promptor Pricing',
        },
      ],
    },
    alternates: {
      canonical: `${siteUrl}/en/pricing`,
      languages: {
        'fr-FR': `${siteUrl}/fr/pricing`,
        'en-US': `${siteUrl}/en/pricing`,
      },
    },
  },
};

export const successMetadata: Record<Locale, Metadata> = {
  fr: {
    title: 'Paiement Réussi - Abonnement Activé',
    description: 'Votre abonnement Promptor a été activé avec succès. Profitez de toutes les fonctionnalités de votre plan.',
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: 'Paiement Réussi - Promptor',
      description: 'Votre abonnement a été activé avec succès.',
      url: `${siteUrl}/fr/success`,
    },
    alternates: {
      canonical: `${siteUrl}/fr/success`,
      languages: {
        'fr-FR': `${siteUrl}/fr/success`,
        'en-US': `${siteUrl}/en/success`,
      },
    },
  },
  en: {
    title: 'Payment Successful - Subscription Activated',
    description: 'Your Promptor subscription has been activated successfully. Enjoy all the features of your plan.',
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: 'Payment Successful - Promptor',
      description: 'Your subscription has been activated successfully.',
      url: `${siteUrl}/en/success`,
    },
    alternates: {
      canonical: `${siteUrl}/en/success`,
      languages: {
        'fr-FR': `${siteUrl}/fr/success`,
        'en-US': `${siteUrl}/en/success`,
      },
    },
  },
};
