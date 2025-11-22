-- ============================================================================
-- ADMIN TABLES MIGRATION
-- ============================================================================
-- Ce fichier contient les tables nécessaires pour l'interface admin
-- Créé le: 2025-11-22
-- ============================================================================

-- ============================================================================
-- TABLE: admin_logs
-- Description: Logs d'activité pour toutes les actions administratives
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Informations sur l'acteur
  actor TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  actor_id TEXT, -- Clerk user ID

  -- Informations sur l'action
  action TEXT NOT NULL,
  resource TEXT NOT NULL, -- 'auth', 'users', 'prompts', 'settings', 'api_keys', 'payments'
  resource_id TEXT,

  -- Statut et détails
  status TEXT NOT NULL DEFAULT 'info', -- 'success', 'error', 'warning', 'info'
  details TEXT,

  -- Métadonnées
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,

  -- Index pour recherche rapide
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche et tri rapides
CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON admin_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_actor_email ON admin_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_admin_logs_resource ON admin_logs(resource);
CREATE INDEX IF NOT EXISTS idx_admin_logs_status ON admin_logs(status);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- Commentaires
COMMENT ON TABLE admin_logs IS 'Logs d''activité pour toutes les actions administratives';
COMMENT ON COLUMN admin_logs.resource IS 'Type de ressource: auth, users, prompts, settings, api_keys, payments';
COMMENT ON COLUMN admin_logs.status IS 'Statut de l''action: success, error, warning, info';


-- ============================================================================
-- TABLE: site_settings
-- Description: Configuration globale du site Promptor
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general', -- 'general', 'quotas', 'pricing', 'features'
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT, -- Email de l'admin qui a fait la modification
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour recherche rapide par clé
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);

-- Commentaires
COMMENT ON TABLE site_settings IS 'Configuration globale du site Promptor';
COMMENT ON COLUMN site_settings.key IS 'Clé unique de configuration (ex: siteName, defaultQuotaFree)';
COMMENT ON COLUMN site_settings.value IS 'Valeur de la configuration au format JSON';
COMMENT ON COLUMN site_settings.category IS 'Catégorie: general, quotas, pricing, features';


-- ============================================================================
-- TABLE: admin_api_keys
-- Description: Stockage sécurisé des clés API pour les providers IA
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT UNIQUE NOT NULL, -- 'GEMINI', 'OPENAI', 'CLAUDE', 'MISTRAL'
  api_key_encrypted TEXT, -- Clé chiffrée (à implémenter avec pgcrypto)
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_tested_at TIMESTAMPTZ,
  last_test_status BOOLEAN,
  default_model TEXT,
  metadata JSONB, -- Configuration spécifique au provider
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT, -- Email de l'admin
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_api_keys_provider ON admin_api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_admin_api_keys_is_active ON admin_api_keys(is_active);

-- Commentaires
COMMENT ON TABLE admin_api_keys IS 'Stockage sécurisé des clés API pour les providers IA';
COMMENT ON COLUMN admin_api_keys.provider IS 'Provider: GEMINI, OPENAI, CLAUDE, MISTRAL';
COMMENT ON COLUMN admin_api_keys.api_key_encrypted IS 'Clé API chiffrée (utiliser pgcrypto en production)';


-- ============================================================================
-- TABLE: admin_model_config
-- Description: Configuration des modèles IA par plan d'abonnement
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_model_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan TEXT NOT NULL, -- 'FREE', 'STARTER', 'PRO', 'ENTERPRISE'
  model_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'GEMINI', 'OPENAI', 'CLAUDE', 'MISTRAL'
  is_default BOOLEAN NOT NULL DEFAULT false,
  priority INT NOT NULL DEFAULT 0, -- Plus élevé = priorité plus haute
  max_tokens INT,
  temperature DECIMAL(3,2),
  metadata JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_admin_model_config_plan ON admin_model_config(plan);
CREATE INDEX IF NOT EXISTS idx_admin_model_config_provider ON admin_model_config(provider);
CREATE INDEX IF NOT EXISTS idx_admin_model_config_is_default ON admin_model_config(is_default);

