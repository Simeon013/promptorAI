-- Migration 007: Admin Customization (Pricing, Promotions, Promo Codes, Settings)
-- Description: Permet à l'admin de gérer dynamiquement les tarifs, promotions et codes promo

-- =============================================================================
-- 1. Table: admin_pricing_config
-- Gestion dynamique des tarifs et quotas par plan
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin_pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan TEXT NOT NULL CHECK (plan IN ('FREE', 'STARTER', 'PRO', 'ENTERPRISE')),

  -- Tarifs
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',

  -- Stripe IDs (générés automatiquement ou manuellement)
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,

  -- Quotas
  quota_limit INTEGER NOT NULL DEFAULT 10, -- -1 = illimité
  history_days INTEGER NOT NULL DEFAULT 7, -- -1 = illimité
  workspaces INTEGER NOT NULL DEFAULT 0, -- -1 = illimité

  -- Features
  api_access BOOLEAN NOT NULL DEFAULT false,
  analytics_access BOOLEAN NOT NULL DEFAULT false,
  priority_support BOOLEAN NOT NULL DEFAULT false,
  custom_models BOOLEAN NOT NULL DEFAULT false,

  -- Métadonnées
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by TEXT, -- Admin user ID

  UNIQUE(plan)
);

-- Index pour recherche rapide par plan
CREATE INDEX idx_pricing_config_plan ON admin_pricing_config(plan);

-- =============================================================================
-- 2. Table: admin_promotions
-- Gestion des promotions temporaires (appliquées automatiquement)
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,

  -- Type de promotion
  discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
  discount_value DECIMAL(10,2) NOT NULL, -- 20 pour 20% ou 5 pour 5€

  -- Applicabilité
  applicable_plans TEXT[] NOT NULL DEFAULT '{}', -- ['STARTER', 'PRO']
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'both')),

  -- Période de validité
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Limites
  max_redemptions INTEGER, -- NULL = illimité
  current_redemptions INTEGER NOT NULL DEFAULT 0,

  -- État
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Stripe
  stripe_promotion_code_id TEXT,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour recherche des promotions actives
CREATE INDEX idx_promotions_active ON admin_promotions(is_active, start_date, end_date);
CREATE INDEX idx_promotions_dates ON admin_promotions(start_date, end_date);

-- =============================================================================
-- 3. Table: admin_promo_codes
-- Codes promo (coupons Stripe) à entrer manuellement par l'utilisateur
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin_promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- Ex: 'LAUNCH2025'

  -- Réduction
  discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
  discount_value DECIMAL(10,2) NOT NULL,
  duration TEXT NOT NULL CHECK (duration IN ('once', 'repeating', 'forever')),
  duration_months INTEGER, -- Pour 'repeating'

  -- Applicabilité
  applicable_plans TEXT[] NOT NULL DEFAULT '{}',

  -- Limites
  max_redemptions INTEGER,
  current_redemptions INTEGER NOT NULL DEFAULT 0,
  first_time_only BOOLEAN NOT NULL DEFAULT false, -- Uniquement nouveaux clients

  -- Période de validité
  expires_at TIMESTAMP WITH TIME ZONE,

  -- État
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Stripe
  stripe_coupon_id TEXT NOT NULL,
  stripe_promotion_code_id TEXT,

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour recherche rapide par code
CREATE INDEX idx_promo_codes_code ON admin_promo_codes(code);
CREATE INDEX idx_promo_codes_active ON admin_promo_codes(is_active);
CREATE INDEX idx_promo_codes_expires ON admin_promo_codes(expires_at);

-- =============================================================================
-- 4. Table: promo_code_redemptions
-- Historique d'utilisation des codes promo
-- =============================================================================
CREATE TABLE IF NOT EXISTS promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES admin_promo_codes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour recherche par code promo et utilisateur
CREATE INDEX idx_redemptions_promo_code ON promo_code_redemptions(promo_code_id);
CREATE INDEX idx_redemptions_user ON promo_code_redemptions(user_id);

