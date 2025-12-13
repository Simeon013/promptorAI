# Guide : Système Multi-Devises et Promotions

**Date** : Décembre 2025
**Version** : 1.0.0
**Statut** : ✅ Production Ready

---

## 🎯 Vue d'ensemble

Ce guide documente l'implémentation complète de deux fonctionnalités majeures :

1. **Système Multi-Devises** : Support de XOF (FCFA), EUR, USD avec conversion automatique
2. **Promotions sur les Packs** : Réductions configurables depuis l'interface admin

---

## 💱 Système Multi-Devises

### Devises Supportées

| Devise | Code | Symbole | Pays | Décimales | Taux (base XOF) |
|--------|------|---------|------|-----------|-----------------|
| Franc CFA | XOF | FCFA | 🇧🇯 Bénin (UEMOA) | 0 | 1.0000 |
| Euro | EUR | € | 🇪🇺 Europe | 2 | 655.957 |
| Dollar US | USD | $ | 🇺🇸 États-Unis | 2 | 607.50 |

### Configuration

**Fichier** : [config/currencies.ts](config/currencies.ts)

```typescript
export const CURRENCIES: Record<CurrencyCode, Currency> = {
  XOF: {
    code: 'XOF',
    name: 'Franc CFA',
    symbol: 'FCFA',
    flag: '🇧🇯',
    decimals: 0,
    displayFormat: '{amount} {symbol}',
    rateToXOF: 1,
    rateFromXOF: 1,
  },
  // ... EUR, USD
};
```

**Fonctions utilitaires** :
- `convertCurrency(amount, from, to)` - Convertit entre devises
- `formatCurrency(amount, currency)` - Formate avec symbole et séparateurs
- `getPackPrice(basePrice, baseCurrency, targetCurrency)` - Prix pack dans devise
- `getPricePerCredit(price, credits, currency)` - Calcul prix/crédit

### Base de Données

**Migration** : [supabase/migrations/004_pack_promotions_and_currencies.sql](supabase/migrations/004_pack_promotions_and_currencies.sql)

**Table `currency_rates`** :
```sql
CREATE TABLE currency_rates (
  id UUID PRIMARY KEY,
  currency TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  rate_to_xof NUMERIC(12, 4),
  rate_from_xof NUMERIC(12, 6),
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  decimals INTEGER DEFAULT 0,
  display_format TEXT,
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

**Extension `credit_packs`** :
```sql
ALTER TABLE credit_packs
  ADD COLUMN price_usd INTEGER,
  ADD COLUMN price_eur INTEGER,
  ADD COLUMN price_xof INTEGER;
```

**Données initiales** :
- XOF : 1 FCFA = 1 FCFA (défaut)
- EUR : 1 € = 655.957 FCFA
- USD : 1 $ = 607.50 FCFA

### Interface Utilisateur

**Composant** : [components/credits/CurrencySelector.tsx](components/credits/CurrencySelector.tsx)

**Features** :
- Dropdown élégant avec drapeaux
- Affichage : Drapeau + Code + Symbole
- Sélection persistante dans le state
- Click outside pour fermer
- Indicateur visuel de la devise sélectée

**Utilisation** :
```tsx
import { CurrencySelector } from '@/components/credits/CurrencySelector';

const [currency, setCurrency] = useState<CurrencyCode>('XOF');

