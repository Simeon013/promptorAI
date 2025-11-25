# 🎨 Setup - Personnalisation & Tarification

Ce guide explique comment activer les fonctionnalités de personnalisation (tarifs, promotions, codes promo) dans Promptor.

## 📋 Table des Matières

1. [Migration Base de Données](#1-migration-base-de-données)
2. [Vérification de l'Installation](#2-vérification-de-linstallation)
3. [Configuration Stripe (optionnel)](#3-configuration-stripe-optionnel)
4. [Utilisation des APIs](#4-utilisation-des-apis)
5. [Interface Admin](#5-interface-admin-à-venir)

---

## 1. Migration Base de Données

### Étape 1.1 : Exécuter la migration dans Supabase

1. Ouvrez votre dashboard Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (menu de gauche)
4. Créez une nouvelle query
5. Copiez-collez le contenu de `supabase/migrations/007_admin_customization.sql`
6. Cliquez sur **Run** (ou F5)

### Étape 1.2 : Vérifier que les tables ont été créées

Exécutez cette query pour vérifier :

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'admin_pricing_config',
  'admin_promotions',
  'admin_promo_codes',
  'promo_code_redemptions',
  'admin_app_settings'
)
ORDER BY table_name;
```

Vous devriez voir **5 tables** listées.

### Étape 1.3 : Vérifier les données initiales

```sql
-- Vérifier les tarifs par défaut
SELECT plan, price_monthly, price_yearly, quota_limit, is_active
FROM admin_pricing_config
ORDER BY plan;

-- Vérifier les paramètres app
SELECT key, value, category
FROM admin_app_settings
ORDER BY category, key;
```

Résultat attendu :
- 4 plans : FREE, STARTER, PRO, ENTERPRISE
- 11 paramètres dans admin_app_settings

---

## 2. Vérification de l'Installation

### Test rapide via curl (si le serveur dev tourne)

```bash
# Démarrer le serveur dev
npm run dev

# Tester l'API de pricing (authentification admin requise)
curl http://localhost:3000/api/admin/pricing
```

---

## 3. Configuration Stripe (optionnel)

Si vous voulez créer automatiquement des prix Stripe depuis l'interface admin :

### 3.1 : Variables d'environnement

Assurez-vous que `.env.local` contient :

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3.2 : Workflow de synchronisation

Lorsque vous modifiez un tarif dans l'interface admin avec `syncStripe: true`, le système :

1. Crée ou récupère un produit Stripe
2. Crée deux prix (monthly + yearly)
3. Stocke les `stripe_price_id_monthly` et `stripe_price_id_yearly` dans Supabase

---

## 4. Utilisation des APIs

### 4.1 : API Admin - Pricing

#### GET /api/admin/pricing
Récupère toutes les configurations de pricing.

```bash
curl http://localhost:3000/api/admin/pricing \
  -H "Authorization: Bearer <clerk_session_token>"
```

#### GET /api/admin/pricing?plan=PRO
Récupère la config d'un plan spécifique.

#### PUT /api/admin/pricing
Met à jour un plan.

```bash
curl -X PUT http://localhost:3000/api/admin/pricing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "plan": "PRO",
    "priceMonthly": 39,
    "priceYearly": 390,
    "quotaLimit": -1,
    "syncStripe": true
  }'
```

### 4.2 : API Admin - Promotions

#### GET /api/admin/promotions
Liste toutes les promotions.

#### POST /api/admin/promotions
Crée une promotion.

```bash
curl -X POST http://localhost:3000/api/admin/promotions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Black Friday 2025",
    "description": "Réduction de 30% sur tous les plans",
    "discountType": "PERCENTAGE",
    "discountValue": 30,
    "applicablePlans": ["STARTER", "PRO"],
    "billingCycle": "both",
    "startDate": "2025-11-24T00:00:00Z",
    "endDate": "2025-11-30T23:59:59Z",
    "maxRedemptions": 100
  }'
```

#### PATCH /api/admin/promotions?id=xxx
Met à jour une promotion.

#### DELETE /api/admin/promotions?id=xxx
Supprime une promotion.

### 4.3 : API Admin - Codes Promo

#### GET /api/admin/promo-codes
Liste tous les codes promo.

#### POST /api/admin/promo-codes
Crée un code promo.

```bash
curl -X POST http://localhost:3000/api/admin/promo-codes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "code": "LAUNCH2025",
    "discountType": "PERCENTAGE",
    "discountValue": 20,
    "duration": "once",
    "applicablePlans": ["STARTER", "PRO"],
    "maxRedemptions": 50,
    "firstTimeOnly": true,
    "expiresAt": "2025-12-31T23:59:59Z"
  }'
```

**Important** : Cette route crée automatiquement un coupon Stripe avec l'ID du code.

#### PATCH /api/admin/promo-codes?id=xxx
Met à jour un code promo (uniquement `isActive`, `expiresAt`, `maxRedemptions`).

#### DELETE /api/admin/promo-codes?id=xxx
Supprime un code promo (et le coupon Stripe associé).

### 4.4 : API Publique - Validation Codes Promo

#### POST /api/promo-codes/validate
Valide un code promo pour un utilisateur authentifié.

```bash
curl -X POST http://localhost:3000/api/promo-codes/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "code": "LAUNCH2025",
    "plan": "PRO"
  }'