-- =============================================================================
-- 5. Table: admin_app_settings (extension)
-- Paramètres généraux de l'application
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin_app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  category TEXT, -- 'general', 'payment', 'ai', 'security', etc.
  is_public BOOLEAN NOT NULL DEFAULT false, -- Accessible côté client ?
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by TEXT
);

-- Index pour recherche par catégorie
CREATE INDEX idx_app_settings_category ON admin_app_settings(category);
CREATE INDEX idx_app_settings_public ON admin_app_settings(is_public);

-- =============================================================================
-- 6. Insertion des données initiales
-- =============================================================================

-- Tarifs par défaut (basés sur config/plans.ts)
INSERT INTO admin_pricing_config (plan, price_monthly, price_yearly, currency, quota_limit, history_days, workspaces, api_access, analytics_access, priority_support, custom_models, is_active)
VALUES
  ('FREE', 0, 0, 'EUR', 10, 7, 0, false, false, false, false, true),
  ('STARTER', 9, 90, 'EUR', 100, 30, 1, true, false, false, false, true),
  ('PRO', 29, 290, 'EUR', -1, -1, 5, true, true, true, false, true),
  ('ENTERPRISE', -1, -1, 'EUR', -1, -1, -1, true, true, true, true, true)
ON CONFLICT (plan) DO NOTHING;

-- Paramètres généraux par défaut
INSERT INTO admin_app_settings (key, value, type, description, category, is_public)
VALUES
  ('app_name', '"Promptor"', 'string', 'Nom de l''application', 'general', true),
  ('app_tagline', '"Générateur de prompts IA professionnel"', 'string', 'Slogan de l''application', 'general', true),
  ('payments_enabled', 'true', 'boolean', 'Activer les paiements Stripe', 'payment', false),
  ('default_currency', '"EUR"', 'string', 'Devise par défaut', 'payment', true),
  ('stripe_test_mode', 'false', 'boolean', 'Mode test Stripe', 'payment', false),
  ('promo_codes_enabled', 'true', 'boolean', 'Activer les codes promo', 'payment', true),
  ('free_quota_default', '10', 'number', 'Quota par défaut pour FREE', 'quotas', false),
  ('quota_reset_frequency', '"monthly"', 'string', 'Fréquence de reset des quotas', 'quotas', false),
  ('default_ai_provider', '"gemini"', 'string', 'Provider IA par défaut', 'ai', false),
  ('ai_request_timeout', '30', 'number', 'Timeout requêtes IA (secondes)', 'ai', false),
  ('max_tokens_per_request', '4096', 'number', 'Nombre max de tokens par requête', 'ai', false)
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 7. Fonctions utilitaires
-- =============================================================================

