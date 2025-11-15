# 🚀 Promptor - SaaS de Génération et Amélioration de Prompts IA

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6.2-2D3748?style=for-the-badge&logo=prisma)

**Créez et améliorez vos prompts pour l'IA avec Promptor**

[Démo](https://promptor.app) · [Documentation](#documentation) · [Contribuer](#contribuer)

</div>

---

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Stack Technique](#-stack-technique)
- [Démarrage Rapide](#-démarrage-rapide)
- [Architecture](#-architecture)
- [Fonctionnalités](#-fonctionnalités)
- [Roadmap](#-roadmap)
- [Contribuer](#-contribuer)

---

## 🎯 À Propos

**Promptor** est une application SaaS complète pour générer et améliorer des prompts destinés aux modèles d'IA. L'application offre :

- ✨ Génération de prompts détaillés à partir d'idées simples
- 🔧 Amélioration de prompts existants
- 💡 Suggestions intelligentes par catégories
- 📊 Dashboard utilisateur avec analytics
- 👥 Workspaces collaboratifs
- 🔑 API publique pour développeurs
- 💳 Système d'abonnements (Free, Starter, Pro, Enterprise)

---

## 🛠️ Stack Technique

### Frontend
- **Next.js 15** - App Router, Server Components, API Routes
- **TypeScript** - Type safety strict
- **Tailwind CSS + Shadcn/ui** - Design system moderne
- **TanStack Query** - Gestion du state serveur
- **Zustand** - State management global

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Base de données principale
- **Redis** - Cache et rate limiting

### Services Externes
- **Google Gemini** - Génération de prompts
- **Clerk** - Authentication
- **Stripe** - Paiements et abonnements
- **Vercel** - Hébergement et déploiement

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- npm ou pnpm
- PostgreSQL (ou compte Supabase)
- Clé API Gemini ([obtenir ici](https://aistudio.google.com/app/apikey))

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

   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/promptor

   # Clerk (optionnel pour démarrer)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=

   # Stripe (optionnel pour démarrer)
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   ```

4. **Initialiser la base de données**
   ```bash
   npm run db:push
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
├── app/                      # Next.js App Router
│   ├── (auth)/              # Routes authentification
│   ├── (dashboard)/         # Routes dashboard
│   ├── (marketing)/         # Landing page, pricing, docs
│   ├── api/                 # API routes
│   └── layout.tsx
├── components/
│   ├── ui/                  # Shadcn/ui components
│   ├── prompt/              # Composants prompt
│   ├── workspace/           # Composants workspace
│   └── shared/              # Composants partagés
├── lib/
│   ├── db/                  # Prisma + schema
│   ├── auth/                # Clerk config
│   ├── stripe/              # Stripe integration
│   ├── ai/                  # Services IA (Gemini, OpenAI, etc.)
│   └── utils/
├── types/                   # TypeScript types
├── config/                  # Configuration (plans, site)
└── hooks/                   # React hooks personnalisés
```

---

## ✨ Fonctionnalités

### Phase 1 : MVP ✅ (Complété)
- [x] Interface de génération de prompts
- [x] Mode génération et amélioration
- [x] Suggestions intelligentes
- [x] Migration vers Next.js 15
- [x] Design system (Tailwind + Shadcn/ui)

### Phase 2 : Base de Données & Auth (En cours)
- [ ] Authentification Clerk
- [ ] Schéma Prisma complet
- [ ] Migration localStorage → PostgreSQL
- [ ] Système de quotas utilisateur

### Phase 3 : SaaS Features
- [ ] Plans d'abonnement (Free, Starter, Pro, Enterprise)
- [ ] Intégration Stripe
- [ ] Dashboard utilisateur
- [ ] Analytics d'utilisation

### Phase 4 : Collaboration
- [ ] Workspaces multi-utilisateurs
- [ ] Partage de prompts
- [ ] Templates publics/privés
- [ ] Système de permissions (RBAC)

### Phase 5 : API & Développeurs
- [ ] API REST publique
- [ ] Génération de clés API
- [ ] SDKs (JavaScript, Python)
- [ ] Documentation OpenAPI

---

## 📊 Plans d'Abonnement

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| Prompts/mois | 10 | 100 | Illimité | Illimité |
| Historique | 7j | 30j | Illimité | Illimité |
| Workspaces | ❌ | 1 | 5 | Illimité |
| API | ❌ | ✅ | ✅ | ✅ |
| Modèles IA | Flash | Flash/Pro | Tous | Tous + Custom |
| Prix/mois | 0€ | 9€ | 29€ | Sur mesure |

---

## 🗺️ Roadmap

### Q1 2025
- ✅ Migration Next.js 15
- 🔄 Auth + Database (Janvier)
- 🔄 Système de paiements (Février)
- 🔄 Dashboard v1 (Mars)

### Q2 2025
- Workspaces collaboratifs
- API publique v1
- Templates marketplace
- Analytics avancés

### Q3 2025
- Multi-modèles IA (GPT-4, Claude)
- Collaboration temps réel
- Mobile app (React Native)

### Q4 2025
- Enterprise features (SSO, audit logs)
- On-premise deployment
- AI personnalisés

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines.

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📝 Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm start            # Démarrer en production
npm run lint         # Linter ESLint
npm run db:push      # Pousser le schéma Prisma
npm run db:studio    # Ouvrir Prisma Studio
```

---

## 📄 Licence

MIT © [Promptor](https://github.com/promptor)

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org)
- [Vercel](https://vercel.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [Google Gemini](https://ai.google.dev)
- [Clerk](https://clerk.com)
- [Stripe](https://stripe.com)

---

<div align="center">

**[⬆ Retour en haut](#-promptor---saas-de-génération-et-amélioration-de-prompts-ia)**

Fait avec ❤️ par l'équipe Promptor

</div>