```

Réponse si valide :

```json
{
  "valid": true,
  "promoCodeId": "uuid...",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "reason": "Code promo valide",
  "stripeCouponId": "LAUNCH2025"
}
```

Réponse si invalide :

```json
{
  "valid": false,
  "reason": "Code promo expiré"
}
```

---

## 5. Interface Admin (À venir)

Les interfaces admin seront créées dans :

- `/admin/pricing` - Gestion des tarifs par plan
- `/admin/promotions` - Gestion des promotions temporaires
- `/admin/promo-codes` - Gestion des codes promo

---

## 📊 Schéma des Tables

### admin_pricing_config
Configuration des tarifs et quotas par plan.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| plan | TEXT | FREE, STARTER, PRO, ENTERPRISE |
| price_monthly | DECIMAL | Prix mensuel (€) |
| price_yearly | DECIMAL | Prix annuel (€) |
| currency | TEXT | Devise (EUR, USD, etc.) |
| stripe_price_id_monthly | TEXT | ID prix Stripe mensuel |
| stripe_price_id_yearly | TEXT | ID prix Stripe annuel |
| quota_limit | INTEGER | Nombre de prompts (-1 = illimité) |
| history_days | INTEGER | Durée historique (-1 = illimité) |
| workspaces | INTEGER | Nombre de workspaces (-1 = illimité) |
| api_access | BOOLEAN | Accès API activé |
| analytics_access | BOOLEAN | Analytics activé |
| priority_support | BOOLEAN | Support prioritaire |
| custom_models | BOOLEAN | Modèles custom |
| is_active | BOOLEAN | Plan actif |
| updated_at | TIMESTAMP | Date de mise à jour |
| updated_by | TEXT | ID admin |

### admin_promotions
Promotions temporaires appliquées automatiquement.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| name | TEXT | Nom de la promotion |
| description | TEXT | Description |
| discount_type | TEXT | PERCENTAGE ou FIXED_AMOUNT |
| discount_value | DECIMAL | Valeur de la réduction |
| applicable_plans | TEXT[] | Plans concernés |
| billing_cycle | TEXT | monthly, yearly, both |
| start_date | TIMESTAMP | Date de début |
| end_date | TIMESTAMP | Date de fin |
| max_redemptions | INTEGER | Nombre max d'utilisations |
| current_redemptions | INTEGER | Nombre actuel d'utilisations |
| is_active | BOOLEAN | Promotion active |
| stripe_promotion_code_id | TEXT | ID Stripe |
| created_at | TIMESTAMP | Date de création |
| created_by | TEXT | ID admin |
| updated_at | TIMESTAMP | Date de mise à jour |

### admin_promo_codes
Codes promo à entrer manuellement.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| code | TEXT | Code promo (ex: LAUNCH2025) |
| discount_type | TEXT | PERCENTAGE ou FIXED_AMOUNT |
| discount_value | DECIMAL | Valeur de la réduction |
| duration | TEXT | once, repeating, forever |
| duration_months | INTEGER | Durée si repeating |
| applicable_plans | TEXT[] | Plans concernés |
| max_redemptions | INTEGER | Nombre max d'utilisations |
| current_redemptions | INTEGER | Nombre actuel d'utilisations |
| first_time_only | BOOLEAN | Réservé nouveaux clients |
| expires_at | TIMESTAMP | Date d'expiration |
| is_active | BOOLEAN | Code actif |
| stripe_coupon_id | TEXT | ID coupon Stripe |
| stripe_promotion_code_id | TEXT | ID promotion Stripe |
| created_at | TIMESTAMP | Date de création |
| created_by | TEXT | ID admin |
| updated_at | TIMESTAMP | Date de mise à jour |

### promo_code_redemptions
Historique d'utilisation des codes promo.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| promo_code_id | UUID | Référence au code promo |
| user_id | TEXT | ID utilisateur |
| stripe_subscription_id | TEXT | ID abonnement Stripe |
| redeemed_at | TIMESTAMP | Date d'utilisation |

### admin_app_settings
Paramètres généraux de l'application.

| Colonne | Type | Description |
|---------|------|-------------|
| key | TEXT | Clé du paramètre (PRIMARY KEY) |
| value | JSONB | Valeur du paramètre |
| type | TEXT | string, number, boolean, json |
| description | TEXT | Description |
| category | TEXT | general, payment, ai, quotas, security |
| is_public | BOOLEAN | Accessible côté client |
| updated_at | TIMESTAMP | Date de mise à jour |
| updated_by | TEXT | ID admin |

---

## 🔍 Fonctions PostgreSQL Utiles

### is_promo_code_valid(code, plan, user_id)
Valide un code promo pour un utilisateur.

```sql
SELECT * FROM is_promo_code_valid('LAUNCH2025', 'PRO', 'user_xxx');
```

### increment_promo_code_redemptions(code_id)
Incrémente le compteur d'utilisations.

```sql
SELECT increment_promo_code_redemptions('uuid...');
```

### is_promotion_valid(promotion_id)
Vérifie si une promotion est valide.

```sql
SELECT is_promotion_valid('uuid...');
```

---

## ✅ Checklist de Déploiement

- [ ] Migration SQL exécutée dans Supabase
- [ ] Tables créées et vérifiées
- [ ] Données initiales présentes
- [ ] Variables d'environnement Stripe configurées (si applicable)
- [ ] Tests des APIs admin en local
- [ ] Tests de validation des codes promo
- [ ] Build Next.js réussi sans erreurs
- [ ] Déploiement sur Vercel/autre plateforme

---

## 🚀 Prochaines Étapes

1. **Créer les interfaces admin** pour :
   - Gestion visuelle des tarifs
   - Création/édition des promotions
   - Gestion des codes promo

2. **Créer l'interface utilisateur** pour :
   - Page de checkout avec champ code promo
   - Affichage des promotions actives sur /pricing

3. **Intégrer avec Stripe Checkout** :
   - Passer le coupon lors de la création de session
   - Webhooks pour tracking des redemptions

4. **Analytics** :
   - Dashboard des revenus
   - Statistiques d'utilisation des codes promo
   - Tracking des conversions par promotion

---

## 📚 Documentation Associée

- [README.md](README.md) - Vue d'ensemble du projet
- [CLAUDE.md](CLAUDE.md) - Instructions pour Claude Code
- [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md) - État du développement
- [PRODUCTION_ROADMAP.md](PRODUCTION_ROADMAP.md) - Roadmap complète

---

**Dernière mise à jour** : Novembre 2025
**Auteur** : Claude Code (Anthropic)