-- Fonction pour incrémenter les redemptions d'une promotion
CREATE OR REPLACE FUNCTION increment_promotion_redemptions(promotion_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE admin_promotions
  SET current_redemptions = current_redemptions + 1,
      updated_at = now()
  WHERE id = promotion_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour incrémenter les redemptions d'un code promo
CREATE OR REPLACE FUNCTION increment_promo_code_redemptions(code_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE admin_promo_codes
  SET current_redemptions = current_redemptions + 1,
      updated_at = now()
  WHERE id = code_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si une promotion est valide
CREATE OR REPLACE FUNCTION is_promotion_valid(promotion_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  promo admin_promotions;
BEGIN
  SELECT * INTO promo FROM admin_promotions WHERE id = promotion_id;

  IF promo IS NULL THEN
    RETURN false;
  END IF;

  -- Vérifier si active
  IF NOT promo.is_active THEN
    RETURN false;
  END IF;

  -- Vérifier les dates
  IF now() < promo.start_date OR now() > promo.end_date THEN
    RETURN false;
  END IF;

  -- Vérifier le nombre max de redemptions
  IF promo.max_redemptions IS NOT NULL AND promo.current_redemptions >= promo.max_redemptions THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un code promo est valide
CREATE OR REPLACE FUNCTION is_promo_code_valid(code_text TEXT, plan_name TEXT, user_id_param TEXT)
RETURNS TABLE (
  valid BOOLEAN,
  promo_code_id UUID,
  discount_type TEXT,
  discount_value DECIMAL,
  reason TEXT
) AS $$
DECLARE
  promo admin_promo_codes;
  is_first_time BOOLEAN;
BEGIN
  -- Récupérer le code promo
  SELECT * INTO promo FROM admin_promo_codes WHERE code = code_text;

  -- Code n'existe pas
  IF promo IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::DECIMAL, 'Code promo invalide';
    RETURN;
  END IF;

  -- Code inactif
  IF NOT promo.is_active THEN
    RETURN QUERY SELECT false, promo.id, NULL::TEXT, NULL::DECIMAL, 'Code promo désactivé';
    RETURN;
  END IF;

  -- Code expiré
  IF promo.expires_at IS NOT NULL AND now() > promo.expires_at THEN
    RETURN QUERY SELECT false, promo.id, NULL::TEXT, NULL::DECIMAL, 'Code promo expiré';
    RETURN;
  END IF;

  -- Nombre max de redemptions atteint
  IF promo.max_redemptions IS NOT NULL AND promo.current_redemptions >= promo.max_redemptions THEN
    RETURN QUERY SELECT false, promo.id, NULL::TEXT, NULL::DECIMAL, 'Code promo épuisé';
    RETURN;
  END IF;

  -- Vérifier si applicable au plan
  IF NOT (plan_name = ANY(promo.applicable_plans)) THEN
    RETURN QUERY SELECT false, promo.id, NULL::TEXT, NULL::DECIMAL, 'Code promo non applicable à ce plan';
    RETURN;
  END IF;

  -- Vérifier si réservé aux nouveaux clients
  IF promo.first_time_only THEN
    SELECT NOT EXISTS(
      SELECT 1 FROM users WHERE id = user_id_param AND plan != 'FREE'
    ) INTO is_first_time;

    IF NOT is_first_time THEN
      RETURN QUERY SELECT false, promo.id, NULL::TEXT, NULL::DECIMAL, 'Code promo réservé aux nouveaux clients';
      RETURN;
    END IF;
  END IF;

  -- Code valide
  RETURN QUERY SELECT true, promo.id, promo.discount_type, promo.discount_value, 'Code promo valide'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 8. Triggers pour mettre à jour updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pricing_config_updated_at
  BEFORE UPDATE ON admin_pricing_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON admin_promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON admin_promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON admin_app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 9. Commentaires sur les tables
-- =============================================================================

COMMENT ON TABLE admin_pricing_config IS 'Configuration dynamique des tarifs et quotas par plan';
COMMENT ON TABLE admin_promotions IS 'Promotions temporaires appliquées automatiquement';
COMMENT ON TABLE admin_promo_codes IS 'Codes promo à entrer manuellement par les utilisateurs';
COMMENT ON TABLE promo_code_redemptions IS 'Historique d''utilisation des codes promo';
COMMENT ON TABLE admin_app_settings IS 'Paramètres généraux de l''application';

COMMENT ON COLUMN admin_pricing_config.quota_limit IS '-1 = illimité, sinon nombre de prompts par mois';
COMMENT ON COLUMN admin_pricing_config.history_days IS '-1 = illimité, sinon nombre de jours d''historique';
COMMENT ON COLUMN admin_pricing_config.workspaces IS '-1 = illimité, sinon nombre de workspaces';
COMMENT ON COLUMN admin_promo_codes.duration IS 'once = une seule fois, repeating = X mois, forever = pour toujours';
COMMENT ON COLUMN admin_app_settings.is_public IS 'true = accessible côté client, false = admin uniquement';
