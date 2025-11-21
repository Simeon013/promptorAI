# Roadmap Production - Promptor

**Date de création** : 21 Novembre 2025
**Objectif** : Déploiement en production avec toutes les fonctionnalités critiques
**Estimation totale** : 150-200 heures de développement

---

## Vue d'ensemble des Phases

| Phase | Nom | Priorité | Estimation |
|-------|-----|----------|------------|
| **P5** | Sécurité & Hardening | BLOQUANT | 25-30h |
| **P6** | Landing Page & UI/UX | BLOQUANT | 30-40h |
| **P7** | Admin Dashboard | IMPORTANT | 25-30h |
| **P8** | SEO & Performance | IMPORTANT | 15-20h |
| **P9** | Tests & CI/CD | IMPORTANT | 20-25h |
| **P10** | Monitoring & Logs | IMPORTANT | 15-20h |
| **P11** | Internationalisation | NICE-TO-HAVE | 15-20h |
| **P12** | Features Avancées | NICE-TO-HAVE | 20-25h |

---

## Phase 5 : Sécurité & Hardening

### 5.1 Validation des Entrées (CRITIQUE)

**Problème actuel** : Les inputs ne sont validés que basiquement (trim + longueur)

**Actions** :
- [ ] Installer `zod` pour validation stricte
- [ ] Créer schemas de validation pour tous les endpoints :
  - `/api/generate` : input (max 5000 chars), constraints (max 500), language (enum)
  - `/api/suggestions` : context (max 2000 chars)
  - `/api/prompts` : search (max 200 chars), page (int), limit (int 1-100)
- [ ] Valider côté client avant envoi
- [ ] Retourner erreurs 400 avec messages clairs

**Fichiers à modifier** :
- `app/api/generate/route.ts`
- `app/api/suggestions/route.ts`
- `app/api/prompts/route.ts`
- `app/api/prompts/[id]/route.ts`
- `app/page.tsx` (validation client)

---

### 5.2 Rate Limiting (CRITIQUE)

**Problème actuel** : Aucune limite sur les appels API

**Actions** :
- [ ] Installer `@upstash/ratelimit` + `@upstash/redis`
- [ ] Créer middleware de rate limiting
- [ ] Configurer les limites :
  | Endpoint | Limite | Fenêtre |
  |----------|--------|---------|
  | `/api/generate` | 10 req | 1 minute |
  | `/api/suggestions` | 20 req | 1 minute |
  | `/api/prompts` | 60 req | 1 minute |
  | `/api/stripe/*` | 5 req | 1 minute |
- [ ] Retourner `429 Too Many Requests` avec header `Retry-After`

**Nouveaux fichiers** :
- `lib/ratelimit.ts`
- Modifier toutes les routes API

---

### 5.3 Security Headers (CRITIQUE)

**Problème actuel** : Aucun header de sécurité HTTP

**Actions** :
- [ ] Configurer dans `next.config.ts` :
  ```typescript
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" }
      ]
    }]
  }
  ```

**Fichiers à modifier** :
- `next.config.ts`

---

### 5.4 Protection CSRF (IMPORTANT)

**Actions** :
- [ ] Installer `csrf-sync` ou équivalent Next.js
- [ ] Ajouter token CSRF aux formulaires POST
- [ ] Valider Content-Type sur tous les POST

---

### 5.5 Supabase RLS Policies (CRITIQUE)

**Problème actuel** : RLS désactivé

**Actions** :
- [ ] Créer policies pour `users` :
  ```sql
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid()::text = id);
  CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid()::text = id);
  ```
- [ ] Créer policies pour `prompts` :
  ```sql
  ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "prompts_select_own" ON prompts FOR SELECT USING (auth.uid()::text = user_id);
  CREATE POLICY "prompts_insert_own" ON prompts FOR INSERT WITH CHECK (auth.uid()::text = user_id);
  CREATE POLICY "prompts_update_own" ON prompts FOR UPDATE USING (auth.uid()::text = user_id);
  CREATE POLICY "prompts_delete_own" ON prompts FOR DELETE USING (auth.uid()::text = user_id);
  ```
- [ ] Tester l'isolation des données entre utilisateurs
- [ ] Documenter les policies dans SUPABASE_QUICK_SETUP.md

