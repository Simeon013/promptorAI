# Interface d'Administration Promptor

Documentation complète de l'interface d'administration de Promptor.

## 📚 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Pages disponibles](#pages-disponibles)
- [Gestion des administrateurs](#gestion-des-administrateurs)
- [API Routes](#api-routes)
- [Base de données](#base-de-données)
- [Sécurité](#sécurité)

---

## 🎯 Vue d'ensemble

L'interface d'administration de Promptor est une application complète permettant aux administrateurs de :

- 📊 Visualiser les statistiques globales de la plateforme
- 👥 Gérer les utilisateurs et leurs abonnements
- 📝 Modérer et superviser les prompts générés
- 🔑 Configurer les clés API et les modèles IA
- 📋 Consulter les logs d'activité
- ⚙️ Configurer les paramètres globaux du site

### Accès

- **URL** : `https://votre-domaine.com/admin`
- **Authentification** : Basée sur une liste d'emails autorisés
- **Responsive** : Optimisé desktop et mobile

---

## 🏗️ Architecture

### Layout principal

Le layout admin ([app/admin/layout.tsx](app/admin/layout.tsx)) fournit :

- **Sidebar fixe** (272px) sur desktop
- **Menu hamburger** sur mobile avec overlay
- **Navigation** avec 6 sections principales
- **Theme toggle** (dark/light mode)
- **Indicateur de page active**

### Système de navigation

```typescript
const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Utilisateurs', href: '/admin/users', icon: Users },
  { name: 'Prompts', href: '/admin/prompts', icon: FileText },
  { name: 'Clés API', href: '/admin/api-keys', icon: Key },
  { name: 'Logs', href: '/admin/logs', icon: Activity },
  { name: 'Paramètres', href: '/admin/settings', icon: Settings },
];
```

---

## 📄 Pages disponibles

### 1. Dashboard (`/admin`)

**Fichier** : [app/admin/page.tsx](app/admin/page.tsx)

**Fonctionnalités** :

- Statistiques en temps réel (utilisateurs, prompts, revenus, abonnements)
- Indicateurs de croissance (30 derniers jours)
- Graphiques d'évolution sur 6 mois (utilisateurs et prompts)
- Répartition des utilisateurs par plan (pie chart)
- Top 5 utilisateurs par nombre de prompts

**API utilisée** : `GET /api/admin/stats`

**Statistiques affichées** :

- Total utilisateurs
- Total prompts générés
- Abonnements actifs (STARTER, PRO, ENTERPRISE)
- Revenu mensuel récurrent (MRR)
- Taux de croissance utilisateurs
- Taux de croissance prompts
- Taux de croissance revenus

### 2. Gestion des utilisateurs (`/admin/users`)

**Fichier** : [app/admin/users/page.tsx](app/admin/users/page.tsx)

**Fonctionnalités** :

- Liste paginée (20 utilisateurs/page)
- Recherche par nom ou email
- Filtres par plan (FREE, STARTER, PRO, ENTERPRISE)
- Filtres par utilisation du quota (< 50%, > 50%, > 80%, saturé)
- Modification du plan utilisateur
- Modification du quota
- Suppression d'utilisateurs (avec confirmation)
- Indicateur visuel du quota utilisé (barre de progression)

**API utilisées** :

- `GET /api/admin/users` - Liste avec filtres
- `PATCH /api/admin/users/[userId]` - Modification
- `DELETE /api/admin/users/[userId]` - Suppression

**Actions possibles** :

```typescript
// Modifier le plan
await fetch(`/api/admin/users/${userId}`, {
  method: 'PATCH',
  body: JSON.stringify({ plan: 'PRO' })
});

// Modifier le quota
await fetch(`/api/admin/users/${userId}`, {
  method: 'PATCH',
  body: JSON.stringify({ quota_limit: 500 })
});

// Supprimer un utilisateur
await fetch(`/api/admin/users/${userId}`, {
  method: 'DELETE'
});
```

### 3. Gestion des prompts (`/admin/prompts`)

**Fichier** : [app/admin/prompts/page.tsx](app/admin/prompts/page.tsx)

**Fonctionnalités** :

- Liste paginée (20 prompts/page)
- Recherche full-text dans input et output
- Filtres par type (GENERATE, IMPROVE)
- Stats en temps réel (total, par type, tokens totaux)
- Affichage email utilisateur
- Indicateur favoris
- Vue détaillée de chaque prompt
- Timestamps formatés

**API utilisées** :

- `GET /api/admin/prompts` - Liste avec filtres et pagination
- `GET /api/admin/prompts/stats` - Statistiques globales
- `GET /api/admin/prompts/[promptId]` - Détails d'un prompt

**Informations affichées** :

- Type (GENERATE ou IMPROVE)
- Email utilisateur
- Input du prompt
- Output généré
- Modèle utilisé
- Nombre de tokens
- Date et heure de création
- Statut favori

### 4. Configuration IA (`/admin/api-keys`)

**Fichier** : [app/admin/api-keys/page.tsx](app/admin/api-keys/page.tsx)

**Fonctionnalités** :

- **Tab 1 : Clés API**
  - Gestion des clés pour 4 providers (Gemini, OpenAI, Claude, Mistral)
  - Masquage automatique des clés (8 premiers + 4 derniers caractères)
  - Toggle visibilité par clé
  - Test de validation pour chaque clé
  - Indicateurs de statut (valide/invalide)
  - Liste des modèles disponibles par provider

- **Tab 2 : Modèles & Plans**
  - Configuration du modèle global par défaut
  - Attribution de modèles par plan d'abonnement
  - FREE → Gemini 2.5 Flash
  - STARTER → Gemini 2.5 Flash
  - PRO → GPT-4 Mini
  - ENTERPRISE → GPT-4 Optimized

**API utilisées** :

- `GET /api/admin/api-keys` - Récupération config (clés masquées)
- `POST /api/admin/api-keys` - Sauvegarde configuration
- `POST /api/admin/api-keys/test` - Test d'une clé API

**Providers supportés** :

```typescript
const AI_MODELS = [
  { id: 'gemini-2.5-flash', provider: 'gemini', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.0-pro', provider: 'gemini', name: 'Gemini 2.0 Pro' },
  { id: 'gpt-4o', provider: 'openai', name: 'GPT-4 Optimized' },
  { id: 'gpt-4o-mini', provider: 'openai', name: 'GPT-4 Mini' },
  { id: 'claude-3.5-sonnet', provider: 'claude', name: 'Claude 3.5 Sonnet' },
  { id: 'mistral-large', provider: 'mistral', name: 'Mistral Large' },
];
```

### 5. Logs d'activité (`/admin/logs`)

**Fichier** : [app/admin/logs/page.tsx](app/admin/logs/page.tsx)

**Fonctionnalités** :

- Liste des logs d'activité (limite 500)
- Recherche dans acteur, action, ressource, détails
- Filtre par niveau (success, error, warning, info)
- Filtre par catégorie (auth, users, prompts, settings, api_keys, payments)
- Affichage des filtres actifs avec badges
- Bouton de réinitialisation
- Pagination (20 logs/page)
- Bouton d'actualisation
- Icônes colorées par statut
- Métadonnées (IP, timestamp)

**API utilisée** : `GET /api/admin/logs`

**Types de logs** :

- 🛡️ **auth** : Connexions, déconnexions
- 👤 **users** : Création, modification, suppression utilisateurs
- 📄 **prompts** : Génération, suppression de prompts
- ⚙️ **settings** : Modification paramètres
- 🔑 **api_keys** : Test, modification clés API
- 💳 **payments** : Webhooks Stripe, changements d'abonnement

**Niveaux de log** :

- ✓ **success** : Vert - Action réussie
- ✕ **error** : Rouge - Erreur rencontrée
- ⚠ **warning** : Jaune - Avertissement
- ℹ **info** : Bleu - Information

### 6. Paramètres (`/admin/settings`)

**Fichier** : [app/admin/settings/page.tsx](app/admin/settings/page.tsx)

**Fonctionnalités** :

- **Informations générales**
  - Nom du site
  - URL du site (important pour SEO et emails)
  - Email de support

- **Quotas par défaut**
  - Plan FREE (prompts/mois)
  - Plan STARTER (prompts/mois)
  - Plan PRO (prompts/mois, 999999 = illimité)

- **Tarification**
  - Prix STARTER (€/mois)
  - Prix PRO (€/mois)
  - Note : Prix Stripe configurés dans le dashboard Stripe

- **Options du site**
  - Mode maintenance (toggle)
  - Inscriptions activées (toggle)

**API utilisée** :

- `GET /api/admin/settings` - Récupération paramètres
- `POST /api/admin/settings` - Sauvegarde paramètres

---

## 🔑 Gestion des administrateurs

### Configuration

Les administrateurs sont définis dans [lib/auth/admin.ts](lib/auth/admin.ts) :

```typescript
export const ADMIN_EMAILS = [
  'admin@promptor.app',
  'simeondaouda@gmail.com',
];

export function isAdminUser(emailAddresses: Array<{ emailAddress: string }>): boolean {
  return emailAddresses.some((email) => ADMIN_EMAILS.includes(email.emailAddress));
}
```

### Ajouter un administrateur

1. Ouvrir [lib/auth/admin.ts](lib/auth/admin.ts)
2. Ajouter l'email dans le tableau `ADMIN_EMAILS`
3. Sauvegarder le fichier

```typescript
export const ADMIN_EMAILS = [
  'admin@promptor.app',
  'simeondaouda@gmail.com',
  'nouvel-admin@example.com', // ← Ajouter ici
];
```

### Vérification d'accès

Toutes les routes API et pages admin vérifient automatiquement :

```typescript
if (!isAdminUser(user.emailAddresses)) {
  return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
}
```

---

## 🚀 API Routes

Toutes les routes admin sont préfixées par `/api/admin` et nécessitent une authentification admin.

### Routes statistiques

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/admin/stats` | GET | Statistiques globales du dashboard |
| `/api/admin/prompts/stats` | GET | Statistiques des prompts |

### Routes utilisateurs

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/admin/users` | GET | Liste des utilisateurs (avec filtres et pagination) |
| `/api/admin/users/[userId]` | GET | Détails d'un utilisateur |
| `/api/admin/users/[userId]` | PATCH | Modifier un utilisateur |
| `/api/admin/users/[userId]` | DELETE | Supprimer un utilisateur |

### Routes prompts

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/admin/prompts` | GET | Liste des prompts (avec filtres et pagination) |
| `/api/admin/prompts/[promptId]` | GET | Détails d'un prompt |

### Routes configuration

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/admin/api-keys` | GET | Configuration clés API (masquées) |
| `/api/admin/api-keys` | POST | Sauvegarder clés API |
| `/api/admin/api-keys/test` | POST | Tester une clé API |
| `/api/admin/settings` | GET | Paramètres du site |
| `/api/admin/settings` | POST | Sauvegarder paramètres |

### Routes logs

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/admin/logs` | GET | Récupérer les logs d'activité |

---

## 🗄️ Base de données

### Tables créées

La migration [supabase/migrations/admin_tables.sql](supabase/migrations/admin_tables.sql) crée 4 tables :

#### 1. `admin_logs`

Stocke tous les logs d'activité administrative.

```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ,
  actor TEXT,
  actor_email TEXT,
  action TEXT,
  resource TEXT,
  resource_id TEXT,
  status TEXT,
  details TEXT,
  ip_address INET,
  metadata JSONB
);
```

#### 2. `site_settings`

Configuration globale du site.

```sql
CREATE TABLE site_settings (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE,
  value JSONB,
  description TEXT,
  category TEXT,
  updated_by TEXT,
  updated_at TIMESTAMPTZ
);
```

**Données initiales** :

- `siteName`, `siteUrl`, `supportEmail`
- `defaultQuotaFree`, `defaultQuotaStarter`, `defaultQuotaPro`
- `priceStarter`, `pricePro`, `priceEnterprise`
- `maintenanceMode`, `registrationEnabled`

#### 3. `admin_api_keys`

Stockage sécurisé des clés API.

```sql
CREATE TABLE admin_api_keys (
  id UUID PRIMARY KEY,
  provider TEXT UNIQUE,
  api_key_encrypted TEXT,
  is_active BOOLEAN,
  last_tested_at TIMESTAMPTZ,
  last_test_status BOOLEAN,
  default_model TEXT,
  metadata JSONB
);
```

#### 4. `admin_model_config`

Configuration des modèles IA par plan.

```sql
CREATE TABLE admin_model_config (
  id UUID PRIMARY KEY,
  plan TEXT,
  model_id TEXT,
  model_name TEXT,
  provider TEXT,
  is_default BOOLEAN,
  priority INT,
  max_tokens INT,
  temperature DECIMAL(3,2),
  metadata JSONB
);
```

### Fonctions SQL utilitaires

```sql
-- Logger une action admin
SELECT log_admin_action(
  'John Doe',
  'john@example.com',
  'Modification du plan utilisateur',
  'users',
  'success',
  'Plan modifié de FREE vers PRO',
  'user_id_123'
);

-- Récupérer une configuration
SELECT get_setting('siteName'); -- "Promptor"

-- Mettre à jour une configuration
SELECT update_setting('siteName', '"Nouveau Nom"', 'admin@promptor.app');
```

---

## 🔒 Sécurité

### Authentification

- **Clerk** : Authentification des utilisateurs
- **Email whitelist** : Seuls les emails dans `ADMIN_EMAILS` ont accès
- **Vérification sur toutes les routes** : Client et serveur

### Protection des routes

Chaque route API vérifie :

1. L'utilisateur est authentifié (Clerk)
2. L'email est dans la liste admin
3. Les permissions sont valides

```typescript
const { userId } = await auth();
const user = await currentUser();

if (!userId || !user) {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}

if (!isAdminUser(user.emailAddresses)) {
  return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
}
```

### Stockage des clés API

**Actuellement** : Stockage en mémoire (développement)

**Production recommandée** :

1. Chiffrer les clés avec `pgcrypto`
2. Stocker dans `admin_api_keys`
3. Déchiffrer uniquement à l'utilisation
4. Activer RLS sur Supabase

```sql
-- Exemple de chiffrement (à implémenter)
UPDATE admin_api_keys
SET api_key_encrypted = pgp_sym_encrypt('sk-...', 'encryption-key')
WHERE provider = 'OPENAI';
```

### Row Level Security (RLS)

**À activer en production** :

```sql
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_model_config ENABLE ROW LEVEL SECURITY;

-- Policy exemple
CREATE POLICY "Admins only" ON admin_logs
  FOR ALL
  USING (auth.jwt() ->> 'email' IN (
    'admin@promptor.app',
    'simeondaouda@gmail.com'
  ));
```

---

## 📋 Checklist de production

- [ ] Tables Supabase créées
- [ ] RLS activé sur toutes les tables admin
- [ ] Policies de sécurité configurées
- [ ] Emails admin configurés
- [ ] Clés API stockées de manière sécurisée (chiffrement)
- [ ] Rate limiting ajouté sur routes critiques
- [ ] Monitoring des actions admin (logs)
- [ ] Backup automatique de la base
- [ ] Tests de toutes les fonctionnalités admin
- [ ] Documentation à jour

---

## 🆘 Support & Dépannage

### Logs ne s'affichent pas

1. Vérifier que la table `admin_logs` existe
2. Exécuter la migration SQL
3. Vérifier les permissions Supabase
4. Consulter la console navigateur (F12)

### Erreur d'authentification

1. Vérifier que votre email est dans `ADMIN_EMAILS`
2. Vérifier que vous êtes connecté avec Clerk
3. Effacer cache et cookies
4. Vérifier dans Clerk dashboard que l'email est vérifié

### Paramètres ne se sauvent pas

1. Vérifier que la table `site_settings` existe
2. Vérifier les permissions d'écriture Supabase
3. Consulter les logs serveur (terminal)
4. Vérifier les Network requests dans DevTools

---

## 📚 Ressources

- [Guide d'installation](./ADMIN_SETUP.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Version** : 1.1.0
**Dernière mise à jour** : 22 Novembre 2025