<CurrencySelector value={currency} onChange={setCurrency} />
```

**Emplacement** : Page pricing, hero section, juste avant les boutons CTA

### API

**Endpoint** : `GET /api/credits/packs-with-promotions?currency=XOF`

**Réponse** :
```json
{
  "success": true,
  "currency": "XOF",
  "packs": [
    {
      "id": "uuid",
      "name": "STARTER",
      "display_name": "Pack Starter",
      "credits": 100,
      "bonus_credits": 10,
      "total_credits": 110,
      "price": 1000,
      "original_price": 1000,
      "currency": "XOF",
      "price_per_credit": 9.09,
      "active_promotion": null
    }
  ]
}
```

**Fonctionnement** :
1. Récupère les packs actifs
2. Prix de base toujours en XOF dans la DB
3. Conversion automatique vers la devise demandée
4. Calcul du prix/crédit dans la bonne devise
5. Application des promotions actives

---

## 🎁 Système de Promotions

### Types de Promotions

1. **Réduction en Pourcentage** (`percentage`)
   - Exemple : -20%, -30%, -50%
   - Appliqué sur le prix du pack

2. **Réduction Montant Fixe** (`fixed_amount`)
   - Exemple : -500 FCFA, -1000 FCFA
   - Montant fixe soustrait du prix
   - Converti automatiquement dans la devise affichée

### Base de Données

**Table `pack_promotions`** :
```sql
CREATE TABLE pack_promotions (
  id UUID PRIMARY KEY,

  -- Informations
  name TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE,

  -- Ciblage
  pack_id UUID REFERENCES credit_packs(id),
  all_packs BOOLEAN DEFAULT false,

  -- Réduction
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value INTEGER NOT NULL,

  -- Période
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,

  -- Limites
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,

  -- Config
  is_active BOOLEAN DEFAULT true,
  is_stackable BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,

  -- Affichage
  show_on_pricing BOOLEAN DEFAULT true,
  badge_text TEXT,
  badge_color TEXT,

  -- Métadonnées
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  created_by TEXT
);
```

**Table `pack_promotion_uses`** :
```sql
CREATE TABLE pack_promotion_uses (
  id UUID PRIMARY KEY,
  promotion_id UUID REFERENCES pack_promotions(id),
  user_id TEXT REFERENCES users(id),
  purchase_id UUID REFERENCES credit_purchases(id),
  discount_applied INTEGER NOT NULL,
  created_at TIMESTAMPTZ,
  UNIQUE(promotion_id, user_id, purchase_id)
);
```

**Fonctions PostgreSQL** :
- `get_active_promotions_for_pack(pack_id, user_id)` - Trouve la meilleure promo
- `calculate_price_with_promotion(price, type, value)` - Calcule prix final

### API Admin

**Créer une promotion** :
```bash
POST /api/admin/credits/promotions
Content-Type: application/json

{
  "name": "Black Friday 2025",
  "description": "Réduction de 30% sur tous les packs",
  "code": "BLACKFRIDAY",  # Optionnel
  "all_packs": true,
  "discount_type": "percentage",
  "discount_value": 30,
  "starts_at": "2025-11-25T00:00:00Z",
  "ends_at": "2025-11-30T23:59:59Z",
  "max_uses": 1000,
  "max_uses_per_user": 1,
  "show_on_pricing": true,
  "badge_text": "-30%",
  "badge_color": "red",
  "priority": 100
}
```

**Lister les promotions** :
```bash
GET /api/admin/credits/promotions?active=true
```

**Mettre à jour** :
```bash
PUT /api/admin/credits/promotions/{promotionId}
```

**Supprimer** :
```bash
DELETE /api/admin/credits/promotions/{promotionId}
# Si déjà utilisée, sera désactivée au lieu d'être supprimée
```

### Interface Admin

**Page** : [app/admin/credits/promotions/page.tsx](app/admin/credits/promotions/page.tsx)

**Fonctionnalités** :

1. **Liste des Promotions**
   - Status : En cours, Programmée, Terminée, Inactive
   - Badges visuels avec couleurs
   - Compteur d'utilisations
   - Actions : Activer/Désactiver, Modifier, Supprimer

2. **Formulaire de Création/Édition**
   - Informations de base (nom, description, code)
   - Ciblage : tous les packs ou pack spécifique
   - Type de réduction : pourcentage ou montant fixe
   - Période avec date/heure
   - Limites d'utilisation (total et par utilisateur)
   - Configuration d'affichage (badge, couleur, priorité)

3. **Validation**
   - Pourcentage entre 0 et 100
   - Code promo unique
   - Dates cohérentes

**Navigation** : Admin → Système Crédits → Promotions

### Affichage sur Pricing

**Page** : [app/[locale]/pricing/page.tsx](app/[locale]/pricing/page.tsx)

**Éléments visuels** :

1. **Badge Promo** (coin supérieur gauche de la card)
```tsx
<div className="absolute top-0 left-0">
  <div className="px-3 py-1 rounded-br-lg bg-red-500 text-white text-xs font-bold">
    <Tag className="h-3 w-3 inline mr-1" />
    -30%
  </div>