---

### 5.6 Indexes Database (IMPORTANT)

**Actions** :
```sql
-- Performance indexes
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompts_favorited ON prompts(user_id, favorited) WHERE favorited = true;

-- Full-text search (requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_prompts_input_trgm ON prompts USING GIN (input gin_trgm_ops);
CREATE INDEX idx_prompts_output_trgm ON prompts USING GIN (output gin_trgm_ops);
```

---

### 5.7 Audit Logging (IMPORTANT)

**Actions** :
- [ ] Créer table `audit_logs` :
  ```sql
  CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX idx_audit_user ON audit_logs(user_id);
  CREATE INDEX idx_audit_action ON audit_logs(action);
  ```
- [ ] Logger les actions :
  - Paiements (checkout completed)
  - Changements de plan
  - Suppressions de prompts
  - Connexions (optionnel)

**Nouveaux fichiers** :
- `lib/audit.ts`

---

### 5.8 Validation Stripe Metadata (IMPORTANT)

**Actions** :
- [ ] Valider que `plan` est dans `['STARTER', 'PRO']`
- [ ] Valider que `userId` correspond au `client_reference_id`
- [ ] Logger les tentatives suspectes

---

## Phase 6 : Landing Page & UI/UX

### 6.1 Nouvelle Landing Page (CRITIQUE)

**Problème actuel** : `app/page.tsx` est l'éditeur, pas une vraie landing page

**Actions** :
- [ ] Créer nouvelle landing page `/` avec sections :
  1. **Hero** : Titre accrocheur + CTA "Commencer gratuitement"
  2. **Features** : 3-4 cartes avec icônes
  3. **How it works** : 3 étapes illustrées
  4. **Pricing preview** : Aperçu des plans avec lien vers /pricing
  5. **Testimonials** : Citations d'utilisateurs (fictives ou réelles)
  6. **FAQ** : Questions fréquentes
  7. **Final CTA** : "Essayez gratuitement"
  8. **Footer** : Liens, légales, réseaux sociaux

- [ ] Déplacer l'éditeur vers `/app` ou `/editor`
- [ ] Rediriger utilisateurs connectés vers `/dashboard`

**Nouveaux fichiers** :
- `app/page.tsx` (refonte complète)
- `app/editor/page.tsx` (ancien code de page.tsx)
- `components/landing/Hero.tsx`
- `components/landing/Features.tsx`
- `components/landing/HowItWorks.tsx`
- `components/landing/Testimonials.tsx`
- `components/landing/FAQ.tsx`
- `components/layout/Header.tsx`
- `components/layout/Footer.tsx`

---

### 6.2 Header & Footer Réutilisables (IMPORTANT)

**Actions** :
- [ ] Créer `components/layout/Header.tsx` :
  - Logo cliquable
  - Navigation (Accueil, Pricing, Dashboard si connecté)
  - Boutons Sign In / Sign Up ou Avatar utilisateur
  - Responsive (hamburger menu mobile)

- [ ] Créer `components/layout/Footer.tsx` :
  - Logo + description
  - Liens : Produit, Ressources, Légal
  - Réseaux sociaux
  - Copyright

---

### 6.3 Amélioration Responsive (CRITIQUE)

**Actions** :
- [ ] Auditer toutes les pages sur mobile (320px-480px)
- [ ] Corriger :
  - `app/page.tsx` : Textarea trop petit
  - `app/pricing/page.tsx` : Grid collapse
  - `app/(dashboard)/dashboard/page.tsx` : Stats cards
  - `app/(dashboard)/dashboard/history/page.tsx` : Filters layout
- [ ] Touch targets minimum 44px
- [ ] Tester sur émulateurs iOS/Android

---

### 6.4 Accessibilité WCAG AA (IMPORTANT)

**Actions** :
- [ ] Ajouter `aria-label` sur tous les boutons iconiques
- [ ] Vérifier ratio contraste (min 4.5:1) avec WebAIM
- [ ] Ajouter `role` sur les éléments interactifs
- [ ] Tester navigation clavier (Tab, Enter, Escape)
- [ ] Ajouter skip links pour lecteurs d'écran
- [ ] Ajouter `alt` sur toutes les images

---

