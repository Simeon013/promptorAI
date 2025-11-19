# 🚀 Promptor - SaaS de Génération et Amélioration de Prompts IA

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-3EC486?style=for-the-badge&logo=supabase&logoColor=white)

**Créez et améliorez vos prompts pour l'IA avec Promptor**

[Démo](https://promptor.vercel.app) · [Documentation](#-documentation) · [Contribuer](#-contribuer)

</div>

---

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Stack Technique](#-stack-technique)
- [Démarrage Rapide](#-démarrage-rapide)
- [Architecture](#-architecture)
- [Fonctionnalités](#-fonctionnalités)
- [Plans d'Abonnement](#-plans-dabonnement)
- [Documentation](#-documentation)
- [Scripts Disponibles](#-scripts-disponibles)
- [Contribuer](#-contribuer)

---

## 🎯 À Propos

**Promptor** est une application SaaS moderne pour générer et améliorer des prompts destinés aux modèles d'IA. L'application offre :

- ✨ **Génération** - Créez des prompts détaillés à partir d'idées simples
- 🔧 **Amélioration** - Optimisez vos prompts existants
- 💡 **Suggestions** - Obtenez des mots-clés intelligents par catégories
- 📊 **Dashboard** - Suivez vos statistiques et quotas
- 🔒 **Auth** - Authentification sécurisée avec Clerk
- 💳 **SaaS Ready** - Système d'abonnements intégré (Free, Starter, Pro, Enterprise)

---

## 🛠️ Stack Technique

### Frontend
- **Next.js 15** - App Router, Server Components, API Routes
- **React 18** - Bibliothèque UI
- **TypeScript** - Type safety strict
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/ui** - Composants UI modernes

### Backend
- **Next.js API Routes** - API serverless
- **Supabase** - PostgreSQL + Authentication
- **Clerk** - Gestion de l'authentification
- **Gemini AI** - Génération de prompts (gemini-2.5-flash)

### Déploiement
- **Vercel** - Hébergement (prévu)
- **Supabase** - Database hosting

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- npm ou pnpm
- Compte Supabase ([créer gratuitement](https://supabase.com))
- Clé API Gemini ([obtenir ici](https://aistudio.google.com/app/apikey))
- Compte Clerk ([créer gratuitement](https://clerk.com))

### Installation

1. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-username/promptor.git
   cd promptor
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env.local
   ```

   Remplissez `.env.local` avec vos clés :
   ```env
   # Gemini API
   GEMINI_API_KEY=votre_clé_gemini

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key

   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Stripe (optionnel - Phase 3)
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   ```

4. **Configurer Supabase**

   Créez les tables dans votre projet Supabase (voir [SUPABASE_QUICK_SETUP.md](SUPABASE_QUICK_SETUP.md)) :

   ```sql
   -- Table users
   CREATE TABLE users (
     id TEXT PRIMARY KEY,
     email TEXT NOT NULL,
     name TEXT,
     avatar TEXT,
     plan TEXT NOT NULL DEFAULT 'FREE',
     quota_used INTEGER NOT NULL DEFAULT 0,
     quota_limit INTEGER NOT NULL DEFAULT 10,
     stripe_id TEXT,
     subscription_id TEXT,
     reset_date TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Table prompts
   CREATE TABLE prompts (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id TEXT NOT NULL REFERENCES users(id),
     type TEXT NOT NULL,
     input TEXT NOT NULL,
     output TEXT NOT NULL,
     constraints TEXT,
     language TEXT,
     model TEXT NOT NULL,
     tokens INTEGER,
     favorited BOOLEAN DEFAULT FALSE,
     tags TEXT[] DEFAULT '{}',
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Ouvrir dans le navigateur**

   Allez sur [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture

```
promptor/
├── app/                           # Next.js App Router
│   ├── (auth)/
│   │   ├── sign-in/              # Page de connexion Clerk
│   │   └── sign-up/              # Page d'inscription Clerk
│   ├── (dashboard)/
│   │   └── dashboard/            # Dashboard utilisateur
│   ├── api/
│   │   ├── auth/callback/        # Sync Clerk → Supabase
│   │   ├── generate/             # Génération & amélioration
│   │   └── suggestions/          # Suggestions IA
│   ├── layout.tsx                # Layout racine + ClerkProvider
│   ├── page.tsx                  # Page d'accueil
│   └── globals.css               # Styles Tailwind
│
├── components/ui/                # Shadcn/ui components
│
├── lib/
│   ├── ai/gemini.ts              # Service Gemini AI
│   ├── api/auth-helper.ts        # Helpers auth & quota
│   ├── auth/supabase-clerk.ts    # Auth + CRUD Supabase
│   ├── db/supabase.ts            # Client Supabase
│   └── utils.ts                  # Utilitaires
│
├── types/                        # Types TypeScript
├── config/                       # Configuration (plans, site)
├── middleware.ts                 # Protection routes Clerk
└── public/                       # Assets statiques
```

### Flow d'Authentification

```
User → Sign Up/Sign In (Clerk)
       ↓
    app/page.tsx (useEffect)
       ↓
    /api/auth/callback
       ↓
    getOrCreateUser()
       ↓
    Supabase users table
       ↓
    Dashboard accessible
```

---

## ✨ Fonctionnalités

### ✅ Phase 1 : MVP (Complété - Nov 15, 2025)
- [x] Interface de génération de prompts
- [x] Mode génération et amélioration
- [x] Suggestions intelligentes par catégories
- [x] Migration Vite → Next.js 15
- [x] Design system (Tailwind + Shadcn/ui)
- [x] API Routes Gemini

### ✅ Phase 2 : Auth & Database (Complété - Nov 15, 2025)
- [x] Authentification Clerk (sign-in, sign-up)
- [x] Database Supabase (PostgreSQL)
- [x] Sync automatique Clerk → Supabase
- [x] Système de quotas utilisateur
- [x] Dashboard utilisateur avec stats
- [x] Protection des routes (middleware)

### 🔄 Phase 3 : Stripe & Paiements (À venir)
- [ ] Plans d'abonnement (Free, Starter, Pro, Enterprise)
- [ ] Intégration Stripe
- [ ] Page de pricing
- [ ] Gestion des abonnements
- [ ] Webhooks Stripe

### 🔄 Phase 4 : Historique & Favoris (À venir)
- [ ] Historique complet des prompts
- [ ] Système de favoris
- [ ] Tags personnalisés
- [ ] Recherche avancée
- [ ] Export de prompts

### 🔄 Phase 5 : Workspaces (À venir)
- [ ] Workspaces multi-utilisateurs
- [ ] Partage de prompts
- [ ] Templates publics/privés
- [ ] Système de permissions (RBAC)

### 🔄 Phase 6 : API Publique (À venir)
- [ ] API REST publique
- [ ] Génération de clés API
- [ ] SDKs (JavaScript, Python)
- [ ] Documentation OpenAPI

---

## 💎 Plans d'Abonnement

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| Prompts/mois | 10 | 100 | Illimité | Illimité |
| Historique | 7j | 30j | Illimité | Illimité |
| Workspaces | ❌ | 1 | 5 | Illimité |
| API Access | ❌ | ✅ | ✅ | ✅ |
| Modèles IA | Flash | Flash/Pro | Tous | Tous + Custom |
| Support | Community | Email | Priorité | Dédié |
| Prix/mois | **0€** | **9€** | **29€** | **Sur mesure** |

---

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)** - Instructions pour Claude Code
- **[SUPABASE_QUICK_SETUP.md](SUPABASE_QUICK_SETUP.md)** - Guide setup Supabase
- **[SUPABASE_MIGRATION_COMPLETE.md](SUPABASE_MIGRATION_COMPLETE.md)** - Migration Prisma → Supabase
- **[.env.example](.env.example)** - Variables d'environnement

### Archives
- **[MIGRATION.md](MIGRATION.md)** - Migration Vite → Next.js (historique)
- **[CLEANUP_REPORT.md](CLEANUP_REPORT.md)** - Rapport de nettoyage (Nov 15, 2025)

---

## 📝 Scripts Disponibles

```bash
# Développement
npm run dev          # Serveur de développement (http://localhost:3000)
npm run build        # Build pour production
npm start            # Démarrer en production

# Code quality
npm run lint         # Linter ESLint
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📄 Licence

MIT © [Promptor](https://github.com/promptor)

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org) - Framework React
- [Vercel](https://vercel.com) - Hébergement
- [Shadcn/ui](https://ui.shadcn.com) - Composants UI
- [Google Gemini](https://ai.google.dev) - IA génération de prompts
- [Clerk](https://clerk.com) - Authentication
- [Supabase](https://supabase.com) - Database & Backend
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS

---

<div align="center">

**[⬆ Retour en haut](#-promptor---saas-de-génération-et-amélioration-de-prompts-ia)**

Fait avec ❤️ par l'équipe Promptor

</div>
