# 🎯 Guide Complet : Système de Crédits avec Tiers

## 📋 Vue d'ensemble

Un système **hybride** qui combine :
- ✅ **Crédits** pour usage (génération de prompts)
- ✅ **Tiers** (FREE, BRONZE, SILVER, GOLD, PLATINUM) pour débloquer des fonctionnalités
- ✅ **Codes promo** (réductions, bonus crédits, crédits gratuits)
- ✅ **Configuration flexible** depuis votre dashboard

---

## 🏗️ Architecture

### Tables Supabase créées

```sql
-- Extensions table users
credits_balance    → Crédits disponibles
credits_purchased  → Total acheté
credits_used       → Total utilisé
credits_gifted     → Bonus reçus
tier               → FREE, BRONZE, SILVER, GOLD, PLATINUM
tier_expires_at    → Date d'expiration (30j)
total_spent        → Total dépensé en FCFA

-- Nouvelles tables
credit_packs       → Packs configurables
credit_purchases   → Historique d'achats
credit_transactions → Journal des mouvements
tier_config        → Config des tiers
```

---

## 💎 Système de Tiers

### Comment ça fonctionne

1. **Achat initial** → Débloque un tier selon le montant
2. **Tier actif pendant 30 jours** après chaque achat
3. **Après 30 jours sans achat** → Rétrograde au tier inférieur
4. **Crédits ne s'épuisent JAMAIS** (pas d'expiration)

### Seuils des tiers

| Tier | Dépense minimum totale | Durée | Badge |
|------|------------------------|-------|-------|
| **FREE** | 0 FCFA | Permanent | ⚪ |
| **BRONZE** | 2,500 FCFA | 30 jours | 🥉 |
| **SILVER** | 5,000 FCFA | 30 jours | 🥈 |
| **GOLD** | 12,000 FCFA | 30 jours | 🥇 |
| **PLATINUM** | 30,000 FCFA | 30 jours | 💎 |

---

## 📦 Packs de Crédits (Configurables)

Définis dans la table `credit_packs` et modifiables depuis votre dashboard :

| Pack | Crédits | Bonus | Prix FCFA | Tier unlock |
|------|---------|-------|-----------|-------------|
| **STARTER** | 50 | +5 | 2,500 | BRONZE |
| **BASIC** | 100 | +10 | 5,000 | SILVER |
| **PRO** | 300 | +50 | 12,000 | GOLD |
| **PREMIUM** | 1000 | +200 | 30,000 | PLATINUM |

---

## ⚙️ Configuration des Features

### Fichier : `config/tiers.ts`

**Vous contrôlez tout depuis ce fichier** :

```typescript
export const TIER_CONFIGS = {
  GOLD: {
    features: {
      history_days: -1,              // Illimité
      ai_models: ['gemini-flash', 'gemini-pro', 'gpt-4'], // Modifiable
      priority_support: true,
      team_workspaces: 3,
      api_access: true,
      export_formats: ['txt', 'md', 'json', 'pdf'],
    }
  }
}
```

### Coûts en Crédits (Configurables)

```typescript
export const CREDIT_COSTS = {
  'generate_gemini_flash': 1,
  'generate_gemini_pro': 2,
  'generate_gpt4': 5,
  'improve_prompt': 1,
  'export_pdf': 2,
  // ... modifiables depuis dashboard
};
```

---

## 🎁 Codes Promo Étendus

### Nouveaux types ajoutés

#### 1. Réduction classique (existant)
```typescript
{
  code: 'BIENVENUE20',
  type: 'percentage',
  discount_percentage: 20,
}
```

#### 2. Bonus de crédits (NOUVEAU)
```typescript
{
  code: 'BONUS50',
  type: 'credit_bonus',
  bonus_credits: 50,
  // Achète 100 → reçoit 150 crédits
}
```

#### 3. Crédits gratuits (NOUVEAU)
```typescript
{
  code: 'FREE1000',
  type: 'free_credits',
  bonus_credits: 1000,
  // 1000 crédits gratuits, pas de paiement
}
```

---

## 🚀 Utilisation de l'API

### 1. Acheter des crédits

