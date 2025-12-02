# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Promptor** is a modern SaaS application built with Next.js 15 for generating and improving prompts for AI models using the Google Gemini API. The app is written in French and is being developed as a complete SaaS platform with authentication, database, and subscription features.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Code quality
npm run lint         # Run ESLint
```

## Environment Setup

Create a `.env.local` file based on `.env.example`:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key

# Supabase (Phase 2)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Clerk Auth (Phase 2)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe (Phase 3)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
```

## Architecture

### Tech Stack

**Frontend:**
- Next.js 15 (App Router, Server Components, API Routes)
- TypeScript (strict mode)
- Tailwind CSS + Shadcn/ui
- React 18
- TanStack Query (planned for Phase 3)

**Backend:**
- Next.js API Routes (serverless)
- Supabase (PostgreSQL + JS Client)
- Redis (planned for caching)

**External Services:**
- Google Gemini AI (gemini-2.5-flash)
- Clerk (authentication)
- Supabase (database)
- Stripe (payments, planned for Phase 3)
- Vercel (hosting, planned)

### Project Structure

```
promptor/
├── app/                           # Next.js App Router
│   ├── (auth)/                   # Auth routes
│   │   ├── sign-in/             # Page de connexion
│   │   └── sign-up/             # Page d'inscription
│   ├── (dashboard)/              # Dashboard routes
│   │   └── dashboard/           # Dashboard utilisateur
│   ├── api/                      # API Routes
│   │   ├── auth/callback/       # Sync Clerk → Supabase
│   │   ├── generate/            # Génération de prompts
│   │   ├── suggestions/         # Suggestions IA
│   │   ├── stripe/
│   │   │   └── create-checkout-session/  # Stripe Checkout
│   │   └── webhooks/stripe/     # Webhooks Stripe
│   ├── pricing/                  # Page tarifs publique
│   ├── success/                  # Page succès paiement
│   ├── layout.tsx               # Layout racine avec Clerk
│   ├── page.tsx                 # Page d'accueil
│   └── globals.css              # Styles globaux Tailwind
│
├── components/ui/                # Shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   └── textarea.tsx
│
├── lib/
│   ├── ai/
│   │   └── gemini.ts            # Service Gemini AI
│   ├── api/
│   │   └── auth-helper.ts       # Auth & quota helpers
│   ├── auth/
│   │   └── supabase-clerk.ts    # Auth + quota Supabase
│   ├── db/
│   │   └── supabase.ts          # Client Supabase
│   ├── email/
│   │   ├── brevo.ts             # Brevo client & configuration
│   │   ├── send.ts              # Email sending functions
│   │   ├── audiences.ts         # Contact lists management
│   │   └── templates/html/      # 8 HTML email templates
│   ├── stripe/
│   │   ├── stripe.ts            # Stripe server-side client
│   │   └── stripe-client.ts     # Stripe client-side (unused for now)
│   └── utils.ts                 # Utilitaires
│
├── types/
│   └── index.ts                 # Types TypeScript
│
├── config/
│   ├── site.ts                  # Config site
│   └── plans.ts                 # Plans tarifaires
│
├── middleware.ts                # Middleware Clerk
└── public/                      # Assets statiques
```

### API Routes Architecture

**[app/api/auth/callback/route.ts](app/api/auth/callback/route.ts)**
- Synchronise automatiquement les utilisateurs Clerk → Supabase
- Appelé lors de la première connexion via useEffect
- Crée l'utilisateur en DB avec plan FREE et quota initial

**[app/api/generate/route.ts](app/api/generate/route.ts)**
- Gère génération ET amélioration de prompts
- Vérifie l'auth et les quotas (via `verifyAuthAndQuota`)
- Sauvegarde en DB et incrémente le quota utilisé
- Appelle Gemini API avec gestion d'erreurs

**[app/api/suggestions/route.ts](app/api/suggestions/route.ts)**
- Génère des suggestions contextuelles
- Utilise le JSON structuré de Gemini
- Retourne des suggestions catégorisées

**[app/api/stripe/create-checkout-session/route.ts](app/api/stripe/create-checkout-session/route.ts)**
- Crée une session de checkout Stripe pour STARTER ou PRO
- Vérifie l'authentification Clerk
- Redirige vers Stripe Checkout avec métadonnées (userId, plan)

