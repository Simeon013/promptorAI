-- ============================================================================
-- Performance Indexes pour Supabase
-- ============================================================================
--
-- Ces indexes optimisent les requêtes fréquentes de l'application
-- et améliorent les performances de la recherche full-text.
--
-- Date: 2 décembre 2025
-- ============================================================================

-- ============================================================================
-- Table: users
-- ============================================================================

-- Index sur l'email pour les recherches rapides (déjà créé par fix-email-constraint.sql)
-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index sur le plan pour filtrer par type d'abonnement
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);

-- Index sur stripe_id pour les webhooks Stripe
CREATE INDEX IF NOT EXISTS idx_users_stripe_id ON users(stripe_id)
WHERE stripe_id IS NOT NULL;

-- Index sur subscription_id pour les webhooks Stripe
CREATE INDEX IF NOT EXISTS idx_users_subscription_id ON users(subscription_id)
WHERE subscription_id IS NOT NULL;

-- Index composé pour les requêtes de quota
CREATE INDEX IF NOT EXISTS idx_users_quota ON users(id, quota_used, quota_limit, reset_date);

-- ============================================================================
-- Table: prompts
-- ============================================================================

-- Index sur user_id (clé étrangère) - CRITIQUE pour les performances
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);

-- Index sur created_at pour le tri chronologique
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);

-- Index composé pour les prompts favoris d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_prompts_user_favorited ON prompts(user_id, favorited)
WHERE favorited = true;

-- Index sur le type de prompt (GENERATE/IMPROVE)
CREATE INDEX IF NOT EXISTS idx_prompts_type ON prompts(user_id, type);

-- Index composé pour pagination et tri
CREATE INDEX IF NOT EXISTS idx_prompts_user_created ON prompts(user_id, created_at DESC);

-- ============================================================================
-- Full-Text Search Indexes
-- ============================================================================

-- Activer l'extension pg_trgm pour la recherche trigram (si pas déjà activée)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index GIN pour recherche full-text dans l'input
-- Permet de chercher rapidement dans les prompts avec LIKE, ILIKE, ou similarity
CREATE INDEX IF NOT EXISTS idx_prompts_input_trgm
ON prompts USING GIN (input gin_trgm_ops);

-- Index GIN pour recherche full-text dans l'output
CREATE INDEX IF NOT EXISTS idx_prompts_output_trgm
ON prompts USING GIN (output gin_trgm_ops);

-- Index GIN pour recherche dans les tags (si vous utilisez les tags)
CREATE INDEX IF NOT EXISTS idx_prompts_tags_gin ON prompts USING GIN (tags);

-- ============================================================================
-- Indexes pour les tables futures (commentés pour l'instant)
-- ============================================================================

-- Décommenter ces indexes une fois les tables créées

-- Table: workspaces
-- CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
-- CREATE INDEX IF NOT EXISTS idx_workspaces_created_at ON workspaces(created_at DESC);

-- Table: workspace_members
-- CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
-- CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
-- CREATE INDEX IF NOT EXISTS idx_workspace_members_role ON workspace_members(workspace_id, role);

-- Table: api_keys
-- CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
-- CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
-- CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(user_id, is_active)
-- WHERE is_active = true;

-- ============================================================================
-- Statistiques et Maintenance
-- ============================================================================

-- Analyser les tables pour mettre à jour les statistiques
ANALYZE users;
ANALYZE prompts;

-- Vérifier les index créés
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'prompts')
ORDER BY tablename, indexname;

-- Vérifier la taille des index
SELECT
    schemaname,
    relname AS tablename,
    indexrelname AS indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND relname IN ('users', 'prompts')
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. Les indexes GIN (Generalized Inverted Index) sont plus lents à créer
--    mais très performants pour les recherches full-text

-- 2. Les indexes partiels (avec WHERE) économisent de l'espace
--    en ne stockant que les lignes qui correspondent à la condition

-- 3. Pour les grandes tables (>100k lignes), créer les indexes de manière concurrente:
--    CREATE INDEX CONCURRENTLY idx_name ON table(column);
--    (évite de bloquer les écritures pendant la création)

-- 4. Surveiller l'utilisation des index en production:
--    SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
--    Si idx_scan = 0, l'index n'est jamais utilisé et peut être supprimé

-- 5. Maintenance automatique:
--    PostgreSQL gère automatiquement le VACUUM et ANALYZE
--    Pas besoin de tâches cron supplémentaires

-- ============================================================================
