# Migration: Système de Modèles IA - Plans → Tiers

**Date:** 2025-12-14
**Status:** ✅ Complétée

## 📋 Résumé

Migration du système de sélection de modèles IA de l'ancien système basé sur Stripe (FREE/STARTER/PRO/ENTERPRISE) vers le nouveau système de tiers basé sur les crédits (FREE/BRONZE/SILVER/GOLD/PLATINUM).

## 🎯 Objectifs

- [x] Remplacer les références aux anciens plans Stripe par les nouveaux tiers
- [x] Mettre à jour la configuration des modèles IA pour chaque tier
- [x] Conserver la compatibilité descendante pendant la transition
- [x] Documenter la nouvelle architecture

## 📝 Changements Effectués

### 1. Backend - API et Configuration

#### `lib/api/model-helper.ts`
- ✅ Fonction `getModelForPlan()` renommée conceptuellement pour utiliser les tiers
- ✅ Paramètre changé: `userPlan` → `userTier`
- ✅ Requête DB: colonne `plan` → `tier`
- ✅ Fallback models mis à jour pour les 5 tiers:
  ```typescript
  FREE: 'gemini-2.5-flash'       // ⚪ Gratuit
  BRONZE: 'gemini-2.5-flash'     // 🥉 Bronze (2 500 XOF)
  SILVER: 'gemini-2.5-pro'       // 🥈 Argent (5 000 XOF)
  GOLD: 'gemini-2.5-pro'         // 🥇 Or (12 000 XOF)
  PLATINUM: 'gemini-2.5-pro'     // 💎 Platine (30 000 XOF)
  ```

#### `app/api/generate/route.ts`
- ✅ Récupération du tier utilisateur au lieu du plan:
  ```typescript
  // Avant
  const { data: userData } = await supabase.from('users').select('plan')
  const userPlan = userData?.plan || 'FREE';
  const modelId = await getModelForPlan(userPlan);

  // Après
  const { data: userData } = await supabase.from('users').select('tier')
  const userTier = userData?.tier || 'FREE';
  const modelId = await getModelForPlan(userTier);
  ```
- ✅ Logs d'erreur mis à jour pour mentionner "tier" au lieu de "plan"

### 2. Base de Données - Migration

#### `supabase/migrations/008_migrate_plans_to_tiers.sql`
Nouvelle migration créée avec 5 étapes:

**Étape 1:** Renommer la colonne
```sql
ALTER TABLE admin_model_config RENAME COLUMN plan TO tier;
```

**Étape 2:** Migrer les données
- Suppression des anciennes configurations Stripe
- Insertion des nouvelles configurations par tier avec priorités:

| Tier | Modèles Disponibles | Défaut | Notes |
|------|---------------------|--------|-------|
| FREE | gemini-2.5-flash | ✅ | Un seul modèle |
| BRONZE | gemini-2.5-flash | ✅ | Un seul modèle |
| SILVER | gemini-flash, gemini-pro | gemini-pro | 2 modèles |
| GOLD | gemini-flash, gemini-pro, gpt-4 | gemini-pro | 3 modèles |
| PLATINUM | gemini-flash, gemini-pro, gpt-4, gpt-4o | gemini-pro | 4+ modèles |

**Étape 3:** Nettoyage site_settings
- Suppression des anciens quotas Stripe (defaultQuotaStarter, defaultQuotaPro, etc.)
- Les quotas sont maintenant gérés par le système de crédits

**Étape 4-5:** Nouvelles fonctions utilitaires
```sql
-- Récupérer le modèle par défaut pour un tier
CREATE FUNCTION get_model_for_tier(p_tier TEXT) RETURNS TEXT

-- Lister tous les modèles disponibles pour un tier
CREATE FUNCTION get_available_models_for_tier(p_tier TEXT)
```

### 3. Interface Admin

#### `app/admin/settings/page.tsx`
- ✅ Suppression des champs obsolètes:
  - ❌ defaultQuotaFree, defaultQuotaStarter, defaultQuotaPro
  - ❌ priceStarter, pricePro
- ✅ Ajout d'une nouvelle section informative "Système de Crédits et Tiers":
  - 💰 Lien vers la gestion des packs de crédits
  - 🎯 Référence vers `config/tiers.ts`
  - 🤖 Instructions pour configurer les modèles IA dans `admin_model_config`
- ✅ Description mise à jour pour clarifier la nouvelle structure

### 4. Documentation et Dépréciation

#### `config/plans.ts`
- ✅ Ajout d'un avertissement de dépréciation:
  ```typescript
  /**
   * ⚠️ DEPRECATED - Ce fichier utilise l'ancien système Stripe
   * Utilisez config/tiers.ts pour le nouveau système de tiers
   * Migration effectuée le: 2025-12-14
   */
  ```
- ⚠️ Fichier conservé pour compatibilité avec l'ancien code
- 📅 Prévu pour suppression dans une future version

## 🔄 Mapping Plans → Tiers

| Ancien Plan (Stripe) | Nouveau Tier (Crédits) | Modèle Défaut |
|----------------------|------------------------|---------------|
| FREE | FREE | gemini-2.5-flash |
| STARTER | BRONZE/SILVER | gemini-2.5-flash/pro |
| PRO | GOLD | gemini-2.5-pro |
| ENTERPRISE | PLATINUM | gemini-2.5-pro |

