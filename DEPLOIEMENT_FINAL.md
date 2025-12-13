# 🚀 Guide de Déploiement Final - Système de Crédits FedaPay

## ✅ Récapitulatif Complet

Vous disposez maintenant d'un **système de crédits complet** avec :
- ✅ Packs de crédits configurables
- ✅ Système de tiers automatique (FREE → PLATINUM)
- ✅ Codes promo étendus (réduction, bonus, gratuit)
- ✅ Paiement FedaPay one-time
- ✅ APIs complètes
- ✅ Composants React prêts
- ✅ Contrôle total depuis votre dashboard

---

## 📁 Fichiers Créés

### Backend
| Fichier | Description |
|---------|-------------|
| `supabase/migrations/003_credit_system.sql` | Migration SQL (4 tables + packs + tiers) |
| `lib/credits/credits-manager.ts` | 13 fonctions gestion crédits |
| `config/tiers.ts` | **Configuration features/modèles/coûts** |
| `app/api/credits/purchase/route.ts` | Achat de crédits |
| `app/api/credits/packs/route.ts` | Liste des packs |
| `app/api/credits/balance/route.ts` | Solde + tier utilisateur |
| `app/api/fedapay/webhook/route.ts` | Webhook (mis à jour) |
| `app/api/promo-codes/validate/route.ts` | Validation promo (corrigé) |

### Frontend
| Fichier | Description |
|---------|-------------|
| `components/credits/CreditPackCard.tsx` | Card pack avec promo |
| `components/credits/CreditBalance.tsx` | Affichage solde + tier |

### Documentation
| Fichier | Description |
|---------|-------------|
| `CREDIT_SYSTEM_GUIDE.md` | Guide complet architecture |
| `CREDIT_SYSTEM_SUMMARY.md` | Résumé rapide |
| `DEPLOIEMENT_FINAL.md` | Ce fichier |

---

## 🎯 Comment ça Fonctionne

### Flux Utilisateur Complet

```
1. Page /credits/purchase
   ↓
2. GET /api/credits/packs → Affiche packs
   ↓
3. Utilisateur clique "Acheter BASIC" + code "BONUS50"
   ↓
4. POST /api/credits/purchase {pack_id, promo_code}
   ↓
5. Backend :
   - Récupère pack (100 crédits, 5000 FCFA)
   - Valide code BONUS50 (type: credit_bonus, +50 crédits)
   - Crée transaction FedaPay (metadata complète)
   - Retourne {url, total_credits: 150}
   ↓
6. Redirection vers FedaPay checkout
   ↓
7. Paiement (carte ou Mobile Money)
   ↓
8. Webhook → /api/fedapay/webhook
   ↓
9. Backend :
   - Ajoute 100 crédits (purchase)
   - Ajoute 50 crédits (bonus)
   - total_spent += 5000 → tier = SILVER
   - tier_expires_at = +30 jours
   - Enregistre dans credit_purchases
   - Log dans credit_transactions
   ↓
10. Utilisateur a :
    - 150 crédits disponibles
    - Tier SILVER (🥈)
    - Historique 90j
    - Gemini Pro débloqué
```

### Système de Tiers

**Calcul automatique basé sur `total_spent`** :

```typescript
total_spent >= 30000 → PLATINUM (💎)
total_spent >= 12000 → GOLD (🥇)
total_spent >= 5000  → SILVER (🥈)
total_spent >= 2500  → BRONZE (🥉)
sinon                → FREE (⚪)
```

**Expiration** : 30 jours après le dernier achat
**Crédits** : Ne s'épuisent JAMAIS

---

## ⚙️ Configuration

### Ce que VOUS contrôlez

#### 1. Dans `config/tiers.ts` (sans toucher à la DB)

```typescript
// Modèles IA par tier
GOLD: {
  features: {
    ai_models: ['gemini-flash', 'gemini-pro', 'gpt-4'],
    // Ajoutez 'claude-3', 'gpt-4-turbo', etc.
  }
}

// Coûts en crédits
export const CREDIT_COSTS = {
  'generate_gpt4': 5,      // Modifiable
  'generate_gemini_pro': 2,
  'export_pdf': 2,
  // Ajoutez vos actions...
};
```

#### 2. Dans Supabase (SQL)

**Modifier un pack** :
```sql
UPDATE credit_packs
SET price = 6000,
    credits = 120,
    bonus_credits = 15
WHERE name = 'BASIC';
```

**Créer un code promo** :
```sql
-- Bonus de crédits
INSERT INTO promo_codes (code, name, type, bonus_credits, applicable_packs, max_uses)
VALUES ('MEGA100', 'Bonus 100', 'credit_bonus', 100, ARRAY['PRO', 'PREMIUM'], 50);

-- Réduction
INSERT INTO promo_codes (code, name, type, discount_percentage, applicable_packs)
VALUES ('PROMO20', 'Réduction 20%', 'percentage', 20, ARRAY['BASIC', 'PRO']);

-- Crédits gratuits
INSERT INTO promo_codes (code, name, type, bonus_credits, applicable_packs, max_uses)
VALUES ('FREE500', 'Crédits gratuits', 'free_credits', 500, ARRAY['STARTER'], 100);
```

---

## 🚀 Déploiement Étape par Étape

### Étape 1 : Migration SQL (5 min)

```bash
1. Ouvrir Supabase Dashboard
2. SQL Editor → New Query
3. Copier supabase/migrations/003_credit_system.sql
4. Run
5. Vérifier : Table Editor → 4 nouvelles tables
```