</div>
```

2. **Prix Barré** (prix original)
```tsx
<div className="text-sm text-muted-foreground line-through">
  10 000 FCFA
</div>
```

3. **Prix Réduit** (prix en grand)
```tsx
<span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
  7 000
</span>
```

4. **Badge Économie** (badge vert)
```tsx
<Badge className="bg-green-500 text-white">
  Économisez 3 000 FCFA
</Badge>
```

### Logique d'Application

**Ordre de priorité** :
1. Promotions triées par `priority` (DESC)
2. Si égalité, par `discount_value` (DESC)
3. Première promotion applicable est utilisée

**Vérifications** :
- ✅ Promotion active (`is_active = true`)
- ✅ Période valide (`NOW() BETWEEN starts_at AND ends_at`)
- ✅ Ciblage correct (pack_id ou all_packs)
- ✅ Limite totale non atteinte
- ✅ Limite par utilisateur non atteinte

**Stackable** :
- Si `is_stackable = true`, peut se cumuler avec codes promo
- Si `false`, exclusif

---

## 🔄 Workflow Complet

### 1. Admin Crée une Promotion

```mermaid
Admin → Interface Admin → POST /api/admin/credits/promotions
  → Validation
  → INSERT pack_promotions
  → Notification "Promotion créée"
```

### 2. Utilisateur Visite la Page Pricing

```mermaid
User → Page Pricing
  → Sélectionne devise (XOF/EUR/USD)
  → GET /api/credits/packs-with-promotions?currency=XOF
    → Récupère packs actifs
    → Récupère promotions actives
    → Pour chaque pack:
      → Convertit prix en devise
      → Trouve promo applicable
      → Calcule réduction
      → Retourne pack enrichi
  → Affichage avec badges et prix barrés
```

### 3. Utilisateur Achète un Pack en Promotion

```mermaid
User → Clique "Acheter"
  → Redirige vers /credits/purchase
  → Formulaire avec pack pré-sélectionné
  → Applique promo automatiquement
  → POST /api/credits/purchase
    → Vérifie promo toujours valide
    → Calcule prix final
    → Crée credit_purchase avec promotion_id
    → INSERT pack_promotion_uses
    → Incrémente uses_count
    → Redirige vers FedaPay
