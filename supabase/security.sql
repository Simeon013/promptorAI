-- =============================================================================
-- SUPABASE SECURITY CONFIGURATION
-- =============================================================================
-- Ce fichier contient les configurations de sécurité pour Supabase :
-- 1. Row Level Security (RLS) Policies
-- 2. Indexes pour la performance
-- 3. Table d'audit logs
--
-- IMPORTANT: Exécutez ce script dans l'éditeur SQL de Supabase Dashboard
-- =============================================================================

-- =============================================================================
-- 1. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table: users
-- Chaque utilisateur ne peut voir et modifier que ses propres données
-- -----------------------------------------------------------------------------

-- Activer RLS sur la table users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres données
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Les utilisateurs peuvent mettre à jour leurs propres données
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Permettre l'insertion (pour la création de compte via API)
-- Note: La route /api/auth/callback vérifie l'auth Clerk avant d'insérer
CREATE POLICY "users_insert_authenticated" ON users
  FOR INSERT
  WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- Table: prompts
-- Chaque utilisateur ne peut accéder qu'à ses propres prompts
-- -----------------------------------------------------------------------------

-- Activer RLS sur la table prompts
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres prompts
CREATE POLICY "prompts_select_own" ON prompts
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Les utilisateurs peuvent créer des prompts pour eux-mêmes
CREATE POLICY "prompts_insert_own" ON prompts
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Les utilisateurs peuvent mettre à jour leurs propres prompts
CREATE POLICY "prompts_update_own" ON prompts
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Les utilisateurs peuvent supprimer leurs propres prompts
CREATE POLICY "prompts_delete_own" ON prompts
  FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- =============================================================================
-- 2. INDEXES POUR LA PERFORMANCE
-- =============================================================================

-- Index sur user_id pour les requêtes filtrées par utilisateur
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);

-- Index sur created_at pour le tri chronologique (DESC pour les plus récents d'abord)
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);

-- Index composite pour les favoris d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_prompts_user_favorited ON prompts(user_id, favorited)
  WHERE favorited = true;

-- Index sur le type de prompt
CREATE INDEX IF NOT EXISTS idx_prompts_type ON prompts(user_id, type);

-- Index pour la recherche full-text (nécessite l'extension pg_trgm)
-- Décommenter si vous avez beaucoup de données et que la recherche est lente

-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_prompts_input_trgm ON prompts USING GIN (input gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS idx_prompts_output_trgm ON prompts USING GIN (output gin_trgm_ops);

-- Index sur users pour les lookups par email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index sur users pour les lookups par plan
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);

-- =============================================================================
-- 3. TABLE D'AUDIT LOGS
-- =============================================================================

-- Créer la table d'audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches par utilisateur
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);

-- Index pour les recherches par action
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- Index pour les recherches par date
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);

-- Index composite pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_audit_user_action ON audit_logs(user_id, action, created_at DESC);

-- Activer RLS sur audit_logs (lecture seule pour les admins)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Seuls les admins peuvent lire les logs (via service role)
-- Les utilisateurs normaux n'ont pas accès
CREATE POLICY "audit_logs_admin_only" ON audit_logs
  FOR ALL
  USING (false);

-- =============================================================================
-- 4. FONCTION POUR NETTOYER LES VIEUX LOGS
-- =============================================================================

-- Fonction pour supprimer les logs de plus de 90 jours
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 5. COMMENTAIRES SUR LES TABLES
-- =============================================================================

COMMENT ON TABLE users IS 'Utilisateurs de l''application, synchronisés depuis Clerk';
COMMENT ON TABLE prompts IS 'Historique des prompts générés par les utilisateurs';
COMMENT ON TABLE audit_logs IS 'Logs d''audit pour tracer les actions sensibles';

COMMENT ON COLUMN users.id IS 'ID Clerk de l''utilisateur';
COMMENT ON COLUMN users.plan IS 'Plan d''abonnement: FREE, STARTER, PRO, ENTERPRISE';
COMMENT ON COLUMN users.quota_used IS 'Nombre de prompts utilisés ce mois';
COMMENT ON COLUMN users.quota_limit IS 'Limite de prompts par mois (-1 = illimité)';

COMMENT ON COLUMN prompts.type IS 'Type de génération: GENERATE ou IMPROVE';
COMMENT ON COLUMN prompts.favorited IS 'Prompt marqué comme favori';

COMMENT ON COLUMN audit_logs.action IS 'Action effectuée: payment, plan_change, delete, etc.';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type de ressource: user, prompt, subscription';

-- =============================================================================
-- FIN DU SCRIPT
-- =============================================================================
--
-- IMPORTANT: Après avoir exécuté ce script :
-- 1. Vérifiez que RLS est activé dans Database > Tables
-- 2. Testez les policies avec différents utilisateurs
-- 3. Vérifiez que les indexes sont créés dans Database > Indexes
--
-- Pour désactiver temporairement RLS (debugging) :
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE prompts DISABLE ROW LEVEL SECURITY;
-- =============================================================================