### 6.5 États de Chargement (IMPORTANT)

**Actions** :
- [ ] Ajouter skeleton loaders :
  - Dashboard stats
  - Liste des prompts
  - Historique
- [ ] Améliorer spinner pendant génération
- [ ] Désactiver tous les boutons pendant chargement
- [ ] Ajouter message "Génération en cours..." visible

---

### 6.6 Messages d'Erreur (IMPORTANT)

**Actions** :
- [ ] Afficher les vrais messages d'erreur API
- [ ] Catégoriser : Réseau, Quota, Auth, Serveur
- [ ] Proposer actions contextuelles :
  - "Quota dépassé" → "Passez à Pro"
  - "Erreur réseau" → "Réessayer"
  - "Non authentifié" → "Se connecter"

---

### 6.7 Pages d'Erreur (IMPORTANT)

**Actions** :
- [ ] Créer `app/not-found.tsx` (404)
- [ ] Créer `app/error.tsx` (500)
- [ ] Design cohérent avec le reste du site
- [ ] CTA vers page d'accueil

---

### 6.8 Animations & Micro-interactions (NICE-TO-HAVE)

**Actions** :
- [ ] Ajouter fade-in sur apparition du résultat
- [ ] Ajouter hover effects sur cards
- [ ] Transition douce sur changement de mode
- [ ] Animation sur copie dans presse-papiers

---

## Phase 7 : Admin Dashboard

### 7.1 Structure Admin (CRITIQUE)

**Actions** :
- [ ] Créer route group `app/(admin)/admin/`
- [ ] Protéger avec middleware (vérifier rôle admin)
- [ ] Layout admin dédié avec sidebar

**Fichiers** :
- `app/(admin)/admin/layout.tsx`
- `app/(admin)/admin/page.tsx` (overview)
- `middleware.ts` (ajout protection admin)

---

### 7.2 Dashboard Overview (IMPORTANT)

**Métriques à afficher** :
- [ ] Nombre total d'utilisateurs
- [ ] Utilisateurs par plan (pie chart)
- [ ] Revenue total / MRR
- [ ] Prompts générés (total + ce mois)
- [ ] Taux d'utilisation des quotas

**Fichier** : `app/(admin)/admin/page.tsx`

---

### 7.3 Gestion des Utilisateurs (IMPORTANT)

**Actions** :
- [ ] Liste des utilisateurs avec :
  - Email, nom, plan, quota utilisé/limite
  - Date d'inscription
  - Dernier prompt généré
- [ ] Recherche par email/nom
- [ ] Filtres par plan
- [ ] Pagination
- [ ] Actions :
  - Voir détails
  - Modifier quota manuellement
  - Changer de plan (admin only)
  - Désactiver compte

**Fichiers** :
- `app/(admin)/admin/users/page.tsx`
- `app/(admin)/admin/users/[id]/page.tsx`
- `app/api/admin/users/route.ts`
- `app/api/admin/users/[id]/route.ts`

---

### 7.4 Gestion des Paiements (IMPORTANT)

**Actions** :
- [ ] Liste des transactions Stripe
- [ ] Filtres par période, plan
- [ ] Détails : utilisateur, montant, date, statut
- [ ] Export CSV

**Fichiers** :
- `app/(admin)/admin/payments/page.tsx`
- `app/api/admin/payments/route.ts`

---

### 7.5 Logs & Erreurs (IMPORTANT)

**Actions** :
- [ ] Afficher les erreurs Gemini API
- [ ] Afficher les erreurs Stripe
- [ ] Afficher les webhooks échoués
- [ ] Filtres par type, date
- [ ] Pagination

**Fichiers** :
- `app/(admin)/admin/logs/page.tsx`
- `app/api/admin/logs/route.ts`

---

### 7.6 Configuration (NICE-TO-HAVE)

**Actions** :
- [ ] Modifier les limites de quota par plan
- [ ] Activer/désactiver fonctionnalités
- [ ] Bannières d'annonce

---

## Phase 8 : SEO & Performance

### 8.1 robots.txt (CRITIQUE)

**Action** : Créer `public/robots.txt`
```
User-agent: *
Allow: /
Allow: /pricing
Disallow: /api/
Disallow: /dashboard/
Disallow: /admin/
Disallow: /sign-in/
Disallow: /sign-up/
Sitemap: https://promptor.com/sitemap.xml
```

