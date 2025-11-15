export const siteConfig = {
  name: 'Promptor',
  description:
    'Créez et améliorez vos prompts pour l\'IA avec Promptor. Générez des prompts optimisés pour tous vos besoins.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/og-image.png',
  links: {
    twitter: 'https://twitter.com/promptor',
    github: 'https://github.com/promptor',
  },
};

export type SiteConfig = typeof siteConfig;
