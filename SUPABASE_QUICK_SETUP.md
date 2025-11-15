# 🚀 Configuration Supabase - Méthode Simple (JS Client)

## Étape 1: Créer un Projet Supabase (5 min)

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Connectez-vous avec GitHub
4. Créez un nouveau projet:
   - **Name:** promptor
   - **Database Password:** Choisissez un mot de passe (vous n'en aurez pas besoin après)
   - **Region:** Europe West (ou la plus proche)
   - **Plan:** Free
5. Cliquez sur "Create new project"
6. ⏳ Attendez ~2 minutes

## Étape 2: Récupérer les Clés API (1 min)

1. Dans votre projet, cliquez sur l'icône ⚙️ **Settings** (en bas à gauche)
2. Allez dans **API** dans le menu de gauche
3. Vous verrez:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (commence par `eyJ...`)

## Étape 3: Mettre à Jour `.env.local` (1 min)

Ajoutez ces lignes dans `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL="votre_project_url_ici"
NEXT_PUBLIC_SUPABASE_ANON_KEY="votre_anon_key_ici"
```

Exemple:
```env
NEXT_PUBLIC_SUPABASE_URL="https://abcdefghijk.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Étape 4: Créer les Tables (3 min)

1. Dans Supabase, cliquez sur l'icône 🗄️ **SQL Editor** (menu de gauche)
2. Cliquez sur **New query**
3. Copiez-collez ce SQL:

```sql
-- Table des utilisateurs
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar TEXT,
  plan TEXT DEFAULT 'FREE' CHECK (plan IN ('FREE', 'STARTER', 'PRO', 'ENTERPRISE')),
  quota_used INTEGER DEFAULT 0,
  quota_limit INTEGER DEFAULT 10,
  stripe_id TEXT UNIQUE,
  subscription_id TEXT,
  reset_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des prompts
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('GENERATE', 'IMPROVE')),
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  constraints TEXT,
  language TEXT,
  model TEXT DEFAULT 'gemini-2.5-flash',
  tokens INTEGER,
  favorited BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_prompts_updated_at
BEFORE UPDATE ON prompts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

4. Cliquez sur **Run** (ou F5)
5. Vous devriez voir "Success. No rows returned"

## Étape 5: Configurer Row Level Security (2 min)

Pour sécuriser les données, ajoutez ces politiques RLS:

```sql
-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Politique pour users: les utilisateurs peuvent voir et modifier leur propre profil
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- Politique pour prompts: les utilisateurs peuvent voir et modifier leurs propres prompts
CREATE POLICY "Users can view own prompts"
  ON prompts FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own prompts"
  ON prompts FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own prompts"
  ON prompts FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own prompts"
  ON prompts FOR DELETE
  USING (auth.uid()::text = user_id);
```

## Étape 6: Tester

1. Redémarrez votre serveur Next.js:
   ```bash
   npm run dev
   ```

2. Allez sur http://localhost:3000
3. Connectez-vous ou créez un compte
4. Générez un prompt
5. Vérifiez dans Supabase:
   - Allez dans **Table Editor** (menu de gauche)
   - Sélectionnez la table `users` → vous devriez voir votre utilisateur
   - Sélectionnez la table `prompts` → vous devriez voir votre prompt

## ✅ C'est Fini!

Votre application est maintenant connectée à Supabase avec:
- ✅ Authentification Clerk + Supabase
- ✅ Sauvegarde des prompts en base de données
- ✅ Système de quotas fonctionnel
- ✅ Sécurité avec Row Level Security
- ✅ Dashboard avec statistiques

## Avantages de cette méthode

- 🚀 **Plus simple** - Pas besoin de Prisma ou de connection strings compliquées
- 🔒 **Plus sécurisé** - Row Level Security intégré
- 💰 **Gratuit** - 500MB de stockage, 2GB de bande passante/mois
- 🌍 **Temps réel** - Supporte les abonnements en temps réel (pour plus tard)
- 🎯 **Direct** - API REST et client JS simple

## Problèmes Courants

### Erreur: "Failed to fetch"
- Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` est correct
- Vérifiez que `NEXT_PUBLIC_SUPABASE_ANON_KEY` est correct
- Redémarrez le serveur Next.js

### Erreur: "relation does not exist"
- Les tables ne sont pas créées
- Re-exécutez le SQL de l'Étape 4

### Erreur: "new row violates row-level security policy"
- Vérifiez que vous avez exécuté l'Étape 5 (RLS)
- Assurez-vous que l'utilisateur est connecté

## Prochaines Étapes

Une fois que tout fonctionne:
- [ ] Configurer votre vraie clé Gemini API
- [ ] Tester le dashboard
- [ ] Ajouter Stripe pour les paiements (Phase 3)
