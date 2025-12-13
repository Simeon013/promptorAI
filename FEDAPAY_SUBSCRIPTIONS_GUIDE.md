# 🚀 Guide Complet : Abonnements et Codes Promo avec FedaPay

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation et configuration](#installation-et-configuration)
4. [Codes promo](#codes-promo)
5. [Interface de paiement personnalisée](#interface-de-paiement-personnalisée)
6. [Gestion des abonnements](#gestion-des-abonnements)
7. [Tests](#tests)
8. [Production](#production)

---

## 🎯 Vue d'ensemble

Ce système implémente :

✅ **Abonnements récurrents** (gérés manuellement, FedaPay ne supporte pas les abonnements automatiques)
✅ **Codes promotionnels** (pourcentage, montant fixe, essais gratuits)
✅ **Interface de paiement personnalisée** avec Checkout.js
✅ **Historique complet** des paiements et utilisations de codes promo
✅ **Support multi-provider** (Stripe + FedaPay)

---

## 🏗️ Architecture

### Schéma de base de données

```sql
-- Table users (existante, étendue)
ALTER TABLE users ADD COLUMN fedapay_customer_id TEXT;
ALTER TABLE users ADD COLUMN payment_provider TEXT DEFAULT 'stripe';

-- Nouvelles tables
subscriptions          → Abonnements récurrents
promo_codes            → Codes promotionnels
promo_code_uses        → Historique d'utilisation
payment_history        → Historique des paiements
```

### Flux de paiement

```
1. Utilisateur clique "S'abonner"
   ↓
2. Composant FedaPayCheckout s'affiche
   ↓
3. (Optionnel) Valide code promo via API
   ↓
4. Crée transaction FedaPay
   ↓
5. Utilisateur paie (carte ou Mobile Money)
   ↓
6. FedaPay envoie webhook → /api/fedapay/webhook
   ↓
7. Backend crée :
   - Abonnement dans table subscriptions
   - Enregistrement dans payment_history
   - Application du code promo (si présent)
   - Mise à jour de l'utilisateur (plan, quota)
   ↓
8. Redirection vers /success
```

---

## ⚙️ Installation et configuration

### 1. Appliquer la migration SQL

Allez dans **Supabase → SQL Editor** et exécutez le fichier :

```bash
supabase/migrations/002_subscriptions_and_promos.sql
```

Cela créera :
- Tables `subscriptions`, `promo_codes`, `promo_code_uses`, `payment_history`
- Indexes pour performances
- Triggers pour `updated_at`
- Fonction `expire_subscriptions()` (pour cron job)
- 4 codes promo de test

### 2. Variables d'environnement

Ajoutez dans `.env.local` :

```env
# FedaPay
FEDAPAY_SECRET_KEY=sk_sandbox_VOTRE_CLE
FEDAPAY_PUBLIC_KEY=pk_sandbox_VOTRE_CLE
FEDAPAY_ENVIRONMENT=sandbox

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Vérifier les fichiers créés

```
✅ lib/subscriptions/promo-codes.ts                    → Helpers codes promo
✅ components/payment/FedaPayCheckout.tsx              → Interface de paiement
✅ app/api/fedapay/create-checkout-session/route.ts    → Création transaction
✅ app/api/fedapay/webhook/route.ts                    → Webhook FedaPay
✅ app/api/promo-codes/validate/route.ts               → Validation codes promo
✅ supabase/migrations/002_subscriptions_and_promos.sql → Migration SQL
```

---

## 🎟️ Codes promo

### Types de codes promo

1. **Pourcentage** (`percentage`)
   ```typescript
   {
     type: 'percentage',
     discount_percentage: 10, // 10% de réduction
   }
   ```

2. **Montant fixe** (`fixed_amount`)
   ```typescript
   {
     type: 'fixed_amount',
     discount_amount: 2000, // 2000 FCFA de réduction
   }
   ```

3. **Essai gratuit** (`free_trial`)
   ```typescript
   {
     type: 'free_trial',
     free_trial_days: 14, // 14 jours gratuits (100% off)
   }
   ```

### Codes promo pré-créés

| Code          | Type       | Réduction | Limite | Expire le  |
|---------------|------------|-----------|--------|------------|
| `BIENVENUE10` | Percentage | 10%       | ∞      | 2026-12-31 |
| `LAUNCH50`    | Percentage | 50%       | 100    | 2025-12-31 |
| `ESSAI14J`    | Free trial | 14 jours  | ∞      | ∞          |
| `NOEL2024`    | Fixed      | 2000 FCFA | 500    | 2025-12-25 |

### Créer un code promo

```typescript
import { createPromoCode } from '@/lib/subscriptions/promo-codes';

const result = await createPromoCode({
  code: 'BLACKFRIDAY',
  name: 'Black Friday 2025',
  description: '70% de réduction',
  type: 'percentage',
  discount_percentage: 70,
  applicable_plans: ['STARTER', 'PRO'],
  max_uses: 1000,
  max_uses_per_user: 1,
  valid_from: new Date('2025-11-25').toISOString(),
  valid_until: new Date('2025-11-30').toISOString(),
  is_active: true,
});

if (result.success) {
  console.log('Code créé:', result.promo_code);
}
```

### Valider un code promo

**API Endpoint** :
```
GET /api/promo-codes/validate?code=BIENVENUE10&plan=STARTER&amount=5000
```

**Réponse** :
```json
{
  "valid": true,
  "discount_amount": 500,
  "final_amount": 4500,
  "promo_code": {
    "id": "...",
    "code": "BIENVENUE10",
    "name": "Réduction de bienvenue",
    "type": "percentage"
  }
}
```

---

## 💳 Interface de paiement personnalisée

### Utilisation du composant

```tsx
import { FedaPayCheckout } from '@/components/payment/FedaPayCheckout';

export default function PricingPage() {
  return (
    <FedaPayCheckout
      plan="STARTER"
      amount={5000} // 5000 FCFA
      onSuccess={() => {
        console.log('Paiement réussi !');
        window.location.href = '/success';
      }}
      onCancel={() => {
        console.log('Paiement annulé');
      }}
    />
  );
}
```

### Fonctionnalités

✅ Validation de codes promo en temps réel
✅ Affichage du prix original et du prix réduit
✅ Support carte bancaire + Mobile Money
✅ Gestion d'erreurs
✅ Interface responsive

---

## 📊 Gestion des abonnements

### Récupérer l'abonnement d'un utilisateur

```typescript
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'active')
  .single();

if (subscription) {
  console.log('Plan:', subscription.plan);
  console.log('Expire le:', subscription.current_period_end);
  console.log('Montant:', subscription.amount, subscription.currency);
}
```

### Expirer les abonnements (Cron Job)

**À configurer sur Vercel ou Supabase Edge Functions** :

```typescript
// app/api/cron/expire-subscriptions/route.ts
export async function GET() {
  const { error } = await supabase.rpc('expire_subscriptions');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

**Vercel Cron** (`vercel.json`) :
```json
{
  "crons": [{
    "path": "/api/cron/expire-subscriptions",
    "schedule": "0 0 * * *"
  }]
}
```

### Annuler un abonnement

```typescript
const { error } = await supabase
  .from('subscriptions')
  .update({
    status: 'cancelled',
    cancelled_at: new Date().toISOString(),
  })
  .eq('id', subscriptionId);

// Remettre l'utilisateur en FREE
await supabase
  .from('users')
  .update({
    plan: 'FREE',
    quota_limit: 10,
  })
  .eq('id', userId);
```

---

## 🧪 Tests

### 1. Tester avec un code promo

1. Allez sur `http://localhost:3000/pricing`
2. Cliquez sur "S'abonner" (plan STARTER)
3. Entrez le code promo : `BIENVENUE10`
4. Cliquez sur "Appliquer"
5. Vérifiez la réduction : **5000 FCFA → 4500 FCFA**
6. Procédez au paiement

### 2. Tester le paiement

**Carte bancaire de test** :
```
Numéro : 4000 0000 0000 0002
CVC : 123
Date : 12/25
Nom : TEST USER
```

**Mobile Money (MTN)** :
```
Numéro : +229 96 00 00 01
Code OTP : 000000
```

### 3. Vérifier dans Supabase

Après un paiement réussi, vérifiez :

```sql
-- Abonnement créé
SELECT * FROM subscriptions WHERE user_id = 'votre_user_id';

-- Paiement enregistré
SELECT * FROM payment_history WHERE user_id = 'votre_user_id';

-- Code promo utilisé (si applicable)
SELECT * FROM promo_code_uses WHERE user_id = 'votre_user_id';

-- Utilisateur mis à jour
SELECT plan, quota_limit, payment_provider FROM users WHERE id = 'votre_user_id';
```

---

## 🚀 Production

### 1. Passer en mode Live

Changez dans `.env` :

```env
FEDAPAY_SECRET_KEY=sk_live_VOTRE_CLE_LIVE
FEDAPAY_PUBLIC_KEY=pk_live_VOTRE_CLE_LIVE
FEDAPAY_ENVIRONMENT=live
NEXT_PUBLIC_SITE_URL=https://votredomaine.com
```

### 2. Configurer le webhook sur FedaPay

1. Allez sur **https://app.fedapay.com**
2. **Settings** → **Webhooks**
3. Ajoutez l'URL : `https://votredomaine.com/api/fedapay/webhook`
4. Cochez ces événements :
   - `transaction.approved`
   - `transaction.canceled`
   - `transaction.declined`

### 3. Variables Vercel

Ajoutez ces variables dans **Vercel Dashboard** :

```
FEDAPAY_SECRET_KEY=sk_live_...
FEDAPAY_PUBLIC_KEY=pk_live_...
FEDAPAY_ENVIRONMENT=live
NEXT_PUBLIC_SITE_URL=https://votredomaine.com
```

### 4. Créer des codes promo de production

Supprimez les codes de test et créez des codes de production :

```sql
-- Désactiver les codes de test
UPDATE promo_codes SET is_active = false WHERE code IN ('BIENVENUE10', 'LAUNCH50', 'ESSAI14J', 'NOEL2024');

-- Créer de vrais codes
INSERT INTO promo_codes (code, name, description, type, discount_percentage, applicable_plans, max_uses, valid_until)
VALUES
  ('NOUVEAU10', 'Nouveau client', '10% de réduction', 'percentage', 10, ARRAY['STARTER', 'PRO'], NULL, '2026-12-31'),
  ('PRO3MOIS', '3 mois gratuits', 'Essai gratuit 90 jours', 'free_trial', NULL, ARRAY['PRO'], 50, '2025-12-31');
```

---

## 📞 Support

### Logs utiles

```bash
# Voir les logs Vercel
vercel logs

# Voir les logs webhook FedaPay
# Dans la console du navigateur : F12 → Network → fedapay
```

### Problèmes courants

**Code promo invalide** :
- Vérifier que le code existe dans `promo_codes`
- Vérifier qu'il est actif (`is_active = true`)
- Vérifier les dates de validité
- Vérifier le plan (`applicable_plans`)
- Vérifier le nombre d'utilisations

**Webhook ne se déclenche pas** :
- En local : utiliser ngrok
- En production : vérifier l'URL dans FedaPay Dashboard
- Vérifier les logs serveur

**Abonnement non créé** :
- Vérifier que la migration SQL a été appliquée
- Vérifier les logs dans le webhook
- Vérifier les permissions Supabase (RLS désactivé en dev)

---

## ✅ Checklist de déploiement

- [ ] Migration SQL appliquée dans Supabase
- [ ] Variables d'environnement configurées (Vercel)
- [ ] Webhook FedaPay configuré (URL de production)
- [ ] Codes promo de production créés
- [ ] Tests en mode sandbox réussis
- [ ] Tests en mode live réussis
- [ ] Cron job configuré pour expirer les abonnements
- [ ] Emails de renouvellement configurés (via Brevo)

---

**Prochaine étape** : Configurer les emails de renouvellement automatiques ! 📧
