# Structure du Projet - Promptor

**Dernière mise à jour:** 15 Novembre 2025  
**Status:** Phase 2 Complétée ✅

---

## Arborescence Complète

```
promptor/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 (auth)/                  
│   │   ├── 📁 sign-in/             
│   │   │   └── 📁 [[...sign-in]]/
│   │   │       └── page.tsx        # Page de connexion Clerk
│   │   └── 📁 sign-up/             
│   │       └── 📁 [[...sign-up]]/
│   │           └── page.tsx        # Page d'inscription Clerk
│   │
│   ├── 📁 (dashboard)/             
│   │   └── 📁 dashboard/
│   │       └── page.tsx            # Dashboard utilisateur (stats, quotas, prompts)
│   │
│   ├── 📁 api/                     
│   │   ├── 📁 auth/
│   │   │   └── 📁 callback/
│   │   │       └── route.ts        # Sync Clerk → Supabase
│   │   ├── 📁 generate/
│   │   │   └── route.ts            # Génération & amélioration de prompts
│   │   └── 📁 suggestions/
│   │       └── route.ts            # Suggestions IA contextuelles
│   │
│   ├── layout.tsx                  # Layout racine avec ClerkProvider
│   ├── page.tsx                    # Page d'accueil (générateur de prompts)
│   └── globals.css                 # Styles Tailwind globaux
│
├── 📁 components/
│   └── 📁 ui/                      # Shadcn/ui Components
│       ├── button.tsx              
│       ├── card.tsx                
│       └── textarea.tsx            
│
├── 📁 lib/
│   ├── 📁 ai/
│   │   └── gemini.ts               # Service Gemini AI (génération, amélioration, suggestions)
│   │
│   ├── 📁 api/
│   │   └── auth-helper.ts          # Helpers auth & quota (verifyAuthAndQuota, useQuota)
│   │
│   ├── 📁 auth/
│   │   └── supabase-clerk.ts       # Auth + quotas Supabase (getOrCreateUser, checkQuota, incrementQuota)
│   │
│   ├── 📁 db/
│   │   └── supabase.ts             # Client Supabase + types TypeScript
│   │
│   └── utils.ts                    # Utilitaires (cn, etc.)
│
├── 📁 config/
│   ├── plans.ts                    # Plans tarifaires (FREE, STARTER, PRO, ENTERPRISE)
│   └── site.ts                     # Configuration du site
│
├── 📁 types/
│   └── index.ts                    # Types TypeScript globaux
│
├── 📁 public/                      # Assets statiques
│
├── middleware.ts                   # Middleware Clerk (protection routes)
│
├── 📄 .env.local                   # Variables d'environnement (Gemini, Clerk, Supabase)
├── 📄 .env.example                 # Template variables d'environnement
│
├── 📄 package.json                 # Dépendances npm
├── 📄 tsconfig.json                # Configuration TypeScript
├── 📄 tailwind.config.ts           # Configuration Tailwind
├── 📄 next.config.ts               # Configuration Next.js
│
└── 📚 Documentation/
    ├── README.md                   # Documentation principale
    ├── CLAUDE.md                   # Instructions Claude Code
    ├── GETTING_STARTED.md          # Guide de démarrage rapide
    ├── MIGRATION.md                # Migration Vite → Next.js
    ├── SUPABASE_QUICK_SETUP.md     # Setup Supabase
    ├── SUPABASE_MIGRATION_COMPLETE.md  # Migration Prisma → Supabase
    ├── CLEANUP_REPORT.md           # Rapport de nettoyage
    └── STRUCTURE.md                # Ce fichier
```

---

## Fichiers Clés par Fonctionnalité

### 🔐 Authentication (Clerk + Supabase)

| Fichier | Description |
|---------|-------------|
| `middleware.ts` | Protection des routes privées |
| `app/(auth)/sign-in/page.tsx` | Page de connexion |
| `app/(auth)/sign-up/page.tsx` | Page d'inscription |
| `app/api/auth/callback/route.ts` | Sync utilisateurs Clerk → Supabase |
| `lib/auth/supabase-clerk.ts` | Helpers auth (getOrCreateUser, checkQuota) |

### 🤖 IA & Génération de Prompts

| Fichier | Description |
|---------|-------------|
| `lib/ai/gemini.ts` | Service Gemini (generatePrompt, improvePrompt, getPromptSuggestions) |
| `app/api/generate/route.ts` | API génération & amélioration |
| `app/api/suggestions/route.ts` | API suggestions contextuelles |

### 💾 Database (Supabase)

| Fichier | Description |
|---------|-------------|
| `lib/db/supabase.ts` | Client Supabase + types |
| `lib/auth/supabase-clerk.ts` | CRUD utilisateurs + quotas |

### 🎨 UI & Pages

| Fichier | Description |
|---------|-------------|
| `app/page.tsx` | Page d'accueil (générateur) |
| `app/(dashboard)/dashboard/page.tsx` | Dashboard utilisateur |
| `app/layout.tsx` | Layout racine avec Clerk |
| `components/ui/*` | Composants Shadcn/ui |

### ⚙️ Configuration

| Fichier | Description |
|---------|-------------|
| `config/plans.ts` | Plans tarifaires SaaS |
| `config/site.ts` | Métadonnées du site |
| `.env.local` | Variables d'environnement |

---

## Stack Technique

**Frontend:**
- Next.js 15 (App Router)
- React 18
- TypeScript (strict mode)
- Tailwind CSS 3
- Shadcn/ui

**Backend:**
- Next.js API Routes
- Supabase (PostgreSQL)
- Clerk (Auth)

**IA:**
- Google Gemini 2.5 Flash

**Déploiement:**
- Vercel (prévu)

---

## Phases de Développement

| Phase | Status | Fonctionnalités |
|-------|--------|-----------------|
| **Phase 1** | ✅ Complété | Next.js setup, Tailwind, API Gemini, UI basique |
| **Phase 2** | ✅ Complété | Clerk auth, Supabase DB, Quotas, Dashboard |
| **Phase 3** | 🔄 Next | Stripe payments, Plans tarifaires |
| **Phase 4** | 🔄 Planned | Historique complet, Favoris, Tags |
| **Phase 5** | 🔄 Planned | Workspaces collaboratifs |
| **Phase 6** | 🔄 Planned | API publique pour développeurs |

---

## Notes Importantes

- ✅ Migration Vite → Next.js 15 complétée
- ✅ Migration Prisma → Supabase complétée
- ✅ RLS désactivé (auth gérée par Clerk)
- ✅ Sync automatique Clerk → Supabase
- ✅ Système de quotas fonctionnel (FREE: 10/month)
- ✅ Codebase nettoyée (~25 fichiers obsolètes supprimés)

---

**Total fichiers actifs:** 25 fichiers TypeScript/TSX  
**Total documentation:** 7 fichiers Markdown  
**Dernière migration:** Nov 15, 2025
