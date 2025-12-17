# Guide: Interface Admin - Gestion des Modèles IA

**Date de création:** 2025-12-14
**Statut:** ✅ Complétée

## 📋 Vue d'ensemble

Nouvelle interface admin permettant de configurer les modèles IA disponibles pour chaque tier du système de crédits. Cette interface remplace la configuration manuelle dans la base de données et offre une expérience utilisateur moderne et intuitive.

## 🎯 Fonctionnalités

### 1. Visualisation par Tier
- Affichage des 5 tiers (FREE, BRONZE, SILVER, GOLD, PLATINUM)
- Indicateurs visuels:
  - ✅ Vert: Tier correctement configuré avec un modèle par défaut
  - ⚠️ Orange: Tier sans modèle par défaut
  - Badge emoji pour chaque tier

### 2. Configuration des Modèles
Pour chaque tier, possibilité de:
- **Ajouter** de nouveaux modèles IA
- **Configurer** pour chaque modèle:
  - Provider (GEMINI, OPENAI, CLAUDE, MISTRAL, PERPLEXITY)
  - Model ID (sélection depuis une liste prédéfinie)
  - Nom d'affichage (généré automatiquement)
  - Priorité (ordre d'affichage)
- **Définir** le modèle par défaut pour chaque tier
- **Supprimer** des modèles

### 3. Validation Automatique
- Chaque tier avec des modèles DOIT avoir un modèle par défaut
- Tous les champs obligatoires sont validés avant sauvegarde
- Messages d'erreur clairs en cas de problème

## 📁 Fichiers Créés

### 1. Interface Admin
**[app/admin/models/page.tsx](app/admin/models/page.tsx)**
- Interface React complète avec gestion d'état
- Sidebar pour navigation entre les tiers
- Formulaires pour configuration des modèles
- Validation côté client

**Composants principaux:**
```typescript
interface ModelConfig {
  id: string;
  tier: string;
  model_id: string;
  model_name: string;
  provider: string;
  is_default: boolean;
  priority: number;
}

interface TierModels {
  tier: string;
  display_name: string;
  badge_emoji: string;
  models: ModelConfig[];
}
```

### 2. API Routes
**[app/api/admin/models/config/route.ts](app/api/admin/models/config/route.ts)**

**GET /api/admin/models/config**
- Récupère la configuration actuelle pour tous les tiers
- Organise les modèles par tier
- Retourne les métadonnées (display_name, badge_emoji)

**POST /api/admin/models/config**
- Valide la configuration soumise
- Supprime les anciennes configurations
- Insère les nouvelles configurations
- Invalide le cache des modèles

**Validation effectuée:**
- Chaque tier avec modèles doit avoir un défaut
- Tous les champs requis doivent être remplis
- Format des données vérifié

### 3. Navigation
**[app/admin/layout.tsx](app/admin/layout.tsx)** - Mise à jour
- Ajout du lien "Modèles IA" dans le menu admin
- Icône Brain pour identification visuelle
- Description: "Config par tier"

## 🎨 Interface Utilisateur

### Layout
```
┌─────────────────────────────────────────────────────┐
│ Header: Gestion des Modèles IA    [Enregistrer]    │
├────────────┬────────────────────────────────────────┤
│ SIDEBAR    │ MAIN CONTENT                           │
│            │                                        │
│ ⚪ FREE    │ ⚪ Gratuit                              │
│   0 modèle │                                        │
│            │ [+ Ajouter un modèle]                  │
│ 🥉 BRONZE  │                                        │
│   1 modèle │ ┌─────────────────────────────────┐   │
│   ✅       │ │ Provider: GEMINI               │   │
│            │ │ Model ID: gemini-2.5-flash    │   │
│ 🥈 SILVER  │ │ Nom: Gemini 2.5 Flash         │   │
│   2 modèles│ │ Priorité: 1                    │   │
│   ✅       │ │ [⭐ Par défaut] [🗑️ Supprimer] │   │
│            │ └─────────────────────────────────┘   │
│ 🥇 GOLD    │                                        │
│   3 modèles│                                        │
│   ✅       │                                        │
│            │                                        │
│ 💎 PLATINUM│                                        │
│   4 modèles│                                        │
│   ✅       │                                        │
└────────────┴────────────────────────────────────────┘
```

### Modèles Disponibles par Provider

**GEMINI:**
- gemini-2.5-flash - Gemini 2.5 Flash
- gemini-2.5-pro - Gemini 2.5 Pro
- gemini-exp-1206 - Gemini Experimental

**OPENAI:**
- gpt-4o - GPT-4 Optimized
- gpt-4o-mini - GPT-4 Mini
- gpt-4 - GPT-4
- gpt-3.5-turbo - GPT-3.5 Turbo

**CLAUDE:**
- claude-3-opus - Claude 3 Opus
- claude-3-sonnet - Claude 3 Sonnet
- claude-3-haiku - Claude 3 Haiku

**MISTRAL:**
- mistral-large - Mistral Large
- mistral-medium - Mistral Medium
- mistral-small - Mistral Small

**PERPLEXITY:**
- sonar-large - Sonar Large
- sonar-medium - Sonar Medium

## 🔄 Workflow Utilisateur

### Configuration d'un Nouveau Modèle

1. **Sélectionner le tier** dans la sidebar
2. **Cliquer** sur "Ajouter un modèle"
3. **Configurer** le modèle:
   - Choisir le provider
   - Sélectionner le model ID
   - (Le nom est rempli automatiquement)
   - Ajuster la priorité si nécessaire
4. **Définir comme défaut** si c'est le premier ou principal modèle
5. **Enregistrer** la configuration

### Modification de Modèles Existants

1. **Naviguer** vers le tier à modifier
2. **Modifier** les champs directement dans les cartes
3. **Changer le modèle par défaut** si nécessaire
4. **Supprimer** les modèles obsolètes
5. **Enregistrer** les modifications

## 🔒 Sécurité et Validation

### Côté Client
- Validation immédiate des champs requis
- Feedback visuel sur les erreurs
- Confirmation avant suppression (via toast)

### Côté Serveur
- Vérification authentification admin
- Validation structure des données
- Vérification présence d'un modèle par défaut
- Transaction atomique (delete + insert)

## 📊 Impact sur le Système

### Base de Données
La table `admin_model_config` stocke:
```sql
CREATE TABLE admin_model_config (
  id UUID PRIMARY KEY,
  tier TEXT NOT NULL,           -- FREE, BRONZE, SILVER, GOLD, PLATINUM
  model_id TEXT NOT NULL,       -- ex: 'gemini-2.5-flash'
  model_name TEXT NOT NULL,     -- ex: 'Gemini 2.5 Flash'
  provider TEXT NOT NULL,       -- GEMINI, OPENAI, CLAUDE, etc.
  is_default BOOLEAN,           -- Un seul par tier
  priority INT,                 -- Ordre d'affichage
  max_tokens INT,
  temperature DECIMAL(3,2),
  metadata JSONB,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

### Cache
- Cache côté serveur (5 minutes) via `model-helper.ts`
- Invalidation automatique après sauvegarde
- Rechargement immédiat de la configuration

### API de Génération
L'API `/api/generate` utilise automatiquement:
```typescript
// Récupérer le tier de l'utilisateur
const userTier = userData?.tier || 'FREE';

// Récupérer le modèle configuré pour ce tier
const modelId = await getModelForPlan(userTier);

// Utiliser ce modèle pour la génération
const result = await generatePrompt(input, constraints, language, modelId);
```

## 💡 Recommandations de Configuration

### FREE ⚪
- **1 modèle**: Gemini Flash uniquement
- **Raison**: Économique pour utilisateurs gratuits

### BRONZE 🥉
- **1 modèle**: Gemini Flash uniquement
- **Raison**: Tier d'entrée, économique

### SILVER 🥈
- **2 modèles**: Gemini Flash + Gemini Pro (défaut)
- **Raison**: Qualité améliorée sans coût excessif

### GOLD 🥇
- **3 modèles**: Gemini Flash + Gemini Pro (défaut) + GPT-4
- **Raison**: Accès aux modèles premium

### PLATINUM 💎
- **4+ modèles**: Tous les modèles disponibles
- **Défaut**: Gemini Pro (bon rapport qualité/prix)
- **Raison**: Tier VIP avec accès complet

## 🧪 Tests Recommandés

### Tests Fonctionnels
- [ ] Ajouter un modèle à chaque tier
- [ ] Définir/changer le modèle par défaut
- [ ] Modifier la priorité d'affichage
- [ ] Supprimer un modèle
- [ ] Enregistrer et vérifier en DB
- [ ] Invalider le cache et vérifier rechargement

### Tests de Validation
- [ ] Essayer de sauvegarder sans modèle par défaut (doit échouer)
- [ ] Essayer de sauvegarder avec champs vides (doit échouer)
- [ ] Vérifier que les messages d'erreur sont clairs

### Tests d'Intégration
- [ ] Créer un utilisateur avec tier SILVER
- [ ] Générer un prompt et vérifier le modèle utilisé
- [ ] Changer la config du tier SILVER
- [ ] Générer à nouveau et vérifier le nouveau modèle

## 🚀 Déploiement

### Prérequis
1. Migration `008_migrate_plans_to_tiers.sql` doit être exécutée
2. Colonne `tier` doit exister dans `admin_model_config`
3. Colonne `tier` doit exister dans `users`

### Étapes
1. **Déployer le code** sur Vercel
2. **Tester l'interface** en staging
3. **Configurer** les modèles pour chaque tier
4. **Vérifier** que l'API de génération utilise les bons modèles
5. **Monitorer** les logs pour détecter d'éventuels problèmes

## 📚 Liens Utiles

- [MODEL_MIGRATION_SUMMARY.md](MODEL_MIGRATION_SUMMARY.md) - Migration Plans → Tiers
- [config/tiers.ts](config/tiers.ts) - Configuration des tiers
- [lib/api/model-helper.ts](lib/api/model-helper.ts) - Logique de sélection des modèles
- [supabase/migrations/008_migrate_plans_to_tiers.sql](supabase/migrations/008_migrate_plans_to_tiers.sql) - Migration SQL

## 🎉 Résumé

Cette interface admin moderne permet de:
- ✅ Gérer visuellement les modèles IA par tier
- ✅ Éviter les erreurs de configuration
- ✅ Tester rapidement différentes configurations
- ✅ S'adapter facilement aux nouveaux modèles
- ✅ Optimiser les coûts par tier

**Navigation:** Admin Panel → Modèles IA (`/admin/models`)
