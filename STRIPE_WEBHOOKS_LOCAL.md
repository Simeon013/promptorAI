# Configuration des Webhooks Stripe en Local

## Pourquoi les webhooks ne fonctionnent pas en local ?

Stripe ne peut pas envoyer de webhooks vers `localhost` depuis Internet. Pour tester les webhooks en développement, il faut utiliser **Stripe CLI** qui crée un tunnel sécurisé.

---

## Option 1: Stripe CLI (Recommandé)

### 1. Installation

**Windows (avec Scoop):**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Ou télécharger directement:**
https://github.com/stripe/stripe-cli/releases/latest

### 2. Authentification

```bash
stripe login
```

Cela ouvrira votre navigateur pour authentifier le CLI avec votre compte Stripe.

### 3. Écouter les webhooks

Dans un terminal séparé, lancez:

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

**Important:** Copiez le webhook signing secret (`whsec_...`) qui s'affiche et ajoutez-le dans `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_affiche_par_stripe_cli
```

### 4. Tester

Dans un autre terminal:

```bash
stripe trigger checkout.session.completed
```

Vous devriez voir les logs dans:
- Le terminal Stripe CLI (événement envoyé)
- Le terminal Next.js (webhook reçu)
- La base de données Supabase (plan mis à jour)

---

## Option 2: Simuler manuellement (Test rapide)

Si vous ne voulez pas installer Stripe CLI maintenant, vous pouvez simuler un webhook manuellement pour tester.

### Script de test

Créez un fichier `scripts/test-webhook.js`:

```javascript
// Test manuel d'un webhook Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function simulateCheckoutCompleted() {
  // 1. Créer une session de checkout de test
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: process.env.STRIPE_PRICE_PRO,
      quantity: 1,
    }],
    success_url: 'http://localhost:3000/success',
    cancel_url: 'http://localhost:3000/pricing',
    client_reference_id: 'user_TEST_ID', // Remplacez par votre user ID Clerk
    metadata: {
      userId: 'user_TEST_ID',
      plan: 'PRO',
    },
  });

  console.log('Session créée:', session.id);

  // 2. Simuler le paiement (en mode test)
  // Normalement c'est Stripe qui fait ça automatiquement
  console.log('Allez sur cette URL pour payer:', session.url);
}

simulateCheckoutCompleted();
```

---

## Option 3: En production

En production sur Vercel/Netlify, configurez le webhook directement dans Stripe Dashboard:

1. Allez sur https://dashboard.stripe.com/webhooks
2. Cliquez sur **Add endpoint**
3. URL: `https://votreapp.vercel.app/api/webhooks/stripe`
4. Événements à écouter:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiez le **Signing secret** et ajoutez-le dans les variables d'environnement Vercel

---

## Vérifier que ça fonctionne

### Dans les logs Next.js

Vous devriez voir:

```
📨 Webhook received: checkout.session.completed
✅ Checkout completed for user user_xxx, plan: PRO
✅ User user_xxx upgraded to PRO
```

### Dans Supabase

Vérifiez la table `users`:

```sql
SELECT id, email, plan, quota_limit, stripe_id, subscription_id
FROM users
WHERE id = 'user_xxx';
```

Le plan devrait être `PRO`, quota_limit `-1` (illimité), et stripe_id/subscription_id remplis.

---

## Dépannage

### Webhook reçu mais erreur 400

Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct dans `.env.local`.

### Webhook reçu mais pas de mise à jour DB

Vérifiez les logs d'erreur Supabase dans le terminal Next.js.

### Session créée mais webhook jamais reçu

En local sans Stripe CLI, c'est normal. Utilisez l'Option 1 (Stripe CLI).
