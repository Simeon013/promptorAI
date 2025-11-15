# 📦 Migration Vite → Next.js 15 - Guide Complet

## ✅ Phase 1 : TERMINÉE

### Ce qui a été migré

#### 1. Infrastructure
- ✅ **Vite** → **Next.js 15** avec App Router
- ✅ **TypeScript** configuré en mode strict
- ✅ **Tailwind CSS** + **Shadcn/ui** pour le design system
- ✅ **Turbopack** pour le dev server ultra-rapide

#### 2. Structure du Projet

**Avant (Vite):**
```
├── index.html
├── index.tsx
├── App.tsx
├── components/
├── services/
└── types.ts
```

**Après (Next.js):**
```
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Page d'accueil
│   ├── globals.css         # Styles globaux
│   └── api/                # API Routes
│       ├── generate/
│       └── suggestions/
├── components/
│   └── ui/                 # Shadcn/ui components
├── lib/
│   ├── ai/                 # Services IA (Gemini)
│   ├── db/                 # Prisma + schema
│   └── utils.ts            # Utilitaires
├── types/
├── config/
└── hooks/
```

#### 3. Fichiers Créés

**Configuration:**
- `next.config.ts` - Configuration Next.js
- `tailwind.config.ts` - Configuration Tailwind
- `postcss.config.mjs` - PostCSS config
- `tsconfig.json` - TypeScript strict mode
- `.env.example` - Template variables d'environnement

**Components UI (Shadcn/ui):**
- `components/ui/button.tsx`
- `components/ui/textarea.tsx`
- `components/ui/card.tsx`

**Services:**
- `lib/ai/gemini.ts` - Service Gemini migré
- `lib/db/schema.prisma` - Schéma base de données complet
- `lib/db/prisma.ts` - Client Prisma

**API Routes:**
- `app/api/generate/route.ts` - Génération/Amélioration de prompts
- `app/api/suggestions/route.ts` - Suggestions intelligentes

**Configuration:**
- `config/site.ts` - Configuration du site
- `config/plans.ts` - Plans d'abonnement (Free, Starter, Pro, Enterprise)

**Types:**
- `types/index.ts` - Types étendus (User, Prompt, Plan, etc.)

#### 4. Changements Majeurs

**Architecture Client/Server:**
```typescript
// AVANT (Vite) - Tout côté client
import { generatePrompt } from './services/geminiService';
await generatePrompt(input, constraints, language);

// APRÈS (Next.js) - API Routes
const response = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ mode, input, constraints, language })
});
```

**Avantages:**
- ✅ API Key sécurisée (jamais exposée au client)
- ✅ Rate limiting possible
- ✅ Logs serveur
- ✅ Meilleure scalabilité

---

## 🎯 Prochaines Étapes

### Phase 2 : Authentification & Base de Données (1-2 semaines)

**1. Setup Clerk**
```bash
npm install @clerk/nextjs
```

Créer:
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- `middleware.ts` pour protéger les routes

**2. Configuration PostgreSQL**
```bash
# Via Supabase (recommandé)
DATABASE_URL="postgresql://..."

# Initialiser Prisma
npm run db:push
npm run db:studio
```

**3. Migration localStorage → Database**
- Créer table `prompts` avec userId
- Implémenter hooks:
  - `hooks/use-prompts.ts` avec React Query
  - `hooks/use-quota.ts` pour tracking
- Migrer historique existant

**4. Système de Quotas**
- Middleware pour vérifier quotas
- Réinitialisation automatique (cron job)
- Analytics d'utilisation

### Phase 3 : Paiements Stripe (1 semaine)

**1. Setup Stripe**
```bash
npm install stripe @stripe/stripe-js
```

**2. Créer:**
- `lib/stripe/client.ts` - Client Stripe
- `lib/stripe/webhooks.ts` - Gestion webhooks
- `app/api/webhooks/stripe/route.ts` - Endpoint webhooks
- `app/(marketing)/pricing/page.tsx` - Page pricing

**3. Implémenter:**
- Checkout sessions
- Customer portal
- Webhooks (subscription.created, updated, deleted)
- Mise à jour du plan utilisateur

### Phase 4 : Dashboard (1-2 semaines)

