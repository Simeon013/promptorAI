# 🧪 Guide de Test de l'Interface Admin

**Date**: 22 Novembre 2025
**Objectif**: Tester toutes les fonctionnalités de l'interface admin de Promptor

---

## ✅ Étape 1 : Créer les tables dans Supabase

### Instructions pas à pas

1. **Connectez-vous à Supabase**
   - Allez sur https://app.supabase.com
   - Sélectionnez votre projet Promptor

2. **Ouvrez le SQL Editor**
   - Dans le menu de gauche, cliquez sur **SQL Editor**
   - Cliquez sur **New Query** (ou le bouton `+`)

3. **Copiez le SQL de migration**
   - Ouvrez le fichier `supabase/migrations/admin_tables.sql`
   - Sélectionnez TOUT le contenu (Ctrl+A)
   - Copiez (Ctrl+C)

4. **Exécutez la migration**
   - Collez le SQL dans l'éditeur Supabase (Ctrl+V)
   - Cliquez sur **Run** (ou Ctrl+Enter)
   - Attendez la confirmation "Success"

5. **Vérifiez les tables créées**
   - Allez dans **Table Editor** (menu de gauche)
   - Vous devriez voir 4 nouvelles tables :
     - ✅ `admin_logs`
     - ✅ `site_settings`
     - ✅ `admin_api_keys`
     - ✅ `admin_model_config`

6. **Vérifiez les données initiales**
   - Ouvrez la table `site_settings`
   - Vous devriez voir 11 lignes de configuration
   - Ouvrez la table `admin_model_config`
   - Vous devriez voir 4 lignes (1 par plan)

### ✅ Checklist de vérification

- [ ] Table `admin_logs` créée
- [ ] Table `site_settings` créée avec 11 paramètres
- [ ] Table `admin_api_keys` créée
- [ ] Table `admin_model_config` créée avec 4 modèles
- [ ] Fonction `log_admin_action()` créée
- [ ] Fonction `get_setting()` créée
- [ ] Fonction `update_setting()` créée
- [ ] Aucune erreur SQL affichée

---

## ✅ Étape 2 : Configurer les emails admin

1. **Ouvrez le fichier de configuration**
   ```
   lib/auth/admin.ts
   ```

2. **Ajoutez votre email**
   ```typescript
   export const ADMIN_EMAILS = [
     'admin@promptor.app',
     'simeondaouda@gmail.com',
     'votre-email@example.com', // ← Ajoutez votre email ici
   ];
   ```

3. **Sauvegardez le fichier**

### ✅ Checklist de vérification

- [ ] Fichier `lib/auth/admin.ts` modifié
- [ ] Votre email ajouté à la liste `ADMIN_EMAILS`
- [ ] Fichier sauvegardé

---

## ✅ Étape 3 : Accéder à l'interface admin

1. **Vérifiez que le serveur dev tourne**
   ```bash
   npm run dev
   ```
   - Devrait être sur http://localhost:3001 ou http://localhost:3000

2. **Connectez-vous avec un compte admin**
   - Si vous n'êtes pas connecté, allez sur `/sign-in`
   - Connectez-vous avec l'email que vous avez ajouté dans `ADMIN_EMAILS`

3. **Accédez à l'interface admin**
   - Allez sur http://localhost:3001/admin
   - Vous devriez voir le Dashboard admin avec sidebar

### ✅ Checklist de vérification

- [ ] Serveur de développement lancé
- [ ] Connecté avec un email admin
- [ ] Page `/admin` accessible
- [ ] Sidebar affichée avec 6 liens de navigation
- [ ] Thème toggle visible
- [ ] Aucune erreur dans la console (F12)

---

## 🧪 Étape 4 : Tester le Dashboard

**URL**: `/admin`

### Tests à effectuer

1. **Stats globales affichées**
   - [ ] Total utilisateurs (nombre)
   - [ ] Total prompts (nombre)
   - [ ] Abonnements actifs (nombre)
   - [ ] Revenu mensuel (€)

2. **Indicateurs de croissance**
   - [ ] Pourcentage de croissance des utilisateurs (30 jours)
   - [ ] Badges de couleur (vert = positif, rouge = négatif)

3. **Graphiques**
   - [ ] Graphique "Nouveaux utilisateurs" (6 derniers mois)
   - [ ] Graphique "Revenus mensuels" (6 derniers mois)
   - [ ] Les données correspondent à votre DB

4. **Top utilisateurs**
   - [ ] Liste des 5 utilisateurs les plus actifs
   - [ ] Avatar, nom, email affichés
   - [ ] Nombre de prompts généré affiché

5. **Distribution par plan**
   - [ ] FREE, STARTER, PRO, ENTERPRISE affichés
   - [ ] Nombre d'utilisateurs par plan correct
   - [ ] Pourcentages calculés correctement

### Bugs à noter

- Notez ici tout problème rencontré :
  - ...
  - ...

---

## 🧪 Étape 5 : Tester la page Users