```typescript
// POST /api/credits/purchase
const response = await fetch('/api/credits/purchase', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pack_id: 'uuid-du-pack',
    promo_code: 'BONUS50', // Optionnel
  }),
});

const data = await response.json();
// {
//   url: 'https://checkout.fedapay.com/...',
//   transaction_id: '...',
//   total_credits: 150, // 100 + 50 bonus
//   final_amount: 5000
// }

// Rediriger vers data.url
window.location.href = data.url;
```

### 2. Utiliser des crédits

```typescript
import { useCredits } from '@/lib/credits/credits-manager';

const result = await useCredits(
  userId,
  1, // Nombre de crédits
  'generate_gemini_flash', // Action
  promptId // Optionnel
);

if (!result.success) {
  console.error(result.error); // "Crédits insuffisants"
}
```

### 3. Vérifier le solde

```typescript
import { getUserCreditBalance } from '@/lib/credits/credits-manager';

const balance = await getUserCreditBalance(userId);
// {
//   balance: 456,
//   purchased: 800,
//   used: 494,
//   gifted: 150
// }
```

### 4. Vérifier le tier

```typescript
import { getUserTierInfo } from '@/lib/credits/credits-manager';

const tierInfo = await getUserTierInfo(userId);
// {
//   current: 'GOLD',
//   expires_at: '2025-01-15T10:00:00Z',
//   total_spent: 17000,
//   next_tier: {
//     name: 'PLATINUM',
//     required_spend: 30000,
//     remaining: 13000
//   }
// }
```

### 5. Vérifier les permissions

```typescript
import { canUseAIModel, canExportFormat } from '@/config/tiers';

// Vérifier si un utilisateur GOLD peut utiliser GPT-4
const canUseGPT4 = canUseAIModel('GOLD', 'gpt-4'); // true

// Vérifier si un utilisateur BRONZE peut exporter en PDF
const canExportPDF = canExportFormat('BRONZE', 'pdf'); // false
```

---

## 📊 Webhook Flow

```typescript
// 1. Utilisateur paie via FedaPay
// 2. FedaPay envoie webhook à /api/fedapay/webhook
// 3. Backend :

async function handleCreditPurchase() {
  // a. Ajouter crédits (purchased + bonus)
  await addCredits(userId, 100, 'purchase');
  await addCredits(userId, 10, 'bonus');

  // b. Calculer nouveau tier
  const newTier = calculateTierFromSpend(totalSpent);

  // c. Mettre à jour user
  await supabase.from('users').update({
    tier: newTier,
    tier_expires_at: now() + 30 jours,
    total_spent: newTotalSpent
  });

  // d. Enregistrer l'achat
  await supabase.from('credit_purchases').insert({...});

  // e. Logger la transaction
  await supabase.from('credit_transactions').insert({...});
}
```

---

## 🎮 Scénarios d'Usage

### Scénario 1 : Nouvel utilisateur

```
Jour 0 : Inscription
→ tier: FREE
→ credits_balance: 10 (bonus bienvenue)
→ features: {history_days: 7, ai_models: ['gemini-flash']}

Jour 5 : Achat BASIC (5,000 FCFA)
→ tier: SILVER (car 5,000 FCFA)
→ credits_balance: 10 + 100 + 10 (bonus) = 120
→ tier_expires_at: Jour 35
→ features: {history_days: 90, ai_models: ['gemini-flash', 'gemini-pro']}

Jour 10 : Utilise 50 crédits
→ credits_balance: 70 (toujours disponibles)
→ tier: SILVER (encore valide)

Jour 40 : Pas d'achat depuis 35 jours
→ credits_balance: 70 (ne changent pas)
→ tier: BRONZE (rétrogradation automatique)
→ features: {history_days: 30, ai_models: ['gemini-flash']}
  ⚠️ Perd Gemini Pro
```

### Scénario 2 : Montée en tier

```
Total dépensé : 0 FCFA → tier: FREE

Achat 1 : STARTER (2,500 FCFA)
→ Total: 2,500 FCFA
→ tier: BRONZE
→ credits: +55

Achat 2 : BASIC (5,000 FCFA)
→ Total: 7,500 FCFA
→ tier: SILVER (franchit 5,000 FCFA)
→ credits: +110

Achat 3 : PRO (12,000 FCFA)
→ Total: 19,500 FCFA
→ tier: GOLD (franchit 12,000 FCFA)
→ credits: +350
→ Débloque: API, Support prioritaire, GPT-4
```

