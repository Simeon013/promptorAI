import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://promptor.app';

// Base metadata that's common across all locales
const baseMetadata: Partial<Metadata> = {
  authors: [{ name: 'Promptor' }],
  creator: 'Promptor',
  publisher: 'Promptor',
  metadataBase: new URL(siteUrl),
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
};

// Locale-specific content
const seoContent: Record<Locale, {
  title: string;
  description: string;
  keywords: string[];
  ogLocale: string;
}> = {
  fr: {
    title: 'Promptor - Générateur de Prompts IA Optimisés',
    description: 'Transformez vos idées en prompts IA professionnels. Générez et améliorez vos prompts pour ChatGPT, Midjourney, DALL-E et tous les modèles IA. Gratuit pour commencer.',
    keywords: ['promptor', 'générateur de prompts', 'prompts IA', 'ChatGPT', 'Midjourney', 'DALL-E', 'prompt engineering', 'intelligence artificielle'],
    ogLocale: 'fr_FR',
  },
  en: {
    title: 'Promptor - Optimized AI Prompt Generator',
    description: 'Transform your ideas into professional AI prompts. Generate and improve your prompts for ChatGPT, Midjourney, DALL-E and all AI models. Free to start.',
    keywords: ['promptor', 'prompt generator', 'AI prompts', 'ChatGPT', 'Midjourney', 'DALL-E', 'prompt engineering', 'artificial intelligence'],
    ogLocale: 'en_US',
  },
  es: {
    title: 'Promptor - Generador de Prompts IA Optimizados',
    description: 'Transforma tus ideas en prompts de IA profesionales. Genera y mejora tus prompts para ChatGPT, Midjourney, DALL-E y todos los modelos de IA. Gratis para empezar.',
    keywords: ['promptor', 'generador de prompts', 'prompts IA', 'ChatGPT', 'Midjourney', 'DALL-E', 'ingeniería de prompts', 'inteligencia artificial'],
    ogLocale: 'es_ES',
  },
  de: {
    title: 'Promptor - Optimierter KI-Prompt-Generator',
    description: 'Verwandeln Sie Ihre Ideen in professionelle KI-Prompts. Generieren und verbessern Sie Ihre Prompts für ChatGPT, Midjourney, DALL-E und alle KI-Modelle. Kostenlos starten.',
    keywords: ['promptor', 'prompt generator', 'KI prompts', 'ChatGPT', 'Midjourney', 'DALL-E', 'prompt engineering', 'künstliche intelligenz'],
    ogLocale: 'de_DE',
  },
  pt: {
    title: 'Promptor - Gerador de Prompts IA Otimizados',
    description: 'Transforme suas ideias em prompts de IA profissionais. Gere e melhore seus prompts para ChatGPT, Midjourney, DALL-E e todos os modelos de IA. Grátis para começar.',
    keywords: ['promptor', 'gerador de prompts', 'prompts IA', 'ChatGPT', 'Midjourney', 'DALL-E', 'engenharia de prompts', 'inteligência artificial'],
    ogLocale: 'pt_BR',
  },
  ar: {
    title: 'Promptor - مولد برومبتات الذكاء الاصطناعي المحسن',
    description: 'حوّل أفكارك إلى برومبتات ذكاء اصطناعي احترافية. أنشئ وحسّن برومبتاتك لـ ChatGPT و Midjourney و DALL-E وجميع نماذج الذكاء الاصطناعي. ابدأ مجاناً.',
    keywords: ['promptor', 'مولد برومبتات', 'برومبتات الذكاء الاصطناعي', 'ChatGPT', 'Midjourney', 'DALL-E', 'هندسة البرومبتات', 'الذكاء الاصطناعي'],
    ogLocale: 'ar_SA',
  },
  zh: {
    title: 'Promptor - 优化的AI提示词生成器',
    description: '将您的想法转化为专业的AI提示词。为ChatGPT、Midjourney、DALL-E和所有AI模型生成和改进提示词。免费开始。',
    keywords: ['promptor', '提示词生成器', 'AI提示词', 'ChatGPT', 'Midjourney', 'DALL-E', '提示词工程', '人工智能'],
    ogLocale: 'zh_CN',
  },
};

// Generate alternates for all locales
const generateAlternates = (path: string = '') => {
  const languages: Record<string, string> = {};
  Object.keys(seoContent).forEach((locale) => {
    languages[locale] = `${siteUrl}/${locale}${path}`;
  });
  return languages;
};