**URL**: `/admin/users`

### Tests à effectuer

1. **Liste des utilisateurs**
   - [ ] Tous les utilisateurs affichés (pagination 20/page)
   - [ ] Avatar, nom, email, plan affichés
   - [ ] Quota utilisé / limite affichés
   - [ ] Badge de plan coloré

2. **Recherche**
   - [ ] Tapez un nom d'utilisateur → résultat filtré
   - [ ] Tapez un email → résultat filtré
   - [ ] Effacez la recherche → liste complète

3. **Filtres**
   - [ ] Filtre "Tous les plans" fonctionne
   - [ ] Filtre "FREE" affiche uniquement FREE
   - [ ] Filtre "STARTER" affiche uniquement STARTER
   - [ ] Filtre "PRO" affiche uniquement PRO
   - [ ] Toggle "Quota dépassé" fonctionne

4. **Actions**
   - [ ] Bouton "Modifier le plan" ouvre un modal (TODO)
   - [ ] Bouton "Supprimer" affiche une confirmation (TODO)

5. **Pagination**
   - [ ] Boutons Précédent/Suivant fonctionnent
   - [ ] Numéro de page affiché
   - [ ] Maximum 20 utilisateurs par page

### Bugs à noter

- ...

---

## 🧪 Étape 6 : Tester la page Prompts

**URL**: `/admin/prompts`

### Tests à effectuer

1. **Stats cards**
   - [ ] Total prompts affiché
   - [ ] Prompts GENERATE comptés
   - [ ] Prompts IMPROVE comptés
   - [ ] Tokens totaux calculés

2. **Liste des prompts**
   - [ ] Prompts affichés en grille
   - [ ] Type (GENERATE/IMPROVE) visible
   - [ ] User email affiché
   - [ ] Input/Output affichés (tronqués)
   - [ ] Date affichée

3. **Recherche**
   - [ ] Recherche dans input fonctionne
   - [ ] Recherche dans output fonctionne

4. **Filtres**
   - [ ] Filtre "Tous" affiche tout
   - [ ] Filtre "GENERATE" affiche uniquement GENERATE
   - [ ] Filtre "IMPROVE" affiche uniquement IMPROVE

5. **Actions**
   - [ ] Bouton "Copier" copie dans le presse-papiers
   - [ ] Bouton "Voir détails" affiche le modal (TODO)
   - [ ] Bouton "Supprimer" supprime avec confirmation (TODO)

### Bugs à noter

- ...

---

## 🧪 Étape 7 : Tester la page API Keys

**URL**: `/admin/api-keys`

### Tests à effectuer

#### Tab 1 : Clés API

1. **Affichage des providers**
   - [ ] 4 providers affichés (Gemini, OpenAI, Claude, Mistral)
   - [ ] Clés masquées par défaut (••••••)
   - [ ] Bouton "Afficher" révèle la clé

2. **Modification des clés**
   - [ ] Cliquez "Modifier" sur GEMINI_API_KEY
   - [ ] Input devient éditable
   - [ ] Tapez une nouvelle clé
   - [ ] Cliquez "Enregistrer"
   - [ ] Clé mise à jour (vérifiez dans Supabase)

3. **Test des clés**
   - [ ] Bouton "Tester" visible
   - [ ] Cliquez "Tester" sur une clé valide
   - [ ] Badge vert "Valid" affiché
   - [ ] Cliquez "Tester" sur une clé invalide
   - [ ] Badge rouge "Invalid" affiché

4. **Statut actif/inactif**
   - [ ] Toggle "Actif" fonctionne
   - [ ] État sauvegardé

#### Tab 2 : Modèles & Plans

1. **Configuration par plan**
   - [ ] 4 plans affichés (FREE, STARTER, PRO, ENTERPRISE)
   - [ ] Dropdown de sélection de modèle
   - [ ] Modèle actuel pré-sélectionné

2. **Modification des modèles**
   - [ ] Changez le modèle pour FREE
   - [ ] Cliquez "Sauvegarder les modifications"
   - [ ] Configuration mise à jour (vérifiez dans Supabase)

3. **Modèle global**
   - [ ] Dropdown "Modèle par défaut" affiché
   - [ ] Changement de modèle fonctionne

### Bugs à noter

- ...

---

## 🧪 Étape 8 : Tester la page Logs

**URL**: `/admin/logs`

**Note**: Cette page sera vide au début car aucune action admin n'a été loggée encore.

### Tests à effectuer

1. **Liste des logs**
   - [ ] Si vide : message "Aucun log trouvé" affiché
   - [ ] Si logs existent : liste affichée

2. **Filtres**
   - [ ] Filtre par niveau (success, error, warning, info)
   - [ ] Filtre par catégorie (auth, users, prompts, settings, etc.)
   - [ ] Combinaison de filtres fonctionne

3. **Recherche**
   - [ ] Recherche dans les détails fonctionne