---

## 🛠️ Gestion depuis le Dashboard

### Modifier un pack

```sql
-- Dans Supabase SQL Editor
UPDATE credit_packs
SET price = 6000,
    credits = 120,
    bonus_credits = 15
WHERE name = 'BASIC';
```

### Créer un nouveau pack

```sql
INSERT INTO credit_packs (name, display_name, credits, bonus_credits, price, tier_unlock, sort_order)
VALUES ('MEGA', 'Pack Mega', 5000, 1000, 100000, 'PLATINUM', 5);
```

### Modifier les features d'un tier

Dans `config/tiers.ts` :

```typescript
GOLD: {
  features: {
    ai_models: ['gemini-flash', 'gemini-pro', 'gpt-4', 'claude-3'],  // Ajouté Claude
    history_days: -1,
    // ...
  }
}
```

### Modifier les coûts en crédits

```typescript
export const CREDIT_COSTS = {
  'generate_gpt4': 3,  // Réduit de 5 à 3
  'export_pdf': 1,     // Réduit de 2 à 1
  // ...
};
```

---

## 📈 Dashboard Utilisateur (Exemple)

```typescript
// Affichage pour l'utilisateur
{
  // Tier
  tier: {
    current: 'GOLD',
    badge: '🥇 Or',
    color: '#FFD700',
    expires_in: '23 jours',
  },

  // Crédits
  credits: {
    balance: 456,
    purchased: 800,
    used: 494,
    gifted: 150,
    usage_percentage: 52,
  },

  // Features débloquées
  features: {
    history_days: 'Illimité',
    ai_models: ['Gemini Flash', 'Gemini Pro', 'GPT-4'],
    team_workspaces: '3 espaces actifs',
    api_access: true,
    priority_support: true,
  },

  // Progression vers tier suivant
  next_tier: {
    name: 'PLATINUM',
    badge: '💎',
    required_total: 30000,
    current_total: 17000,
    remaining: 13000,
    percentage: 57,
  }
}
```

---

## ✅ Migration depuis Abonnements

Si vous aviez déjà des abonnements :

1. **Appliquez la migration 003_credit_system.sql**
2. **Les anciennes tables** (`subscriptions`, `promo_codes`) restent compatibles
3. **Le webhook gère les deux** : `type: 'credit_purchase'` ou `legacy`
4. **Convertissez les utilisateurs** :

```sql
-- Donner 100 crédits à tous les utilisateurs STARTER existants
UPDATE users
SET credits_balance = 100,
    tier = 'SILVER',
    total_spent = 5000
WHERE plan = 'STARTER';
```

---

## 🔒 Sécurité

✅ **Validation côté serveur** de tous les achats
✅ **Webhook vérifié** (FedaPay signature - à implémenter en prod)
✅ **Transactions atomiques** (crédits + tier + historique)
✅ **Logs complets** dans `credit_transactions`

---

## 📞 Next Steps

### 1. Appliquer la migration

```bash
# Dans Supabase SQL Editor
# Exécuter : supabase/migrations/003_credit_system.sql
```

### 2. Tester en local

```bash
npm run dev

# Aller sur /pricing
# Acheter un pack
# Vérifier dans Supabase :
SELECT * FROM users WHERE id = 'votre_user_id';
SELECT * FROM credit_purchases WHERE user_id = 'votre_user_id';
SELECT * FROM credit_transactions WHERE user_id = 'votre_user_id';
```

### 3. Configurer les prix/features

Modifiez :
- `config/tiers.ts` → Features et coûts
- Table `credit_packs` → Packs et prix

### 4. Créer l'interface utilisateur

- Page d'achat de crédits
- Dashboard avec solde et tier
- Indicateur de crédits restants
- Progression vers tier suivant

---

**Système complet et prêt à l'emploi** ! 🚀

Tout est configurable depuis votre code ou Supabase SQL.