---

### 8.2 sitemap.xml (CRITIQUE)

**Action** : Créer `app/sitemap.ts`
```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://promptor.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://promptor.com/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]
}
```

---

### 8.3 Meta Tags Complets (IMPORTANT)

**Actions** :
- [ ] Open Graph tags (og:title, og:description, og:image, og:url)
- [ ] Twitter Card tags
- [ ] Canonical URLs
- [ ] Meta description par page

**Fichier** : Chaque `page.tsx` doit exporter `metadata`

---

### 8.4 Structured Data (NICE-TO-HAVE)

**Actions** :
- [ ] Schema.org pour Organization
- [ ] Schema.org pour FAQ
- [ ] Schema.org pour Product (plans)

---

### 8.5 Performance (IMPORTANT)

**Actions** :
- [ ] Installer TanStack Query pour caching
- [ ] Lazy load des composants lourds
- [ ] Optimiser images avec `next/image`
- [ ] Prefetch des pages avec `<Link prefetch>`
- [ ] Vérifier Core Web Vitals
- [ ] Lighthouse score > 90

---

## Phase 9 : Tests & CI/CD

### 9.1 Configuration Jest (CRITIQUE)

**Actions** :
- [ ] Installer Jest + Testing Library
- [ ] Configurer `jest.config.ts`
- [ ] Créer setup files

**Fichiers** :
- `jest.config.ts`
- `jest.setup.ts`

---

### 9.2 Tests Unitaires (CRITIQUE)

**Fichiers à tester** :
- [ ] `lib/ai/gemini.ts` - error handling
- [ ] `lib/auth/supabase-clerk.ts` - quota functions
- [ ] `lib/api/auth-helper.ts` - verifyAuthAndQuota
- [ ] `config/plans.ts` - plan configs

---

### 9.3 Tests d'Intégration (IMPORTANT)

**Endpoints à tester** :
- [ ] `POST /api/generate` - avec mock Gemini
- [ ] `GET /api/prompts` - pagination, filtres
- [ ] `PATCH /api/prompts/[id]` - toggle favorite
- [ ] `DELETE /api/prompts/[id]` - ownership check
- [ ] `POST /api/stripe/create-checkout-session`

---

### 9.4 Tests E2E - Playwright (IMPORTANT)

**Flows à tester** :
- [ ] Sign up flow complet
- [ ] Sign in flow
- [ ] Générer un prompt
- [ ] Voir historique
- [ ] Toggle favoris
- [ ] Flow de paiement (Stripe test mode)

**Fichiers** :
- `e2e/auth.spec.ts`
- `e2e/generate.spec.ts`
- `e2e/history.spec.ts`
- `e2e/payment.spec.ts`

---

### 9.5 CI/CD GitHub Actions (IMPORTANT)

**Actions** :
- [ ] Créer `.github/workflows/ci.yml` :
  - Lint on PR
  - Tests on PR
  - Build check on PR
  - Deploy preview on PR
- [ ] Créer `.github/workflows/deploy.yml` :
  - Deploy to Vercel on merge to main

---

## Phase 10 : Monitoring & Logs

### 10.1 Sentry (CRITIQUE)

**Actions** :
- [ ] Installer `@sentry/nextjs`
- [ ] Configurer dans `sentry.client.config.ts`
- [ ] Configurer dans `sentry.server.config.ts`
- [ ] Créer `instrumentation.ts`
- [ ] Tracker erreurs client + serveur

---

### 10.2 Logger Structuré (IMPORTANT)

**Actions** :
- [ ] Installer `pino` ou `winston`
- [ ] Remplacer tous les `console.log/error`
- [ ] Format JSON pour parsing
- [ ] Niveaux : debug, info, warn, error
- [ ] Contexte : userId, requestId

**Fichier** : `lib/logger.ts`

---

### 10.3 Métriques API (IMPORTANT)

**Actions** :
- [ ] Tracker latence Gemini API
- [ ] Tracker taux d'erreur
- [ ] Tracker temps de réponse par endpoint
- [ ] Dashboard dans admin ou service externe (Datadog, etc.)

