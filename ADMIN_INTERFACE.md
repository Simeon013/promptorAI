# Interface Admin - Documentation

## 📋 Vue d'ensemble

L'interface admin de Promptor permet aux administrateurs de gérer la plateforme, les utilisateurs, les prompts et les paramètres du site.

## 🔐 Accès Admin

### Configuration des emails admin

Les emails admin sont configurés dans plusieurs fichiers :

1. **Layout Admin** : `app/admin/layout.tsx`
2. **API Routes** : Tous les fichiers dans `app/api/admin/`
3. **Header** : `components/layout/HeaderSimple.tsx`

```typescript
const ADMIN_EMAILS = [
  'admin@promptor.app',
  'simeondaouda@gmail.com',
  // Ajoutez vos emails admin ici
];
```

**Important** : Pour ajouter un nouvel admin, ajoutez son email dans la liste `ADMIN_EMAILS` dans **tous** les fichiers mentionnés ci-dessus.

### Sécurité

- Vérification d'authentification Clerk sur toutes les routes admin
- Vérification de l'email admin avant d'autoriser l'accès
- Redirection automatique vers `/dashboard` si non-admin
- Redirection vers `/sign-in` si non-connecté

## 🎨 Interface Admin

### Dashboard Principal (`/admin`)

**Route** : `/admin`
**Fichier** : `app/admin/page.tsx`

**Fonctionnalités** :
- Statistiques globales en temps réel
  - Total utilisateurs (+ croissance mensuelle)
  - Total prompts (+ croissance mensuelle)
  - Abonnements actifs
  - Revenu mensuel estimé
- Accès rapide aux sections principales
  - Gestion utilisateurs
  - Gestion prompts
  - Paramètres du site

**API** : `/api/admin/stats`

### Gestion des Utilisateurs

#### Liste des utilisateurs (`/admin/users`)

**Route** : `/admin/users`
**Fichier** : `app/admin/users/page.tsx`

**Fonctionnalités** :
- Liste paginée (20 utilisateurs/page)
- Recherche par email ou nom
- Affichage des informations :
  - Email, nom
  - Plan actuel (FREE, STARTER, PRO, ENTERPRISE)
  - Quota utilisé / limite
  - Date d'inscription
- Actions :
  - Modifier un utilisateur
  - Supprimer un utilisateur (avec confirmation)

**API** : `/api/admin/users`

#### Modifier un utilisateur (`/admin/users/[userId]`)

**Route** : `/admin/users/[userId]`
**Fichier** : `app/admin/users/[userId]/page.tsx`

**Fonctionnalités** :
- Modifier le nom
- Changer le plan d'abonnement
- Ajuster le quota utilisé
- Ajuster le quota limite
- Voir les informations Stripe (read-only)
- Voir la date d'inscription (read-only)

**API** :
- GET : `/api/admin/users/[userId]`
- PATCH : `/api/admin/users/[userId]`
- DELETE : `/api/admin/users/[userId]`

### Gestion des Prompts

#### Liste des prompts (`/admin/prompts`)

**Route** : `/admin/prompts`
**Fichier** : `app/admin/prompts/page.tsx`

**Fonctionnalités** :
- Statistiques globales :
  - Total prompts
  - Total générés
  - Total améliorés
  - Total tokens consommés
- Liste paginée (20 prompts/page)
- Recherche dans le contenu (input/output)
- Filtre par type (GENERATE/IMPROVE)
- Affichage des informations :
  - Type, email utilisateur
  - Entrée (preview)
  - Sortie (preview)
  - Modèle, tokens
  - Date de création
- Action : Voir les détails

**API** :
- Liste : `/api/admin/prompts`
- Stats : `/api/admin/prompts/stats`

#### Détails d'un prompt (`/admin/prompts/[promptId]`)

**Route** : `/admin/prompts/[promptId]`
**Fichier** : `app/admin/prompts/[promptId]/page.tsx`

**Fonctionnalités** :
- Métadonnées complètes :
  - Utilisateur, type, modèle
  - Tokens, langue, favori
  - Dates de création/modification
  - Tags
- Entrée complète avec contraintes
- Sortie complète
- Copie dans le presse-papiers

**API** : `/api/admin/prompts/[promptId]`

### Paramètres du Site (`/admin/settings`)

**Route** : `/admin/settings`
**Fichier** : `app/admin/settings/page.tsx`

**Fonctionnalités** :

#### Informations générales
- Nom du site
- URL du site (pour SEO)
- Email de support

#### Quotas par défaut
- Plan FREE (prompts/mois)
- Plan STARTER (prompts/mois)
- Plan PRO (prompts/mois, 999999 = illimité)

#### Tarification
- Prix STARTER (€/mois)
- Prix PRO (€/mois)
- ⚠️ Prix indicatifs, la vraie config est dans Stripe

#### Options du site
- Mode maintenance (toggle)
- Inscriptions activées (toggle)

**API** :
- GET : `/api/admin/settings`
- POST : `/api/admin/settings`

**Note** : Les paramètres sont actuellement stockés en mémoire. Pour la production, utiliser une base de données ou Redis.

## 🎨 Design System