// Generate metadata for each locale
export const defaultMetadata: Record<Locale, Metadata> = Object.fromEntries(
  Object.entries(seoContent).map(([locale, content]) => [
    locale,
    {
      ...baseMetadata,
      title: {
        default: content.title,
        template: '%s | Promptor',
      },
      description: content.description,
      keywords: content.keywords,
      openGraph: {
        type: 'website',
        locale: content.ogLocale,
        url: `${siteUrl}/${locale}`,
        siteName: 'Promptor',
        title: content.title,
        description: content.description,
        images: [
          {
            url: `${siteUrl}/og-image-${locale}.png`,
            width: 1200,
            height: 630,
            alt: content.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: content.title,
        description: content.description,
        images: [`${siteUrl}/og-image-${locale}.png`],
        creator: '@promptor',
      },
      alternates: {
        canonical: `${siteUrl}/${locale}`,
        languages: generateAlternates(),
      },
    } as Metadata,
  ])
) as Record<Locale, Metadata>;

// Pricing page metadata
const pricingContent: Record<Locale, { title: string; description: string }> = {
  fr: {
    title: 'Tarifs - Plans Starter, Pro et Enterprise',
    description: 'Choisissez le plan Promptor qui correspond à vos besoins. Commencez gratuitement avec 10 prompts/mois.',
  },
  en: {
    title: 'Pricing - Starter, Pro and Enterprise Plans',
    description: 'Choose the Promptor plan that fits your needs. Start free with 10 prompts/month.',
  },
  es: {
    title: 'Precios - Planes Starter, Pro y Enterprise',
    description: 'Elige el plan Promptor que se adapte a tus necesidades. Comienza gratis con 10 prompts/mes.',
  },
  de: {
    title: 'Preise - Starter, Pro und Enterprise Pläne',
    description: 'Wählen Sie den Promptor-Plan, der zu Ihnen passt. Starten Sie kostenlos mit 10 Prompts/Monat.',
  },
  pt: {
    title: 'Preços - Planos Starter, Pro e Enterprise',
    description: 'Escolha o plano Promptor que se adapta às suas necessidades. Comece grátis com 10 prompts/mês.',
  },
  ar: {
    title: 'الأسعار - خطط Starter و Pro و Enterprise',
    description: 'اختر خطة Promptor التي تناسب احتياجاتك. ابدأ مجاناً مع 10 برومبتات/شهر.',
  },
  zh: {
    title: '定价 - Starter、Pro和Enterprise计划',
    description: '选择适合您需求的Promptor计划。每月10个免费提示词起步。',
  },
};

export const pricingMetadata: Record<Locale, Metadata> = Object.fromEntries(
  Object.entries(pricingContent).map(([locale, content]) => [
    locale,
    {
      title: content.title,
      description: content.description,
      openGraph: {
        title: content.title,
        description: content.description,
        url: `${siteUrl}/${locale}/pricing`,
        images: [
          {
            url: `${siteUrl}/og-pricing-${locale}.png`,
            width: 1200,
            height: 630,
            alt: content.title,
          },
        ],
      },
      alternates: {
        canonical: `${siteUrl}/${locale}/pricing`,
        languages: generateAlternates('/pricing'),
      },
    } as Metadata,
  ])
) as Record<Locale, Metadata>;

// Success page metadata
const successContent: Record<Locale, { title: string; description: string }> = {
  fr: {
    title: 'Paiement Réussi - Abonnement Activé',
    description: 'Votre abonnement Promptor a été activé avec succès.',
  },
  en: {
    title: 'Payment Successful - Subscription Activated',
    description: 'Your Promptor subscription has been activated successfully.',
  },
  es: {
    title: 'Pago Exitoso - Suscripción Activada',
    description: 'Tu suscripción a Promptor ha sido activada exitosamente.',
  },
  de: {
    title: 'Zahlung Erfolgreich - Abonnement Aktiviert',
    description: 'Ihr Promptor-Abonnement wurde erfolgreich aktiviert.',
  },
  pt: {
    title: 'Pagamento Bem-sucedido - Assinatura Ativada',
    description: 'Sua assinatura Promptor foi ativada com sucesso.',
  },
  ar: {
    title: 'تم الدفع بنجاح - تم تفعيل الاشتراك',
    description: 'تم تفعيل اشتراكك في Promptor بنجاح.',
  },
  zh: {
    title: '支付成功 - 订阅已激活',
    description: '您的Promptor订阅已成功激活。',
  },
};

export const successMetadata: Record<Locale, Metadata> = Object.fromEntries(
  Object.entries(successContent).map(([locale, content]) => [
    locale,
    {
      title: content.title,
      description: content.description,
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        title: content.title,
        description: content.description,
        url: `${siteUrl}/${locale}/success`,
      },
      alternates: {
        canonical: `${siteUrl}/${locale}/success`,
        languages: generateAlternates('/success'),
      },
    } as Metadata,
  ])
) as Record<Locale, Metadata>;