4. **Pagination**
   - [ ] 50 logs par page maximum
   - [ ] Boutons Précédent/Suivant fonctionnent

5. **Affichage**
   - [ ] Timestamp affiché
   - [ ] Acteur (nom + email) affiché
   - [ ] Action affichée
   - [ ] Badge de statut coloré
   - [ ] Détails affichés (si présents)

### Test manuel : Créer un log

Dans Supabase SQL Editor, exécutez :

```sql
SELECT log_admin_action(
  'Admin Test',
  'simeondaouda@gmail.com',
  'Test manuel',
  'settings',
  'info',
  'Test de création de log depuis SQL'
);
```

- [ ] Log créé dans la table `admin_logs`
- [ ] Log visible dans l'interface `/admin/logs`

### Bugs à noter

- ...

---

## 🧪 Étape 9 : Tester la page Settings

**URL**: `/admin/settings`

### Tests à effectuer

#### Section 1 : Informations générales

1. **Champs affichés**
   - [ ] Nom du site (Promptor)
   - [ ] URL du site (https://promptor.app)
   - [ ] Email de support (support@promptor.app)

2. **Modification**
   - [ ] Modifiez le nom du site → "Promptor Test"
   - [ ] Cliquez "Sauvegarder les modifications"
   - [ ] Vérifiez dans Supabase `site_settings`
   - [ ] Valeur mise à jour

#### Section 2 : Quotas par défaut

1. **Champs affichés**
   - [ ] Quota FREE (10)
   - [ ] Quota STARTER (100)
   - [ ] Quota PRO (999999)

2. **Modification**
   - [ ] Changez quota FREE → 15
   - [ ] Sauvegardez
   - [ ] Vérifiez dans Supabase

#### Section 3 : Tarification

1. **Champs affichés**
   - [ ] Prix STARTER (9€)
   - [ ] Prix PRO (29€)
   - [ ] Prix ENTERPRISE (99€)

2. **Modification**
   - [ ] Changez un prix
   - [ ] Sauvegardez
   - [ ] Vérifiez dans Supabase

#### Section 4 : Options

1. **Toggles affichés**
   - [ ] Mode maintenance (désactivé par défaut)
   - [ ] Inscriptions activées (activé par défaut)

2. **Modification**
   - [ ] Activez le mode maintenance
   - [ ] Sauvegardez
   - [ ] Vérifiez dans Supabase (`maintenanceMode` = true)
   - [ ] Désactivez-le
   - [ ] Sauvegardez à nouveau

### Bugs à noter

- ...

---

## 🧪 Étape 10 : Tests de navigation et UX

### Tests généraux

1. **Navigation sidebar**
   - [ ] Cliquez sur chaque lien de navigation
   - [ ] Active page indicator (ChevronRight) fonctionne
   - [ ] URL change correctement
   - [ ] Contenu de la page change

2. **Theme toggle**
   - [ ] Cliquez sur le bouton theme (Sun/Moon)
   - [ ] Thème bascule entre light et dark
   - [ ] Toutes les pages s'adaptent au thème
   - [ ] Icône change (Sun ↔ Moon)

3. **Mobile responsive**
   - [ ] Réduisez la fenêtre < 1024px
   - [ ] Sidebar disparaît
   - [ ] Menu hamburger apparaît
   - [ ] Cliquez sur hamburger → sidebar s'ouvre
   - [ ] Cliquez sur X → sidebar se ferme
   - [ ] Cliquez sur un lien → sidebar se ferme

4. **Bouton "Quitter Admin"**
   - [ ] Cliquez sur "Quitter Admin"
   - [ ] Redirection vers `/dashboard`

5. **Protection admin**
   - [ ] Déconnectez-vous
   - [ ] Essayez d'accéder à `/admin`
   - [ ] Redirection vers `/sign-in`
   - [ ] Connectez-vous avec un email NON-admin
   - [ ] Essayez d'accéder à `/admin`
   - [ ] Redirection vers `/dashboard`

### Bugs à noter

- ...

---

## 📊 Résumé des tests

### Statistiques

- **Pages testées** : __ / 6
- **Features testées** : __ / 50+
- **Bugs trouvés** : __
- **Bugs critiques** : __

### Liste des bugs

1. ...
2. ...
3. ...

### Prochaines étapes

- [ ] Corriger les bugs identifiés
- [ ] Implémenter les TODOs (modals, confirmations)
- [ ] Ajouter les fonctionnalités manquantes
- [ ] Tester en production

---

## ✅ Validation finale

- [ ] Toutes les tables Supabase créées
- [ ] Toutes les pages admin accessibles
- [ ] Aucune erreur console
- [ ] Aucun bug critique
- [ ] Interface responsive
- [ ] Thème dark/light fonctionne
- [ ] Navigation fluide
- [ ] Prêt pour la production

---

**Date de test** : ___________
**Testeur** : ___________
**Statut** : ⬜ En cours | ⬜ Terminé | ⬜ Bugs à corriger