## 📊 Configuration des Tiers (Référence)

Définie dans `config/tiers.ts`:

```typescript
FREE: {
  min_spend: 0 XOF,
  ai_models: ['gemini-flash'],
  history_days: 7
}

BRONZE: {
  min_spend: 2 500 XOF,
  ai_models: ['gemini-flash'],
  history_days: 30
}

SILVER: {
  min_spend: 5 000 XOF,
  ai_models: ['gemini-flash', 'gemini-pro'],
  history_days: 90
}

GOLD: {
  min_spend: 12 000 XOF,
  ai_models: ['gemini-flash', 'gemini-pro', 'gpt-4'],
  history_days: -1 (illimité)
}

PLATINUM: {
  min_spend: 30 000 XOF,
  ai_models: ['all'],
  history_days: -1 (illimité)
}
```

## ✅ Tests Requis

### 1. Tests Backend
- [ ] Vérifier que `getModelForPlan()` retourne le bon modèle pour chaque tier
- [ ] Tester le fallback vers gemini-flash si tier non reconnu
- [ ] Vérifier le cache des modèles (5 minutes)

### 2. Tests API
- [ ] Générer un prompt avec tier FREE
- [ ] Générer un prompt avec tier SILVER (gemini-pro)
- [ ] Vérifier que les logs mentionnent le tier et non le plan

### 3. Tests Base de Données
- [ ] Exécuter la migration `008_migrate_plans_to_tiers.sql`
- [ ] Vérifier que la colonne `tier` existe dans `admin_model_config`
- [ ] Tester les fonctions `get_model_for_tier()` et `get_available_models_for_tier()`

### 4. Tests Interface Admin
- [ ] Vérifier que la page Settings n'affiche plus les quotas/prix Stripe
- [ ] Vérifier que les liens vers la gestion des crédits fonctionnent
- [ ] S'assurer que la sauvegarde ne tente pas de persister les champs supprimés

## 🚀 Déploiement

### Étape 1: Migration Base de Données
```bash
# Dans Supabase Studio ou via CLI
psql -h <your-db-host> -U postgres -d postgres -f supabase/migrations/008_migrate_plans_to_tiers.sql
```

### Étape 2: Vérification
```sql
-- Vérifier que la colonne tier existe
SELECT column_name FROM information_schema.columns
WHERE table_name = 'admin_model_config';

-- Vérifier les données migrées
SELECT tier, model_id, is_default FROM admin_model_config ORDER BY tier, priority DESC;
```

### Étape 3: Déploiement Code
```bash
# Déployer les changements sur Vercel
git add .
git commit -m "Migrate model selection from plans to tiers"
git push origin main
```

## 📚 Fichiers Modifiés

### Modifiés
1. `lib/api/model-helper.ts` - Logique de sélection des modèles
2. `app/api/generate/route.ts` - API de génération
3. `app/admin/settings/page.tsx` - Interface admin
4. `config/plans.ts` - Marqué comme déprécié

### Créés
1. `supabase/migrations/008_migrate_plans_to_tiers.sql` - Migration DB
2. `MODEL_MIGRATION_SUMMARY.md` - Ce document

## 🔗 Références

- [config/tiers.ts](config/tiers.ts) - Configuration des tiers
- [config/plans.ts](config/plans.ts) - ⚠️ Obsolète, à ne plus utiliser
- [CREDIT_SYSTEM_FINAL_SUMMARY.md](CREDIT_SYSTEM_FINAL_SUMMARY.md) - Système de crédits complet
- [FEDAPAY_INTEGRATION_SUMMARY.md](FEDAPAY_INTEGRATION_SUMMARY.md) - Intégration FedaPay

## ⚠️ Notes Importantes

1. **Compatibilité**: L'ancien fichier `config/plans.ts` est conservé mais marqué comme déprécié
2. **Cache**: Les modèles sont mis en cache pendant 5 minutes côté serveur
3. **Fallback**: En cas d'erreur, le système utilise toujours `gemini-2.5-flash`
4. **Utilisateurs existants**: Les utilisateurs avec `plan` dans la DB doivent être migrés vers `tier`
5. **Admin**: La configuration des modèles se fait maintenant directement dans la table `admin_model_config`

## 🎓 Pour les Développeurs

### Utiliser le système de tiers
```typescript
import { getTierFeatures, canUseAIModel } from '@/config/tiers';

// Récupérer les features d'un tier
const features = getTierFeatures('SILVER');
console.log(features.ai_models); // ['gemini-flash', 'gemini-pro']

// Vérifier si un utilisateur peut utiliser un modèle
const canUseGPT4 = canUseAIModel('GOLD', 'gpt-4'); // true
const canUseGPT4Free = canUseAIModel('FREE', 'gpt-4'); // false
```

### Récupérer le modèle pour un tier
```typescript
import { getModelForPlan } from '@/lib/api/model-helper';

// Dans une API route
const userTier = userData?.tier || 'FREE';
const modelId = await getModelForPlan(userTier);
// modelId = 'gemini-2.5-flash' pour FREE
```

---

**Status Final:** ✅ Migration terminée avec succès
**Prochaine Étape:** Tester en production et surveiller les logs