**[app/api/webhooks/stripe/route.ts](app/api/webhooks/stripe/route.ts)**
- Reçoit les événements Stripe (checkout.session.completed, subscription.updated, etc.)
- Vérifie la signature du webhook
- Met à jour Supabase automatiquement (plan, quota, stripe_id, subscription_id)

### Service Layer

**[lib/ai/gemini.ts](lib/ai/gemini.ts)** contains all Gemini API integration:

- `generatePrompt(topic, constraints, language)`: Generates detailed prompts from user ideas
- `improvePrompt(existingPrompt, constraints, language)`: Enhances existing prompts
- `getPromptSuggestions(context)`: Returns structured JSON suggestions using Gemini's schema-based responses
- `handleGeminiError(error)`: Centralizes error handling with French user-friendly messages

All functions use the `gemini-2.5-flash` model.

**[lib/email/brevo.ts](lib/email/brevo.ts)** - Brevo (ex-Sendinblue) email service:

- `transactionalEmailsApi`: Client for sending transactional emails
- `brevoContactsApi`: Client for managing contact lists
- `BREVO_LISTS`: Configuration of 5 contact lists (ALL_USERS, FREE_USERS, PRO_USERS, NEWSLETTER, INACTIVE_USERS)
- `EMAIL_FROM`: Pre-configured sender addresses (DEFAULT, SUPPORT, MARKETING, NEWSLETTER)

**[lib/email/send.ts](lib/email/send.ts)** - Email sending functions:

- `sendEmail(to, subject, htmlContent, tags)`: Sends transactional emails
- `sendBroadcastEmail(listId, subject, htmlContent, tags)`: Sends to a contact list (recommends using Brevo Campaigns)
- `sendTestEmail(testEmail, subject, htmlContent)`: Sends test emails

**[lib/email/audiences.ts](lib/email/audiences.ts)** - Contact lists management:

- `addToList(listId, email, data)`: Adds a contact to a Brevo list
- `removeFromList(listId, email)`: Removes a contact from a list
- `updateContact(email, data)`: Updates contact information and attributes
- `syncUserToLists(user)`: Syncs a new user to appropriate lists based on plan
- `updateUserLists(email, oldPlan, newPlan)`: Updates lists when user changes plan
- `deleteContact(email)`: Completely removes a contact from Brevo

**Email Templates** ([lib/email/templates/html/](lib/email/templates/html/)):

8 HTML email templates for all user interactions:
1. Welcome email (signup)
2. Payment success (subscription)
3. Contact received (contact form)
4. Quota reminder (80% used)
5. Quota exceeded (100% used)
6. Subscription cancelled
7. Inactivity reminder (re-engagement)
8. Newsletter (marketing campaigns)

### Database Schema

**Supabase PostgreSQL** avec les tables suivantes (voir [SUPABASE_QUICK_SETUP.md](SUPABASE_QUICK_SETUP.md)):

- **users**: id (Clerk), email, name, avatar, plan, quota_used, quota_limit, stripe_id, subscription_id, reset_date
- **prompts**: id, user_id, type (GENERATE/IMPROVE), input, output, constraints, language, model, tokens, favorited, tags
- **workspaces**: Team collaboration (Phase 5)
- **workspace_members**: RBAC permissions (Phase 5)
- **api_keys**: Developer API access (Phase 6)

**Auth Flow**: Clerk → `/api/auth/callback` → Crée user dans Supabase → Quota tracking

**Note**: RLS désactivé en développement (auth gérée par Clerk)

### Key User Flows

1. **Generate Mode**: User enters topic → optionally adds constraints/language → clicks "Générer le Prompt" → API call to `/api/generate` → result displayed with copy button
2. **Improve Mode**: User pastes existing prompt → optionally adds constraints/language → clicks "Améliorer le Prompt" → API call to `/api/generate` → enhanced version displayed
3. **Suggestions**: User clicks "Obtenir des suggestions" → API call to `/api/suggestions` → AI returns categorized keywords → user selects/adds them to input

### Styling

- Tailwind CSS with custom dark theme
- Shadcn/ui component library
- Design system: CSS variables for colors ([app/globals.css](app/globals.css))
- Fully responsive with mobile-first breakpoints
- Consistent spacing and typography

### State Management

**Current (Phase 1):**
- React hooks (useState, useCallback)
- No global state (planned with Zustand)
- No server state caching (planned with TanStack Query)

**Planned (Phase 2+):**
- Zustand for global UI state
- TanStack Query for server state and caching
- Optimistic updates for better UX

## Technical Notes

