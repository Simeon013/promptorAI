# Déploiement SEO - Guide Complet

Ce document explique comment déployer Promptor avec une configuration SEO optimale.

## 📋 Prérequis

### 1. Variables d'Environnement

Ajouter dans votre environnement de production (Vercel, Netlify, etc.) :

```env
NEXT_PUBLIC_SITE_URL=https://promptor.app
```

**Important** : Remplacez `https://promptor.app` par votre nom de domaine réel.

### 2. Images Open Graph

Créer les images suivantes dans `/public/` :

- `og-image-fr.png` (1200x630px) - Image OG pour la version française
- `og-image-en.png` (1200x630px) - Image OG pour la version anglaise
- `og-pricing-fr.png` (1200x630px) - Image OG pour /fr/pricing
- `og-pricing-en.png` (1200x630px) - Image OG pour /en/pricing

**Recommandations** :
- Format: PNG ou JPEG
- Taille: 1200x630px (ratio 1.91:1)
- Poids: < 300KB
- Contenu: Logo + Titre + Description courte

## 🔍 Configuration SEO Actuelle

### Pages Internationalisées

Toutes les pages sous `app/[locale]/` ont des métadonnées SEO complètes :

#### Page d'Accueil (`/fr` et `/en`)
- **Title**: "Promptor - Générateur de Prompts IA Optimisés" (FR) / "Promptor - Optimized AI Prompt Generator" (EN)
- **Description**: Transformez vos idées en prompts IA professionnels
- **Keywords**: promptor, générateur de prompts, ChatGPT, Midjourney, DALL-E, etc.
- **Open Graph**: Images, titre, description
- **Twitter Cards**: Large image summary
- **Robots**: index, follow
- **Alternate**: hreflang FR/EN

#### Page Pricing (`/fr/pricing` et `/en/pricing`)
- **Title**: "Tarifs - Plans Starter, Pro et Enterprise" (FR) / "Pricing - Starter, Pro and Enterprise Plans" (EN)
- **Description**: Plans tarifaires avec détails
- **Open Graph**: Images spécifiques pricing
- **Robots**: index, follow
- **Alternate**: hreflang FR/EN

#### Page Success (`/fr/success` et `/en/success`)
- **Title**: "Paiement Réussi - Abonnement Activé" (FR) / "Payment Successful - Subscription Activated" (EN)
- **Robots**: **noindex, nofollow** (page privée)
- **Open Graph**: Désactivé (pas de partage social souhaité)

### Pages Non-Internationalisées

Ces pages utilisent les métadonnées par défaut de Next.js :

- `/dashboard` - Dashboard utilisateur (privé)
- `/editor` - Éditeur de prompts (privé)
- `/sign-in` - Connexion (public mais noindex)
- `/sign-up` - Inscription (public mais noindex)

## 🌍 Internationalisation (i18n)

### Routes Localisées

- **Français (défaut)**: `/fr/*`
- **Anglais**: `/en/*`

### Redirections Automatiques

- `/` → `/fr` (locale par défaut)
- `/pricing` → `/fr/pricing`
- `/success` → `/fr/success`

### Middleware i18n

Le middleware ([middleware.ts](middleware.ts)) gère :
- Redirection vers la locale appropriée
- Exclusion des routes non-internationalisées (`/dashboard`, `/editor`, etc.)
- Protection des routes privées avec Clerk

## 📊 Google Search Console

### 1. Ajouter les Propriétés

Ajouter **deux propriétés** dans Google Search Console :
- `https://promptor.app` (propriété de domaine)
- `https://www.promptor.app` (si vous utilisez www)

### 2. Soumettre le Sitemap

Créer un sitemap.xml (à implémenter) avec toutes les routes localisées :

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Page d'accueil FR -->
  <url>
    <loc>https://promptor.app/fr</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://promptor.app/en" />
    <xhtml:link rel="alternate" hreflang="fr" href="https://promptor.app/fr" />
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Page d'accueil EN -->
  <url>
    <loc>https://promptor.app/en</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://promptor.app/en" />
    <xhtml:link rel="alternate" hreflang="fr" href="https://promptor.app/fr" />
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Pricing FR -->
  <url>
    <loc>https://promptor.app/fr/pricing</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://promptor.app/en/pricing" />
    <xhtml:link rel="alternate" hreflang="fr" href="https://promptor.app/fr/pricing" />
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Pricing EN -->
  <url>
    <loc>https://promptor.app/en/pricing</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://promptor.app/en/pricing" />
    <xhtml:link rel="alternate" hreflang="fr" href="https://promptor.app/fr/pricing" />
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

</urlset>
```

## 🔐 robots.txt

Créer `/public/robots.txt` :

```txt
# Allow all bots
User-agent: *
Allow: /

# Disallow private pages
Disallow: /dashboard
Disallow: /editor
Disallow: /sign-in
Disallow: /sign-up
Disallow: /api/

# Allow public localized pages
Allow: /fr
Allow: /en
Allow: /fr/pricing
Allow: /en/pricing

# Sitemap
Sitemap: https://promptor.app/sitemap.xml
```

## 🚀 Checklist de Déploiement

### Avant le Déploiement

- [ ] Créer les 4 images Open Graph (1200x630px)
- [ ] Configurer `NEXT_PUBLIC_SITE_URL` en production
- [ ] Vérifier les traductions FR/EN dans `messages/`
- [ ] Tester les redirections locales en local
- [ ] Créer robots.txt
- [ ] Générer sitemap.xml

### Après le Déploiement

- [ ] Vérifier les métadonnées avec [metatags.io](https://metatags.io/)
- [ ] Tester les Open Graph avec [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Tester les Twitter Cards avec [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [ ] Soumettre le sitemap à Google Search Console
- [ ] Vérifier l'indexation dans Google Search Console (7-14 jours)
- [ ] Tester les hreflang avec [hreflang Tags Testing Tool](https://technicalseo.com/tools/hreflang/)

### Performance & Monitoring

- [ ] Lighthouse score > 90 (Performance, SEO, Accessibility)
- [ ] Core Web Vitals (LCP, FID, CLS) dans le vert
- [ ] Configurer Google Analytics (optionnel)
- [ ] Configurer Sentry pour error tracking (optionnel)

## 📝 Modification des Métadonnées

Les métadonnées sont centralisées dans [config/seo.ts](config/seo.ts).

Pour modifier :

```typescript
// config/seo.ts
export const defaultMetadata: Record<Locale, Metadata> = {
  fr: {
    title: 'Nouveau titre',
    description: 'Nouvelle description',
    // ...
  },
  en: {
    title: 'New title',
    description: 'New description',
    // ...
  },
};
```

## 🔗 Liens Utiles

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Google Search Central](https://developers.google.com/search)
- [hreflang Guide](https://developers.google.com/search/docs/specialty/international/localized-versions)

---

**Auteur**: Claude Code
**Dernière mise à jour**: 22 Novembre 2025
