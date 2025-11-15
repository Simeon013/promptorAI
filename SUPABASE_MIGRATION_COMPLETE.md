# ✅ Migration vers Supabase JS Client - Terminée

## Ce qui a été fait

### 1. Installation de Supabase JS Client ✅
```bash
npm install @supabase/supabase-js
```

### 2. Configuration Supabase ✅

**Fichiers créés:**
- `lib/db/supabase.ts` - Client Supabase avec types TypeScript
- `lib/auth/supabase-clerk.ts` - Helpers d'authentification et quotas avec Supabase
- `.env.example` - Template pour les variables d'environnement

### 3. Migration complète de Prisma → Supabase ✅

**Fichiers mis à jour:**

1. **`lib/api/auth-helper.ts`**
   - Import changé de `@/lib/auth/clerk` → `@/lib/auth/supabase-clerk`
   - Utilise maintenant les fonctions Supabase

2. **`app/api/generate/route.ts`**
   - Remplacé Prisma par Supabase client
   - Utilise `supabase.from('prompts').insert()` au lieu de `prisma.prompt.create()`
   - Champs snake_case (`user_id`, `created_at`) au lieu de camelCase

3. **`app/api/suggestions/route.ts`**
   - Import changé pour utiliser `@/lib/auth/supabase-clerk`

4. **`app/(dashboard)/dashboard/page.tsx`**
   - Remplacé toutes les requêtes Prisma par Supabase
   - Utilise `supabase.from('users').select()`
   - Utilise `supabase.from('prompts').select().order().limit()`
   - Ajusté pour les noms de colonnes snake_case

## Avantages de cette Approche

### ✅ Plus Simple
- Pas de schéma Prisma à maintenir
- Pas de migrations complexes
- Pas de problèmes de connection pooler vs direct connection

### ✅ Plus Direct
- API REST simple et intuitive
- Client JavaScript natif
- Fonctionne immédiatement avec Supabase

### ✅ Plus Flexible
- Support des subscriptions temps réel (pour plus tard)
- Fonctions PostgreSQL natives accessibles
- Row Level Security intégré

### ✅ Moins de Dépendances
- Suppression de `@prisma/client`
- Suppression de `prisma` (dev dependency)
- Un seul package: `@supabase/supabase-js`

## Prochaines Étapes

### Pour activer complètement:

1. **Créer un projet Supabase** (gratuit)
   - Suivez le guide: [SUPABASE_QUICK_SETUP.md](SUPABASE_QUICK_SETUP.md)
   - 5 minutes de configuration

2. **Récupérer les clés API**
   - Project URL
   - Anon Key (publique)

3. **Mettre à jour `.env.local`**
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJ..."
   ```

4. **Créer les tables SQL** (copier-coller dans Supabase SQL Editor)
   - Table `users`
   - Table `prompts`
   - Row Level Security policies

5. **Tester**
   ```bash
   npm run dev
   ```
   - Créez un compte
   - Générez un prompt
   - Vérifiez dans Supabase Table Editor

## Structure de la Base de Données

### Table `users`
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,                    -- ID de Clerk
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar TEXT,
  plan TEXT DEFAULT 'FREE',               -- FREE, STARTER, PRO, ENTERPRISE
  quota_used INTEGER DEFAULT 0,
  quota_limit INTEGER DEFAULT 10,
  stripe_id TEXT UNIQUE,
  subscription_id TEXT,
  reset_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table `prompts`
```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,                     -- GENERATE ou IMPROVE
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
```

## Exemples de Requêtes

### Créer un utilisateur
```typescript
const { data, error } = await supabase
  .from('users')
  .insert({
    id: userId,
    email: 'user@example.com',
    plan: 'FREE',
    quota_used: 0,
    quota_limit: 10,
  })
  .select()
  .single();
```

### Récupérer les prompts d'un utilisateur
```typescript
const { data: prompts } = await supabase
  .from('prompts')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10);
```

### Compter les prompts
```typescript
const { count } = await supabase
  .from('prompts')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId);
```

### Incrémenter le quota
```typescript
const { data: user } = await supabase
  .from('users')
  .select('quota_used')
  .eq('id', userId)
  .single();

await supabase
  .from('users')
  .update({ quota_used: user.quota_used + 1 })
  .eq('id', userId);
```

## Sécurité avec Row Level Security (RLS)

Supabase utilise PostgreSQL RLS pour sécuriser les données:

```sql
-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent seulement voir leurs propres données
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can view own prompts"
  ON prompts FOR SELECT
  USING (auth.uid()::text = user_id);
```

Cela signifie que même si quelqu'un obtient votre `ANON_KEY`, il ne peut pas accéder aux données des autres utilisateurs.

## Nettoyage (Optionnel)

Si vous voulez supprimer complètement Prisma:

```bash
npm uninstall prisma @prisma/client
rm -rf prisma/
rm .env  # Gardez .env.local
```

## Documentation

- [Guide de configuration Supabase](SUPABASE_QUICK_SETUP.md)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Supabase-js](https://supabase.com/docs/reference/javascript/introduction)

---

**Status:** Migration terminée - Prêt pour la configuration Supabase

Date: 15 Novembre 2025