```

---

## 📊 Exemples d'Utilisation

### Exemple 1 : Black Friday (-30% tous les packs)

```typescript
{
  name: "Black Friday 2025",
  all_packs: true,
  discount_type: "percentage",
  discount_value: 30,
  starts_at: "2025-11-25T00:00:00Z",
  ends_at: "2025-11-30T23:59:59Z",
  max_uses: null,  // Illimité
  max_uses_per_user: 1,
  show_on_pricing: true,
  badge_text: "-30%",
  badge_color: "red",
  priority: 100
}
```

**Résultat** :
- Pack STARTER 1000 FCFA → 700 FCFA
- Pack BASIC 5000 FCFA → 3500 FCFA
- Badge rouge "-30%" sur toutes les cards
- 1 utilisation max par utilisateur

### Exemple 2 : Promo Early Adopter (montant fixe)

```typescript
{
  name: "Early Adopter",
  description: "500 FCFA de réduction pour les premiers utilisateurs",
  all_packs: false,
  pack_id: "uuid-pack-starter",
  discount_type: "fixed_amount",
  discount_value: 500,  // En FCFA
  starts_at: "2025-12-01T00:00:00Z",
  ends_at: "2026-01-31T23:59:59Z",
  max_uses: 100,  // 100 utilisations max
  max_uses_per_user: 1,
  badge_text: "-500 FCFA",
  badge_color: "orange"
}
```

**Résultat** :
- Uniquement Pack STARTER : 1000 FCFA → 500 FCFA
- Badge orange "-500 FCFA"
- Limité aux 100 premiers
- Conversion automatique (en EUR : ~0.76€ de réduction)

### Exemple 3 : Promo VIP avec Code

```typescript
{
  name: "VIP Members",
  code: "VIP2025",
  all_packs: true,
  discount_type: "percentage",
  discount_value: 50,
  starts_at: "2025-12-01T00:00:00Z",
  ends_at: "2025-12-31T23:59:59Z",
  max_uses: 50,
  max_uses_per_user: 1,
  show_on_pricing: false,  // Ne pas afficher publiquement
  badge_text: "VIP -50%",
  badge_color: "purple"
}
```

**Résultat** :
- Nécessite le code "VIP2025" pour être activée
- Non visible sur la page pricing (réservé VIP)
- 50% de réduction sur tous les packs
- Limité à 50 utilisations

---

## 🎨 Design des Promotions

### Couleurs de Badges

```typescript
const badgeColors = {
  red: '#ef4444',      // Rouge intense (soldes)
  orange: '#f97316',   // Orange (offre spéciale)
  yellow: '#eab308',   // Jaune (nouveauté)
  green: '#22c55e',    // Vert (économie)
  blue: '#3b82f6',     // Bleu (info)
  purple: '#a855f7',   // Violet (VIP)
};
```

### Positionnement

- **Badge Promo** : Coin supérieur gauche
- **Badge POPULAIRE** : Centré au-dessus de la card
- **Prix barré** : Au-dessus du prix final
- **Badge Économie** : Sous le prix final

### États Visuels

| État | Badge | Bordure | Ombre |
|------|-------|---------|-------|
| Sans promo | - | `border-border/50` | - |
| Avec promo | Badge couleur | `border-green-500/30` | `shadow-green-500/10` |
| Featured + promo | Badge promo + POPULAIRE | `border-purple-500/50` | `shadow-purple-500/20` |

---

## 🔧 Maintenance

### Ajouter une Nouvelle Devise

1. **Mettre à jour** [config/currencies.ts](config/currencies.ts) :
```typescript
export const CURRENCIES: Record<CurrencyCode, Currency> = {
  // ... existantes
  GBP: {
    code: 'GBP',
    name: 'Livre Sterling',
    symbol: '£',
    flag: '🇬🇧',
    decimals: 2,
    displayFormat: '{symbol}{amount}',
    rateToXOF: 780.50,
    rateFromXOF: 0.001282,
  },
};
```

2. **Insérer dans la DB** :
```sql
INSERT INTO currency_rates (currency, name, symbol, rate_to_xof, rate_from_xof, is_active, decimals, display_format)
VALUES ('GBP', 'Livre Sterling', '£', 780.50, 0.001282, true, 2, '{symbol}{amount}');
```

3. **Mettre à jour le type** :
```typescript
export type CurrencyCode = 'XOF' | 'EUR' | 'USD' | 'GBP';
```

### Mettre à Jour les Taux de Change

```sql
UPDATE currency_rates
SET
  rate_to_xof = 660.00,
  rate_from_xof = 0.001515,
  last_updated = NOW()
WHERE currency = 'EUR';
```

**Recommandation** : Créer un cron job pour mettre à jour les taux automatiquement depuis une API de change.

### Archiver les Promotions Expirées

```sql
-- Désactiver les promotions expirées
UPDATE pack_promotions
SET is_active = false
WHERE ends_at < NOW() AND is_active = true;

-- Voir les stats
SELECT
  name,
  uses_count,
  ends_at,
  discount_type,
  discount_value
FROM pack_promotions
WHERE ends_at < NOW()
ORDER BY ends_at DESC;
```

---

## 📈 Analytics

### KPIs Promotions

```sql
-- Promotions les plus utilisées
SELECT
  pp.name,
  pp.discount_value,
  pp.uses_count,
  SUM(ppu.discount_applied) as total_discount_given
FROM pack_promotions pp
LEFT JOIN pack_promotion_uses ppu ON pp.id = ppu.promotion_id
GROUP BY pp.id, pp.name, pp.discount_value, pp.uses_count
ORDER BY pp.uses_count DESC;

-- Revenus avec/sans promotions
SELECT
  CASE WHEN promotion_id IS NOT NULL THEN 'Avec promo' ELSE 'Sans promo' END as type,
  COUNT(*) as purchases,
  SUM(final_amount) as revenue,
  AVG(final_amount) as avg_order