- **TypeScript**: Strict mode with noUncheckedIndexedAccess
- **Next.js**: App Router with Server/Client Components separation
- **API Security**: API keys never exposed to client (server-side only)
- **Error Handling**: All API errors are caught and transformed into French messages
- **Accessibility**: ARIA labels on interactive elements, focus-visible rings, semantic HTML
- **Path Alias**: `@/*` resolves to project root (configured in [tsconfig.json](tsconfig.json))

## Subscription Plans

Defined in [config/plans.ts](config/plans.ts):

- **Free**: 10 prompts/month, 7 days history, Gemini Flash
- **Starter** (9€/month): 100 prompts/month, 30 days history, API access
- **Pro** (29€/month): Unlimited prompts, all AI models, 5 workspaces
- **Enterprise** (custom): Unlimited everything, custom AI models, SSO, on-premise

## Migration Status

This project was recently migrated from Vite to Next.js 15. See [MIGRATION.md](MIGRATION.md) for details.

**Phase 1**: ✅ Completed (Nov 15, 2025)
- Next.js 15 setup
- Tailwind CSS + Shadcn/ui
- API Routes for Gemini
- Basic UI components

**Phase 2**: ✅ Completed (Nov 15, 2025)
- Clerk authentication (sign-in, sign-up)
- Supabase database (PostgreSQL)
- User sync Clerk → Supabase
- Quota system (FREE: 10/month)
- Dashboard with stats

**Phase 3**: ✅ Completed (Nov 20, 2025)

- Stripe integration (checkout sessions, subscription management)
- Page Pricing publique avec 4 plans (FREE, STARTER, PRO, ENTERPRISE)
- Page Success avec synchronisation automatique
- API `/api/stripe/sync-subscription` pour développement local
- Mise à jour automatique de Supabase après paiement (plan, quota, stripe_id, subscription_id)
- Webhooks Stripe configurés (pour production)

**Phase 4**: ✅ Completed (Nov 20, 2025)

- Page historique avec pagination (20 prompts/page)
- Recherche full-text dans les prompts
- Filtres par type (GENERATE/IMPROVE) et favoris
- Toggle favoris sur chaque prompt
- Copie rapide dans le presse-papiers
- Suppression de prompts avec confirmation
- Lien vers l'historique depuis le dashboard

**Phase 5**: 🔄 Next (Sécurité & Hardening)
**Phase 6**: 🔄 Planned (Landing Page & UI/UX)
**Phase 7**: 🔄 Planned (Admin Dashboard)
**Phase 8**: 🔄 Planned (SEO & Performance)
**Phase 9**: 🔄 Planned (Tests & CI/CD)
**Phase 10**: 🔄 Planned (Monitoring & Logs)
**Phase 11**: 🔄 Planned (Internationalisation)
**Phase 12**: 🔄 Planned (Features Avancées)

> Note: Les anciennes phases "Workspaces" et "Public API" sont reportées après la mise en production.

## Additional Documentation

**Active Documentation:**

- [README.md](README.md) - Project overview, quick start, architecture
- [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md) - État complet du développement (Phases 1-4)
- [PRODUCTION_ROADMAP.md](PRODUCTION_ROADMAP.md) - Roadmap complète pour la production
- [SUPABASE_QUICK_SETUP.md](SUPABASE_QUICK_SETUP.md) - Supabase setup guide (SQL, tables, RLS)
- [PHASE_3_SUMMARY.md](PHASE_3_SUMMARY.md) - Stripe integration détaillée
- [STRIPE_WEBHOOKS_LOCAL.md](STRIPE_WEBHOOKS_LOCAL.md) - Stripe CLI pour webhooks en local
- [.env.example](.env.example) - Environment variables template

**Archives (Historical):**

- [docs/archives/](docs/archives/) - Historical documentation
  - [MIGRATION.md](docs/archives/MIGRATION.md) - Vite → Next.js migration (Nov 15, 2025)
  - [CLEANUP_REPORT.md](docs/archives/CLEANUP_REPORT.md) - Codebase cleanup report (Nov 15, 2025)
  - [STRUCTURE.md](docs/archives/STRUCTURE.md) - Project structure snapshot (Nov 15, 2025)

## Original AI Studio Integration

This project was originally created with Google AI Studio:
https://ai.studio/apps/drive/1neEUEoKoccYfx9-_qw9h55xqjsb5VPhu

Metadata about the original app is stored in [metadata.json](metadata.json).
