# Variables d'environnement pour Vercel

Copiez ces variables d'environnement dans Vercel Dashboard lors du déploiement.

## Comment ajouter sur Vercel

1. Allez sur **vercel.com** → Sélectionnez votre projet
2. Cliquez sur **Settings** → **Environment Variables**
3. Pour chaque variable ci-dessous :
   - **Key** : Le nom de la variable (ex: `GEMINI_API_KEY`)
   - **Value** : La valeur correspondante
   - **Environments** : Cochez Production, Preview, Development
   - Cliquez sur **Add**

---

## Variables à copier

```bash
# ============================================================================
# Gemini AI
# ============================================================================
GEMINI_API_KEY=PLACEHOLDER_API_KEY

# ============================================================================
# Clerk Authentication
# ============================================================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_aG90LWdlbGRpbmctMS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_vWMuaB815mSLfz9lfkH3IxpSKv9zEk5uw9AylWn61Z

# ============================================================================
# Supabase Database
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://cnsztvnbofgjkxqdcgam.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuc3p0dm5ib2Znamt4cWRjZ2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxOTg5OTEsImV4cCI6MjA3ODc3NDk5MX0.uFitZLmMVFjGvZVyp7dHr8em_37nOORcYgggi596zV4

# ============================================================================
# FedaPay Payments (Solution béninoise)
# ============================================================================
# ⚠️ À CONFIGURER : Créez votre compte sur https://app.fedapay.com
FEDAPAY_SECRET_KEY=sk_sandbox_VOTRE_CLE_ICI
FEDAPAY_PUBLIC_KEY=pk_sandbox_VOTRE_CLE_ICI
FEDAPAY_ENVIRONMENT=sandbox

# Mode Production (à activer plus tard) :
# FEDAPAY_SECRET_KEY=sk_live_VOTRE_CLE_ICI
# FEDAPAY_PUBLIC_KEY=pk_live_VOTRE_CLE_ICI
# FEDAPAY_ENVIRONMENT=live

# ============================================================================
# Brevo Email Service
# ============================================================================
BREVO_API_KEY=xkeysib-VOTRE_CLE_BREVO_ICI
BREVO_SENDER_EMAIL=contact@smtp-brevo.com
BREVO_LIST_ALL_USERS=5
BREVO_LIST_FREE_USERS=6
BREVO_LIST_PRO_USERS=7
BREVO_LIST_NEWSLETTER=8
BREVO_LIST_INACTIVE_USERS=9
```

---

## Variables manquantes à ajouter

Ces variables ne sont pas dans votre `.env.local` mais sont nécessaires pour la production :

### STRIPE_WEBHOOK_SECRET (CRITIQUE pour la production)

**⚠️ IMPORTANT** : Cette variable sera créée APRÈS le premier déploiement.

**Étapes** :
1. Déployez d'abord sans cette variable
2. Notez l'URL de votre site (ex: `https://promptor.vercel.app`)
3. Allez dans **Stripe Dashboard** → **Developers** → **Webhooks**
4. Cliquez sur **Add endpoint**
5. URL : `https://votre-url.vercel.app/api/webhooks/stripe`
6. Sélectionnez ces événements :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
7. Copiez le **Signing secret** (commence par `whsec_...`)
8. Ajoutez-le dans Vercel :

```bash
STRIPE_WEBHOOK_SECRET=whsec_VotreCléIci
```

### NEXT_PUBLIC_SITE_URL

**Pour le premier déploiement** :
```bash
NEXT_PUBLIC_SITE_URL=https://promptor.vercel.app
```

**Après avoir configuré un domaine personnalisé** :
```bash
NEXT_PUBLIC_SITE_URL=https://votredomaine.com
```

---

## Upstash Redis (Rate Limiting)

**⚠️ MANQUANT** : Vous n'avez pas configuré Upstash Redis pour le rate limiting.

Le code utilise `@upstash/ratelimit` mais les variables ne sont pas dans votre `.env.local`.

**Option 1 : Créer un compte Upstash (GRATUIT)**

1. Allez sur https://console.upstash.com/
2. Créez un compte (gratuit jusqu'à 10,000 commandes/jour)
3. Créez une base Redis
4. Copiez les credentials :

```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=votre_token_ici
```

**Option 2 : Désactiver temporairement le rate limiting**

Si vous voulez déployer rapidement sans Redis, je peux désactiver temporairement le rate limiting.

---

## Résumé : Variables minimales pour déployer

**Variables OBLIGATOIRES** (17 variables) :

1. `GEMINI_API_KEY`
2. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
3. `CLERK_SECRET_KEY`
4. `NEXT_PUBLIC_SUPABASE_URL`
5. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. `STRIPE_SECRET_KEY`
7. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
8. `STRIPE_PRICE_STARTER`
9. `STRIPE_PRICE_PRO`
10. `BREVO_API_KEY`
11. `BREVO_SENDER_EMAIL`
12. `BREVO_LIST_ALL_USERS`
13. `BREVO_LIST_FREE_USERS`
14. `BREVO_LIST_PRO_USERS`
15. `BREVO_LIST_NEWSLETTER`
16. `BREVO_LIST_INACTIVE_USERS`
17. `NEXT_PUBLIC_SITE_URL`

**Variables à ajouter APRÈS le premier déploiement** :

18. `STRIPE_WEBHOOK_SECRET` (après création du webhook Stripe)
19. `UPSTASH_REDIS_REST_URL` (pour le rate limiting)
20. `UPSTASH_REDIS_REST_TOKEN` (pour le rate limiting)

---

## Checklist de déploiement

- [ ] Toutes les variables obligatoires ajoutées sur Vercel
- [ ] Premier déploiement lancé
- [ ] Site accessible (URL temporaire Vercel)
- [ ] Webhook Stripe créé avec l'URL de production
- [ ] `STRIPE_WEBHOOK_SECRET` ajouté dans Vercel
- [ ] Redéploiement après ajout du webhook secret
- [ ] Tests : Inscription, Paiement, Génération de prompts

---

**Note** : Vous êtes actuellement en **mode TEST Stripe**. Pour passer en production :
1. Activez votre compte Stripe (vérification d'identité)
2. Remplacez les clés `sk_test_` et `pk_test_` par `sk_live_` et `pk_live_`
3. Créez de nouveaux Price IDs en mode Live