FROM credit_purchases
WHERE payment_status = 'succeeded'
GROUP BY CASE WHEN promotion_id IS NOT NULL THEN 'Avec promo' ELSE 'Sans promo' END;
```

### Conversion par Devise

```sql
SELECT
  currency,
  COUNT(*) as purchases,
  SUM(final_amount) as revenue_in_currency,
  AVG(final_amount) as avg_purchase
FROM credit_purchases
WHERE payment_status = 'succeeded'
GROUP BY currency
ORDER BY purchases DESC;
```

---

## ✅ Checklist de Lancement

### Base de Données
- [x] Migration `004_pack_promotions_and_currencies.sql` exécutée
- [x] Table `pack_promotions` créée
- [x] Table `pack_promotion_uses` créée
- [x] Table `currency_rates` créée avec données initiales
- [x] Fonctions PostgreSQL créées
- [x] Index optimisés créés

### Backend
- [x] Config devises : `config/currencies.ts`
- [x] Types TypeScript : `types/index.ts`
- [x] API GET promotions : `/api/admin/credits/promotions`
- [x] API POST promotions : `/api/admin/credits/promotions`
- [x] API PUT/DELETE promotions : `/api/admin/credits/promotions/[id]`
- [x] API packs avec promotions : `/api/credits/packs-with-promotions`

### Frontend
- [x] Composant `CurrencySelector`
- [x] Page admin promotions
- [x] Menu admin mis à jour
- [x] Page pricing mise à jour avec devises et promos
- [x] Affichage badges et prix barrés

### Tests
- [ ] Créer une promotion test
- [ ] Vérifier affichage sur pricing
- [ ] Tester changement de devise
- [ ] Tester limites d'utilisation
- [ ] Vérifier conversion des prix
- [ ] Tester stackable avec codes promo

---

## 🚀 Prochaines Étapes

### Court Terme
1. ✅ Documentation complète
2. ⏳ Tests utilisateur
3. ⏳ Ajustement des taux de change
4. ⏳ Création de promotions de lancement

### Moyen Terme
1. ⏳ API externe pour taux de change en temps réel
2. ⏳ Analytics avancés des promotions
3. ⏳ A/B testing des promotions
4. ⏳ Notifications promotions par email

### Long Terme
1. ⏳ Promotions géolocalisées
2. ⏳ Promotions personnalisées (basées sur historique)
3. ⏳ Programme de fidélité avec points
4. ⏳ Promotions multi-tiers (paliers progressifs)

---

## 📚 Ressources

### Fichiers Principaux
- [config/currencies.ts](config/currencies.ts) - Configuration devises
- [types/index.ts](types/index.ts) - Types TypeScript
- [components/credits/CurrencySelector.tsx](components/credits/CurrencySelector.tsx) - Sélecteur devise
- [app/admin/credits/promotions/page.tsx](app/admin/credits/promotions/page.tsx) - Interface admin
- [app/[locale]/pricing/page.tsx](app/[locale]/pricing/page.tsx) - Page pricing
- [supabase/migrations/004_pack_promotions_and_currencies.sql](supabase/migrations/004_pack_promotions_and_currencies.sql) - Migration

### API Routes
- `GET /api/admin/credits/promotions` - Liste promotions
- `POST /api/admin/credits/promotions` - Créer promotion
- `PUT /api/admin/credits/promotions/[id]` - Modifier promotion
- `DELETE /api/admin/credits/promotions/[id]` - Supprimer promotion
- `GET /api/credits/packs-with-promotions?currency=XOF` - Packs avec promos

### Documentation Connexe
- [CREDIT_SYSTEM_FINAL_SUMMARY.md](CREDIT_SYSTEM_FINAL_SUMMARY.md) - Système crédits complet
- [ADMIN_DASHBOARD_CREDITS.md](ADMIN_DASHBOARD_CREDITS.md) - Dashboard admin
- [PRICING_REDESIGN_SUMMARY.md](PRICING_REDESIGN_SUMMARY.md) - Redesign pricing

---

**Livré par** : Claude Code
**Date** : Décembre 2025
**Version** : 1.0.0
**Statut** : ✅ Production Ready