**Tables créées** :
- `credit_packs` (4 packs)
- `credit_purchases`
- `credit_transactions`
- `tier_config` (5 tiers)

### Étape 2 : Créer une Page de Test (10 min)

```tsx
// app/test-credits/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { CreditPackCard } from '@/components/credits/CreditPackCard';

export default function TestCreditsPage() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/credits/packs')
      .then(r => r.json())
      .then(data => setPacks(data.packs));
  }, []);

  const handlePurchase = async (packId: string, promoCode?: string) => {
    setLoading(true);

    try {
      const res = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pack_id: packId,
          promo_code: promoCode
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Redirection vers FedaPay
        window.location.href = data.url;
      } else {
        alert(data.error);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l achat');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Acheter des Credits</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packs.map(pack => (
          <CreditPackCard
            key={pack.id}
            pack={pack}
            onPurchase={handlePurchase}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}
```

### Étape 3 : Tester (15 min)

```bash
# Lancer le serveur
npm run dev

# Aller sur http://localhost:3000/test-credits

# Tester achat :
1. Cliquer sur "Acheter" (pack BASIC)
2. Entrer code promo : BIENVENUE10
3. Payer avec carte test : 4000 0000 0000 0002
4. Vérifier dans Supabase
```

**Vérification Supabase** :
```sql
-- Solde et tier
SELECT id, credits_balance, tier, total_spent, tier_expires_at
FROM users
WHERE id = 'votre_user_id';

-- Dernier achat
SELECT * FROM credit_purchases
WHERE user_id = 'votre_user_id'
ORDER BY created_at DESC
LIMIT 1;

-- Transactions
SELECT * FROM credit_transactions
WHERE user_id = 'votre_user_id'
ORDER BY created_at DESC
LIMIT 5;
```

### Étape 4 : Créer Page Dashboard (20 min)

```tsx
// app/dashboard/credits/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { CreditBalance } from '@/components/credits/CreditBalance';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CreditsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/credits/balance')
      .then(r => r.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mes Credits</h1>
        <Link href="/credits/purchase">
          <Button size="lg">Acheter des credits</Button>
        </Link>
      </div>

      <CreditBalance data={data} />

      {/* Historique des achats */}
      {/* À implémenter selon vos besoins */}
    </div>
  );
}
```

### Étape 5 : Production (Vercel)

**Variables d'environnement** :
```bash
# Vercel Dashboard → Settings → Environment Variables
FEDAPAY_SECRET_KEY=sk_live_VOTRE_CLE_LIVE
FEDAPAY_PUBLIC_KEY=pk_live_VOTRE_CLE_LIVE
FEDAPAY_ENVIRONMENT=live
NEXT_PUBLIC_SITE_URL=https://votredomaine.com
```

**Webhook FedaPay** :
1. https://app.fedapay.com → Settings → Webhooks
2. URL : `https://votredomaine.com/api/fedapay/webhook`
3. Events : ☑️ `transaction.approved`, `transaction.canceled`, `transaction.declined`

**Deploy** :
```bash
git add .
git commit -m "Systeme de credits complete"
git push
# Vercel déploie automatiquement
```

---

## 📊 APIs Disponibles

### GET /api/credits/packs
Récupère tous les packs actifs

### GET /api/credits/balance
Récupère solde + tier de l'utilisateur

### POST /api/credits/purchase
Achète un pack (retourne URL FedaPay)

### GET /api/promo-codes/validate
Valide un code promo

---

## 🔍 Debugging

### Webhook ne se déclenche pas en local

```bash
# Utiliser ngrok
ngrok http 3000

# Dans FedaPay dashboard, webhook URL :
https://xxxxx.ngrok.io/api/fedapay/webhook
```

### Vérifier les logs

```bash
# Vercel
vercel logs --follow

# Ou dans la console npm run dev
```

### Recalculer un tier manuellement

```sql
UPDATE users
SET tier = CASE
  WHEN total_spent >= 30000 THEN 'PLATINUM'
  WHEN total_spent >= 12000 THEN 'GOLD'
  WHEN total_spent >= 5000 THEN 'SILVER'
  WHEN total_spent >= 2500 THEN 'BRONZE'
  ELSE 'FREE'
END,
tier_expires_at = NOW() + INTERVAL '30 days'
WHERE id = 'user_xxx';
```

---

## ✅ Checklist Finale

- [ ] Migration 003_credit_system.sql appliquée
- [ ] 4 packs visibles dans table `credit_packs`
- [ ] 5 tiers visibles dans table `tier_config`
- [ ] Page de test créée et fonctionnelle
- [ ] Achat test réussi en sandbox
- [ ] Crédits ajoutés correctement
- [ ] Tier calculé automatiquement
- [ ] Dashboard créé
- [ ] Variables Vercel configurées (production)
- [ ] Webhook FedaPay configuré (production)
- [ ] Tests production réussis

---

## 🎉 Félicitations !

Votre système de crédits est **complet et opérationnel** !

**Vous contrôlez** :
- ✅ Prix des packs (Supabase)
- ✅ Modèles IA disponibles (`config/tiers.ts`)
- ✅ Features par tier (`config/tiers.ts`)
- ✅ Coûts en crédits (`config/tiers.ts`)
- ✅ Codes promo (Supabase)

**Documentation** :
- [CREDIT_SYSTEM_GUIDE.md](CREDIT_SYSTEM_GUIDE.md) → Architecture complète
- [CREDIT_SYSTEM_SUMMARY.md](CREDIT_SYSTEM_SUMMARY.md) → Résumé rapide

Bon déploiement ! 🚀
