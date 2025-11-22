# Guide d'installation de l'interface Admin

Ce guide explique comment configurer l'interface d'administration complète de Promptor.

## 📋 Prérequis

- Compte Supabase configuré
- Base de données PostgreSQL accessible
- Variables d'environnement configurées (`.env.local`)

## 🗄️ Étape 1 : Créer les tables admin dans Supabase

### Option A : Via l'interface Supabase (Recommandé)

1. Connectez-vous à votre dashboard Supabase
2. Allez dans **SQL Editor**
3. Créez une nouvelle query
4. Copiez-collez le contenu du fichier `supabase/migrations/admin_tables.sql`
5. Exécutez la query

### Option B : Via la CLI Supabase

```bash
# Si vous utilisez Supabase CLI
supabase db push
```

## 📊 Tables créées

La migration crée 4 tables principales :

### 1. `admin_logs`
Stocke tous les logs d'activité administrative :
- Actions effectuées par les admins
- Timestamp, acteur, ressource affectée
- Statut (success, error, warning, info)
- Métadonnées (IP, user agent)

### 2. `site_settings`
Configuration globale du site :
- Nom du site
- URL et email de support
- Quotas par défaut pour chaque plan
- Tarifs
- Options (maintenance mode, inscriptions)

### 3. `admin_api_keys`
Stockage sécurisé des clés API :
- Clés pour Gemini, OpenAI, Claude, Mistral
- Statut de test
- Métadonnées par provider

### 4. `admin_model_config`
Configuration des modèles IA par plan :
- Modèle par défaut pour chaque plan (FREE, STARTER, PRO, ENTERPRISE)
- Provider, température, max tokens
- Priorités

## 🔑 Étape 2 : Configurer les administrateurs

Éditez le fichier `lib/auth/admin.ts` pour ajouter vos emails admin :

```typescript
export const ADMIN_EMAILS = [
  'admin@promptor.app',
  'simeondaouda@gmail.com',
  'votre-email@example.com', // ← Ajoutez votre email ici
];
```

## 🔧 Étape 3 : Mettre à jour les routes API

Les routes API utilisent actuellement un stockage en mémoire. Vous pouvez maintenant les mettre à jour pour utiliser les tables Supabase :

### Exemple : Mettre à jour `/api/admin/settings`

**Avant** (en mémoire) :
```typescript
let siteSettings = { siteName: 'Promptor', ... };
```

**Après** (Supabase) :
```typescript
// GET - Récupérer depuis Supabase
const { data: settings } = await supabase
  .from('site_settings')
  .select('key, value');

// POST - Sauvegarder dans Supabase
await supabase
  .from('site_settings')
  .upsert({ key: 'siteName', value: body.siteName });
```

## 📝 Étape 4 : Utiliser les fonctions utilitaires

Des fonctions SQL ont été créées pour simplifier les opérations :

### Logger une action admin

```typescript
// Depuis votre code TypeScript
await supabase.rpc('log_admin_action', {
  p_actor: user.fullName,
  p_actor_email: user.emailAddresses[0].emailAddress,
  p_action: 'Modification du plan utilisateur',
  p_resource: 'users',
  p_status: 'success',
  p_details: `Plan modifié de FREE vers PRO`,
  p_resource_id: userId,
  p_ip_address: req.headers['x-forwarded-for']
});
```

### Récupérer une configuration

```typescript
const { data } = await supabase.rpc('get_setting', { p_key: 'siteName' });
console.log(data); // "Promptor"
```

### Mettre à jour une configuration

```typescript
await supabase.rpc('update_setting', {
  p_key: 'siteName',
  p_value: JSON.stringify('Nouveau Nom'),
  p_updated_by: adminEmail
});
```

## 🔒 Étape 5 : Sécuriser avec RLS (Production)

En production, activez Row Level Security sur toutes les tables admin :