-- Commentaires
COMMENT ON TABLE admin_model_config IS 'Configuration des modèles IA par plan d''abonnement';
COMMENT ON COLUMN admin_model_config.plan IS 'Plan: FREE, STARTER, PRO, ENTERPRISE';
COMMENT ON COLUMN admin_model_config.priority IS 'Priorité du modèle (plus élevé = prioritaire)';


-- ============================================================================
-- DONNÉES INITIALES: site_settings
-- ============================================================================
INSERT INTO site_settings (key, value, description, category) VALUES
  ('siteName', '"Promptor"', 'Nom du site', 'general'),
  ('siteUrl', '"https://promptor.app"', 'URL du site', 'general'),
  ('supportEmail', '"support@promptor.app"', 'Email de support', 'general'),
  ('defaultQuotaFree', '10', 'Quota mensuel pour plan FREE', 'quotas'),
  ('defaultQuotaStarter', '100', 'Quota mensuel pour plan STARTER', 'quotas'),
  ('defaultQuotaPro', '999999', 'Quota mensuel pour plan PRO (illimité)', 'quotas'),
  ('priceStarter', '9', 'Prix mensuel STARTER en euros', 'pricing'),
  ('pricePro', '29', 'Prix mensuel PRO en euros', 'pricing'),
  ('priceEnterprise', '99', 'Prix mensuel ENTERPRISE en euros', 'pricing'),
  ('maintenanceMode', 'false', 'Mode maintenance activé', 'features'),
  ('registrationEnabled', 'true', 'Inscriptions autorisées', 'features')
ON CONFLICT (key) DO NOTHING;


-- ============================================================================
-- DONNÉES INITIALES: admin_model_config
-- ============================================================================
INSERT INTO admin_model_config (plan, model_id, model_name, provider, is_default, priority) VALUES
  ('FREE', 'gemini-2.5-flash', 'Gemini 2.5 Flash', 'GEMINI', true, 1),
  ('STARTER', 'gemini-2.5-flash', 'Gemini 2.5 Flash', 'GEMINI', true, 1),
  ('PRO', 'gpt-4o-mini', 'GPT-4 Mini', 'OPENAI', true, 1),
  ('ENTERPRISE', 'gpt-4o', 'GPT-4 Optimized', 'OPENAI', true, 1)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour logger une action admin
CREATE OR REPLACE FUNCTION log_admin_action(
  p_actor TEXT,
  p_actor_email TEXT,
  p_action TEXT,
  p_resource TEXT,
  p_status TEXT DEFAULT 'info',
  p_details TEXT DEFAULT NULL,
  p_resource_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_logs (
    actor,
    actor_email,
    action,
    resource,
    status,
    details,
    resource_id,
    ip_address
  ) VALUES (
    p_actor,
    p_actor_email,
    p_action,
    p_resource,
    p_status,
    p_details,
    p_resource_id,
    p_ip_address
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION log_admin_action IS 'Fonction utilitaire pour créer un log d''action admin';


-- Fonction pour récupérer une setting
CREATE OR REPLACE FUNCTION get_setting(p_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_value JSONB;
BEGIN
  SELECT value INTO v_value
  FROM site_settings
  WHERE key = p_key;

  RETURN v_value;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION get_setting IS 'Récupère la valeur d''une configuration par sa clé';


-- Fonction pour mettre à jour une setting
CREATE OR REPLACE FUNCTION update_setting(
  p_key TEXT,
  p_value JSONB,
  p_updated_by TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE site_settings
  SET
    value = p_value,
    updated_by = p_updated_by,
    updated_at = NOW()
  WHERE key = p_key;

  RETURN FOUND;
END;
$$;

-- Commentaire
COMMENT ON FUNCTION update_setting IS 'Met à jour la valeur d''une configuration';


-- ============================================================================
-- PERMISSIONS (RLS désactivé pour l'instant)
-- ============================================================================
-- Note: En production, activer RLS et créer des policies pour sécuriser l'accès
-- ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE admin_api_keys ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE admin_model_config ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
