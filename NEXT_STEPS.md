# 🚀 Prochaines Étapes - Configuration Supabase

## État Actuel

✅ **Complété:**
- Next.js 15 avec App Router configuré
- Authentification Clerk intégrée (Sign In/Sign Up fonctionnels)
- API routes avec authentification et quotas
- Schéma Prisma complet
- Sauvegarde automatique des prompts en DB (une fois DB configurée)

⚠️ **En Attente:**
- Configuration Supabase avec vraies credentials
- Initialisation des tables de la base de données

## Configuration Supabase (10 minutes)

### 1. Créer un Compte Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Connectez-vous avec GitHub (recommandé)

### 2. Créer un Nouveau Projet

1. Cliquez sur "New Project"
2. Paramètres:
   - **Name:** promptor
   - **Database Password:** Créez un mot de passe fort (SAUVEGARDEZ-LE!)
   - **Region:** Choisissez la plus proche (Europe West pour la France)
   - **Pricing Plan:** Free (suffisant pour commencer)
3. Cliquez sur "Create new project"
4. ⏳ Attendez ~2 minutes que le projet soit provisionné

### 3. Récupérer la Connection String

1. Dans votre projet Supabase, allez dans **Settings** (⚙️ en bas à gauche)
2. Cliquez sur **Database** dans le menu de gauche
3. Scrollez jusqu'à **Connection string**
4. Sélectionnez l'onglet **URI**
5. Copiez l'URL qui ressemble à:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
6. Remplacez `[YOUR-PASSWORD]` par le mot de passe que vous avez créé à l'étape 2

### 4. Mettre à Jour les Variables d'Environnement

Ouvrez `.env` et `.env.local` et mettez à jour `DATABASE_URL`:

```env
# .env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxxxxxxxxxxxxx.supabase.co:5432/postgres"

# .env.local (même chose)
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxxxxxxxxxxxxx.supabase.co:5432/postgres"
```

### 5. Initialiser la Base de Données

```bash
# Pousser le schéma Prisma vers Supabase
npm run db:push
```

Vous devriez voir:
```
✔ Your database is now in sync with your Prisma schema.
```

### 6. Vérifier avec Prisma Studio

```bash
npm run db:studio
```

Cela ouvrira http://localhost:5555 où vous pourrez voir toutes vos tables:
- User
- Prompt
- Workspace
- WorkspaceMember
- ApiKey
- UsageHistory

## Test Complet

Une fois Supabase configuré:

1. **Lancez l'application:**
   ```bash
   npm run dev
   ```

2. **Créez un compte:**
   - Allez sur http://localhost:3000
   - Cliquez sur "S'inscrire"
   - Créez un compte test

3. **Testez la génération:**
   - Entrez une idée de prompt
   - Cliquez sur "Générer le Prompt"
   - Le prompt devrait être sauvegardé en DB automatiquement

4. **Vérifiez la DB:**
   - Ouvrez Prisma Studio (`npm run db:studio`)
   - Allez dans la table `Prompt`
   - Vous devriez voir votre prompt sauvegardé!

## Problèmes Courants

### Erreur: "Can't reach database server"
- Vérifiez que vous avez bien remplacé `[YOUR-PASSWORD]` par votre vrai mot de passe
- Vérifiez que l'URL commence bien par `postgresql://` et non `postgres://`
- Vérifiez qu'il n'y a pas d'espaces dans l'URL

### Erreur: "password authentication failed"
- Le mot de passe est incorrect
- Allez dans Supabase Settings → Database → Database password → Reset password

### Erreur: "Tenant or user not found"
- Vous utilisez peut-être la connection pooler URL au lieu de la direct connection
- Utilisez l'URL du port **5432** (pas 6543) pour `db:push`

## Support

- [Documentation Supabase](https://supabase.com/docs)
- [Guide Prisma + Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Guide Clerk Setup](./CLERK_SETUP.md)