```sql
-- Activer RLS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_model_config ENABLE ROW LEVEL SECURITY;

-- Créer une policy pour les admins uniquement
CREATE POLICY "Admins only" ON admin_logs
  FOR ALL
  USING (auth.jwt() ->> 'email' IN (
    'admin@promptor.app',
    'simeondaouda@gmail.com'
  ));

-- Répéter pour chaque table
```

## 🧪 Étape 6 : Tester l'interface

1. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

2. Connectez-vous avec un compte admin (email dans `ADMIN_EMAILS`)

3. Accédez à `/admin` et vérifiez que :
   - Le dashboard affiche les statistiques
   - Les logs s'affichent correctement
   - Les paramètres peuvent être modifiés

## 📊 Structure de l'interface Admin

```
/admin
├── /                    # Dashboard avec statistiques
├── /users              # Gestion des utilisateurs
├── /prompts            # Gestion des prompts
├── /api-keys           # Configuration IA
├── /logs               # Logs d'activité
└── /settings           # Paramètres du site
```

## 🎯 Fonctionnalités disponibles

### Dashboard
- Statistiques globales (utilisateurs, prompts, revenus)
- Graphiques d'évolution (6 derniers mois)
- Top utilisateurs
- Répartition par plan

### Gestion des utilisateurs
- Liste paginée avec recherche
- Filtres par plan et quota
- Modification du plan
- Suppression d'utilisateurs

### Gestion des prompts
- Liste paginée avec recherche
- Filtres par type (GENERATE/IMPROVE)
- Statistiques (total, tokens)
- Vue détaillée

### Configuration IA
- Gestion des clés API (Gemini, OpenAI, Claude, Mistral)
- Test des clés API
- Configuration des modèles par plan
- Modèle global par défaut

### Logs d'activité
- Filtres par niveau (success, error, warning, info)
- Filtres par catégorie
- Recherche dans les logs
- Pagination

### Paramètres
- Informations générales (nom, URL, email)
- Quotas par défaut par plan
- Tarification
- Options (maintenance, inscriptions)

## 🔧 Personnalisation

### Ajouter une nouvelle setting

```sql
INSERT INTO site_settings (key, value, description, category)
VALUES (
  'nouvelleCle',
  '"valeur"',
  'Description de la nouvelle config',
  'general'
);
```

### Ajouter un nouveau modèle

```sql
INSERT INTO admin_model_config (plan, model_id, model_name, provider, is_default)
VALUES (
  'PRO',
  'claude-3.5-sonnet',
  'Claude 3.5 Sonnet',
  'CLAUDE',
  false
);
```

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Clerk](https://clerk.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

## 🐛 Dépannage

### Les logs ne s'affichent pas
- Vérifiez que la table `admin_logs` existe
- Vérifiez les permissions Supabase
- Consultez la console du navigateur pour les erreurs

### Erreur d'authentification admin
- Vérifiez que votre email est dans `ADMIN_EMAILS`
- Vérifiez que vous êtes connecté avec Clerk
- Effacez le cache du navigateur

### Les paramètres ne se sauvent pas
- Vérifiez que la table `site_settings` existe
- Vérifiez les permissions d'écriture Supabase
- Consultez les logs serveur (terminal)

## ✅ Checklist de mise en production

- [ ] Tables créées dans Supabase
- [ ] RLS activé sur toutes les tables admin
- [ ] Policies créées pour sécuriser l'accès
- [ ] Emails admin configurés dans `lib/auth/admin.ts`
- [ ] Clés API configurées dans l'interface
- [ ] Modèles configurés par plan
- [ ] Paramètres du site vérifiés
- [ ] Tests effectués sur toutes les pages admin
- [ ] Rate limiting ajouté sur les routes admin
- [ ] Monitoring configuré pour les actions critiques

## 🆘 Support

En cas de problème, consultez :
- Les logs serveur dans votre terminal
- Les logs Supabase dans le dashboard
- Les Network requests dans DevTools du navigateur

---

**Note** : Cette interface admin est conçue pour être utilisée en interne uniquement. Assurez-vous de bien sécuriser l'accès en production.