### Couleurs
- Purple (#8B5CF6) pour les éléments admin
- Cyan (#06B6D4) pour les accents
- Gradient purple-to-pink pour les headers

### Icônes
- Shield : Interface admin
- Users : Gestion utilisateurs
- FileText : Gestion prompts
- Settings : Paramètres
- Sparkles : Loading states

### Animations
- Background gradient orbs (purple/cyan)
- Hover effects avec glow purple
- Transitions fluides

## 📊 API Routes

Toutes les routes admin sont protégées par :
1. Vérification authentification Clerk
2. Vérification email admin

### Structure des réponses

**Success** :
```json
{
  "data": {...},
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Error** :
```json
{
  "error": "Message d'erreur"
}
```

### Status codes
- `200` : Succès
- `401` : Non autorisé (non connecté)
- `403` : Accès refusé (non admin)
- `500` : Erreur serveur

## 🔄 Pagination

Toutes les listes utilisent la pagination :
- Limite par défaut : 20 items/page
- Paramètres : `?page=1&limit=20`
- Navigation : Boutons Previous/Next
- Affichage : "Page X sur Y"

## 🔍 Recherche et Filtres

### Utilisateurs
- Recherche : Email ou nom (case-insensitive)
- Pas de filtre supplémentaire

### Prompts
- Recherche : Contenu input/output (case-insensitive)
- Filtre : Type (ALL, GENERATE, IMPROVE)

## 🚀 Navigation

### Header Admin
- Bouton "Admin" visible uniquement pour les admins
- Icône Shield (🛡️)
- Couleur purple pour différenciation
- Présent dans HeaderSimple (desktop + mobile)

### Breadcrumbs
- Tous les sous-pages ont un bouton "Retour"
- Navigation claire entre les sections

## 📝 TODO / Améliorations Futures

### Phase 1 (Actuelle)
- ✅ Dashboard admin avec stats
- ✅ Gestion utilisateurs (liste, édition, suppression)
- ✅ Gestion prompts (liste, détails)
- ✅ Paramètres du site
- ✅ Protection par email admin

### Phase 2 (À venir)
- [ ] Persistance des paramètres en DB
- [ ] Logs d'activité admin
- [ ] Export CSV des utilisateurs/prompts
- [ ] Gestion des rôles (ADMIN, MODERATOR)
- [ ] Notifications par email
- [ ] Dashboard analytics avec graphiques

### Phase 3 (À venir)
- [ ] Gestion des paiements Stripe
- [ ] Remboursements
- [ ] Gestion des coupons
- [ ] Tableau de bord financier

### Phase 4 (À venir)
- [ ] Modération de contenu
- [ ] Bannissement d'utilisateurs
- [ ] Gestion des abus
- [ ] Support tickets

## 🔒 Sécurité

### Best Practices
1. **Jamais** exposer les routes admin sans vérification
2. **Toujours** vérifier l'email admin côté serveur
3. **Logger** toutes les actions admin critiques
4. **Limiter** le nombre d'admins
5. **Utiliser** des emails de production (pas @gmail.com)

### Variables d'environnement
```env
# Pas de variables spécifiques pour l'admin
# Les emails sont hardcodés dans le code
# Pour production : utiliser une DB pour les rôles
```

## 📚 Fichiers Clés

```
app/
├── admin/
│   ├── layout.tsx              # Layout admin avec protection
│   ├── page.tsx                # Dashboard admin
│   ├── users/
│   │   ├── page.tsx            # Liste utilisateurs
│   │   └── [userId]/
│   │       └── page.tsx        # Édition utilisateur
│   ├── prompts/
│   │   ├── page.tsx            # Liste prompts
│   │   └── [promptId]/
│   │       └── page.tsx        # Détails prompt
│   └── settings/
│       └── page.tsx            # Paramètres site
│
├── api/
│   └── admin/
│       ├── stats/
│       │   └── route.ts        # Stats dashboard
│       ├── users/
│       │   ├── route.ts        # Liste/recherche users
│       │   └── [userId]/
│       │       └── route.ts    # GET/PATCH/DELETE user
│       ├── prompts/
│       │   ├── route.ts        # Liste/recherche prompts
│       │   ├── stats/
│       │   │   └── route.ts    # Stats prompts
│       │   └── [promptId]/
│       │       └── route.ts    # GET prompt
│       └── settings/
│           └── route.ts        # GET/POST settings
│
components/
└── layout/
    └── HeaderSimple.tsx        # Header avec lien admin
```

## 🎯 Utilisation

### 1. Configuration initiale

1. Ajouter votre email admin dans tous les fichiers :
   - `app/admin/layout.tsx`
   - `app/api/admin/*/route.ts` (tous)
   - `components/layout/HeaderSimple.tsx`

2. Créer un compte Clerk avec cet email

3. Se connecter sur le site

4. Le bouton "Admin" apparaît automatiquement dans le header

### 2. Accéder à l'admin

- Cliquer sur le bouton "Admin" dans le header
- Ou naviguer directement vers `/admin`

### 3. Gérer les utilisateurs

1. Aller sur `/admin/users`
2. Rechercher un utilisateur
3. Cliquer sur "Modifier" (icône Edit)
4. Changer les informations
5. Sauvegarder

### 4. Gérer les prompts

1. Aller sur `/admin/prompts`
2. Filtrer par type si nécessaire
3. Cliquer sur "Voir" pour les détails
4. Copier le contenu si besoin

### 5. Configurer le site

1. Aller sur `/admin/settings`
2. Modifier les paramètres
3. Cliquer sur "Enregistrer les paramètres"

---

**Auteur** : Claude Code
**Date** : 22 Novembre 2025
**Version** : 1.0.0