---

### 10.4 Alerting (IMPORTANT)

**Configurer alertes pour** :
- [ ] Taux d'erreur > 5%
- [ ] Latence > 5s
- [ ] Webhook Stripe échoué
- [ ] Quota Gemini API dépassé

---

## Phase 11 : Internationalisation (i18n)

### 11.1 Setup next-intl (NICE-TO-HAVE)

**Actions** :
- [ ] Installer `next-intl`
- [ ] Configurer middleware pour locale
- [ ] Créer structure messages :
  - `messages/fr.json`
  - `messages/en.json`

---

### 11.2 Extraction des Strings (NICE-TO-HAVE)

**Actions** :
- [ ] Extraire tous les textes hardcodés
- [ ] Remplacer par clés de traduction
- [ ] ~200 strings à traduire estimés

---

### 11.3 Language Switcher (NICE-TO-HAVE)

**Actions** :
- [ ] Ajouter switcher dans Header
- [ ] Persister préférence utilisateur
- [ ] Rediriger vers locale appropriée

---

## Phase 12 : Features Avancées

### 12.1 Soft Delete (IMPORTANT)

**Actions** :
- [ ] Ajouter colonne `deleted_at` à `prompts`
- [ ] Modifier queries pour exclure deleted
- [ ] Ajouter endpoint restore (admin)

---

### 12.2 Export des Prompts (NICE-TO-HAVE)

**Actions** :
- [ ] Export JSON
- [ ] Export Markdown
- [ ] Export CSV

---

### 12.3 Email Notifications (NICE-TO-HAVE)

**Actions** :
- [ ] Intégrer Resend ou SendGrid
- [ ] Email bienvenue après inscription
- [ ] Email confirmation paiement
- [ ] Email quota proche de la limite

---

### 12.4 Webhooks Clerk (NICE-TO-HAVE)

**Actions** :
- [ ] Écouter `user.deleted` → supprimer données
- [ ] Écouter `user.updated` → sync avatar/name

---

### 12.5 Système de Tags (NICE-TO-HAVE)

**Actions** :
- [ ] Ajouter tags personnalisables aux prompts
- [ ] Filtre par tags dans historique
- [ ] Autocomplétion des tags existants

---

## Checklist Finale Pré-Production

### Bloquants (MUST HAVE)

- [ ] Validation inputs avec zod
- [ ] Rate limiting configuré
- [ ] Security headers en place
- [ ] RLS Supabase activé
- [ ] Stripe en mode LIVE
- [ ] Sentry configuré
- [ ] Landing page complète
- [ ] Tests E2E passent
- [ ] robots.txt + sitemap.xml
- [ ] Pages 404/500

### Important (SHOULD HAVE)

- [ ] Admin dashboard basique
- [ ] Coverage tests > 80%
- [ ] Accessibilité WCAG AA
- [ ] Performance Lighthouse > 90
- [ ] CI/CD configuré
- [ ] Logs structurés
- [ ] Indexes DB créés

### Nice-to-have (COULD HAVE)

- [ ] i18n (FR + EN)
- [ ] Email notifications
- [ ] Export prompts
- [ ] Soft delete
- [ ] Système de tags

---

## Planning Suggéré

### Sprint 1 (Semaine 1-2) : Sécurité

- Phase 5.1 : Validation inputs
- Phase 5.2 : Rate limiting
- Phase 5.3 : Security headers
- Phase 5.5 : RLS Supabase

### Sprint 2 (Semaine 3-4) : UI/UX

- Phase 6.1 : Landing page
- Phase 6.2 : Header/Footer
- Phase 6.3 : Responsive
- Phase 6.7 : Pages erreur

### Sprint 3 (Semaine 5-6) : Admin & Tests

- Phase 7.1-7.3 : Admin dashboard
- Phase 9.1-9.4 : Tests

### Sprint 4 (Semaine 7-8) : Finalisation

- Phase 8 : SEO
- Phase 10 : Monitoring
- Phase restantes

### Post-Launch (Semaine 9+)

- Phase 11 : i18n
- Phase 12 : Features avancées
- Feedback utilisateurs

---

**Document créé le** : 21 Novembre 2025
**Dernière mise à jour** : 21 Novembre 2025
