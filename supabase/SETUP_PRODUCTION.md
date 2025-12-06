# 🚀 Setup Supabase pour Production

Ce guide contient tous les scripts SQL à exécuter pour préparer Supabase pour la production.

## 📋 Checklist de migration

Exécutez ces scripts **dans l'ordre** via le SQL Editor de Supabase.

### ✅ Étape 1 : Fix contrainte email (FAIT)

**Fichier**: [fix-email-constraint.sql](fix-email-constraint.sql)

**Pourquoi**: Permet de recréer des comptes avec le même email (utile pour les tests et la gestion des utilisateurs).

```sql
-- Supprimer la contrainte unique sur l'email
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Créer un index pour la performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

**Statut**: ✅ Exécuté le 2 décembre 2025

---

### ⚠️ Étape 2 : Créer les indexes de performance (IMPORTANT)

**Fichier**: [create-performance-indexes.sql](create-performance-indexes.sql)

**Pourquoi**: Améliore drastiquement les performances des requêtes (recherche, pagination, tri).

**Ce que ça fait**:
- Index sur `users.email`, `users.plan`, `users.stripe_id`
- Index sur `prompts.user_id`, `prompts.created_at`, `prompts.favorited`
- Full-text search avec `pg_trgm` pour rechercher dans les prompts
- Index GIN pour recherche rapide dans `input` et `output`

**Commande**:
```bash
# Copier le contenu de create-performance-indexes.sql
# et l'exécuter dans Supabase SQL Editor
```

**Temps d'exécution**: ~30 secondes (dépend du nombre de prompts)

---

### 🔒 Étape 3 : Activer Row Level Security (CRITIQUE pour production)

**Fichier**: [enable-rls-policies.sql](enable-rls-policies.sql)

**Pourquoi**: Isole les données entre utilisateurs. Empêche un utilisateur de voir les prompts d'un autre.

**⚠️ ATTENTION**: RLS ne fonctionne PAS avec la clé service Supabase !

**Avant d'activer RLS, vous devez**:

1. **Configurer Clerk comme JWT provider dans Supabase**:
   - Aller dans Supabase Dashboard > Authentication > Providers
   - Ajouter un nouveau provider JWT
   - Utiliser le JWKS URL de Clerk: `https://clerk.YOUR_DOMAIN/.well-known/jwks.json`

2. **Modifier le code pour utiliser le JWT utilisateur**:
   ```typescript
   // Avant (utilise la clé service - bypass RLS)
   import { supabase } from '@/lib/db/supabase';

   // Après (utilise le JWT utilisateur - respecte RLS)
   import { createClient } from '@supabase/supabase-js';
   import { auth } from '@clerk/nextjs/server';

   const { getToken } = await auth();
   const token = await getToken({ template: 'supabase' });

   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
     {
       global: {
         headers: { Authorization: `Bearer ${token}` }
       }
     }
   );
   ```

3. **Exécuter le script RLS**:
   ```sql
   -- Copier le contenu de enable-rls-policies.sql
   -- et l'exécuter dans Supabase SQL Editor
   ```

**Statut**: ⏸️ **NE PAS ACTIVER EN DÉVELOPPEMENT** (on utilise la clé service)

**TODO avant production**:
- [ ] Configurer Clerk JWT provider
- [ ] Refactoriser le code pour utiliser les JWTs
- [ ] Tester l'isolation des données
- [ ] Exécuter enable-rls-policies.sql

---

## 🧪 Tests après migration

### Test 1 : Vérifier les indexes

```sql
-- Lister tous les index créés
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'prompts')
ORDER BY tablename, indexname;
```

**Résultat attendu**: Vous devriez voir ~15 indexes

### Test 2 : Vérifier l'extension pg_trgm

```sql
-- Vérifier que pg_trgm est activé
SELECT * FROM pg_extension WHERE extname = 'pg_trgm';
```

**Résultat attendu**: 1 ligne

### Test 3 : Tester la recherche full-text

```sql
-- Rechercher des prompts contenant "image"
SELECT id, input, similarity(input, 'image') AS score
FROM prompts
WHERE input % 'image' -- % est l'opérateur de similarité trigram
ORDER BY score DESC
LIMIT 10;
```

### Test 4 : Vérifier les policies RLS (si activé)

```sql
-- Afficher toutes les policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'prompts')
ORDER BY tablename, policyname;
```

**Résultat attendu**: 9 policies (4 pour users, 5 pour prompts)

---

## 📊 Monitoring des performances

### Surveiller l'utilisation des index

```sql
-- Index les plus utilisés
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Identifier les index inutilisés

```sql
-- Index jamais utilisés (candidats à la suppression)
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey' -- Exclure les clés primaires
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Taille totale des tables et index

```sql
-- Vue d'ensemble de l'utilisation de l'espace
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) -
                   pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🚨 Rollback en cas de problème

### Supprimer tous les indexes (si nécessaire)

```sql
-- ⚠️ NE PAS EXÉCUTER sauf en cas de problème critique !

DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_plan;
DROP INDEX IF EXISTS idx_users_stripe_id;
DROP INDEX IF EXISTS idx_users_subscription_id;
DROP INDEX IF EXISTS idx_users_quota;

DROP INDEX IF EXISTS idx_prompts_user_id;
DROP INDEX IF EXISTS idx_prompts_created_at;
DROP INDEX IF EXISTS idx_prompts_user_favorited;
DROP INDEX IF EXISTS idx_prompts_type;
DROP INDEX IF EXISTS idx_prompts_user_created;
DROP INDEX IF EXISTS idx_prompts_input_trgm;
DROP INDEX IF EXISTS idx_prompts_output_trgm;
DROP INDEX IF EXISTS idx_prompts_tags_gin;
```

### Désactiver RLS (si problème)

```sql
-- ⚠️ NE JAMAIS FAIRE EN PRODUCTION !

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE prompts DISABLE ROW LEVEL SECURITY;
```

---

## ✅ Checklist finale avant production

- [x] Fix contrainte email exécuté
- [ ] Indexes de performance créés
- [ ] RLS policies créées (mais pas activées en dev)
- [ ] Tests de performance effectués
- [ ] Monitoring configuré
- [ ] Backup automatique configuré dans Supabase
- [ ] Plan de rollback documenté

---

## 📚 Ressources

- [Supabase Performance Optimization](https://supabase.com/docs/guides/database/performance)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Full-Text Search with pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html)