**1. Routes Dashboard**
```
app/(dashboard)/
├── dashboard/
│   ├── page.tsx              # Overview
│   ├── history/page.tsx      # Historique prompts
│   ├── templates/page.tsx    # Templates sauvegardés
│   └── settings/
│       ├── page.tsx          # Profil
│       ├── billing/page.tsx  # Facturation
│       └── api-keys/page.tsx # Clés API
```

**2. Components:**
- `components/dashboard/stats-cards.tsx` - Statistiques
- `components/dashboard/recent-prompts.tsx` - Prompts récents
- `components/dashboard/usage-chart.tsx` - Graphique usage
- `components/dashboard/api-key-generator.tsx` - Générateur de clés

**3. Features:**
- Analytics temps réel
- Export de données (JSON, CSV)
- Gestion du compte
- Génération de clés API

### Phase 5 : Workspaces & Collaboration (2 semaines)

**1. Routes Workspace**
```
app/(dashboard)/workspace/
└── [slug]/
    ├── page.tsx
    ├── members/page.tsx
    ├── settings/page.tsx
    └── prompts/page.tsx
```

**2. Features:**
- Création de workspaces
- Invitations par email
- Permissions (RBAC): Owner, Admin, Member
- Partage de prompts
- Activité en temps réel (Supabase Realtime)

### Phase 6 : API Publique (1-2 semaines)

**1. Créer:**
- `app/api/v1/prompts/generate/route.ts`
- `app/api/v1/prompts/improve/route.ts`
- Middleware d'authentification API key
- Rate limiting (Upstash Redis)

**2. Documentation:**
- OpenAPI spec
- Exemples de code (curl, JavaScript, Python)
- SDKs (optionnel)

---

## 🛠️ Scripts de Migration

### Nettoyer l'ancien code Vite
```bash
# Sauvegarder d'abord
mkdir -p .backup/vite-old
mv index.html index.tsx vite.config.ts .backup/vite-old/

# Supprimer node_modules Vite
rm -rf node_modules/.vite
```

### Tester la migration
```bash
# Installer les dépendances
npm install

# Lancer le dev server
npm run dev

# Build production
npm run build

# Tester le build
npm start
```

### Setup base de données
```bash
# Créer la DB (Supabase recommandé)
# Puis:
npm run db:push
npm run db:studio
```

---

## 📝 Checklist de Déploiement

### Avant de déployer sur Vercel

- [ ] Tester en local avec `npm run build && npm start`
- [ ] Configurer toutes les variables d'environnement
- [ ] Vérifier que la DB est accessible
- [ ] Tester les webhooks Stripe (ngrok ou tunnel)
- [ ] Configurer les domaines custom
- [ ] Setup monitoring (Sentry)
- [ ] Analytics (PostHog ou Vercel Analytics)

### Variables d'environnement Vercel

```env
# Database
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Gemini
GEMINI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=https://promptor.app
```

---

## 🐛 Problèmes Connus & Solutions

### Erreur: ENOENT app-build-manifest.json
**Solution:** Nettoyer le cache
```bash
rm -rf .next
npm run dev
```

### Process.env undefined côté client
**Solution:** Utiliser API routes pour les appels Gemini
```typescript
// ❌ Mauvais
'use client'
import { generatePrompt } from '@/lib/ai/gemini'

// ✅ Bon
const res = await fetch('/api/generate', { ... })
```

### Erreur de TypeScript strict
**Solution:** Ajouter les types manquants
```typescript
// tsconfig.json
"strict": true,
"noUncheckedIndexedAccess": true
```

---

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Auth](https://clerk.com/docs)
- [Stripe Integration](https://stripe.com/docs/payments/checkout)
- [Shadcn/ui](https://ui.shadcn.com)
- [Vercel Deployment](https://vercel.com/docs)

---

## ✅ Migration Status

- [x] Phase 1: Next.js Setup & Migration
- [ ] Phase 2: Auth & Database
- [ ] Phase 3: Paiements Stripe
- [ ] Phase 4: Dashboard
- [ ] Phase 5: Workspaces
- [ ] Phase 6: API Publique
- [ ] Phase 7: Polish & Launch

**Dernière mise à jour:** 15 Novembre 2025
