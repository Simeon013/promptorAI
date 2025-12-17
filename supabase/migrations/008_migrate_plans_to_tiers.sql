-- ============================================================================
-- MIGRATION: Plans → Tiers
-- ============================================================================
-- Migration de l'ancien système basé sur Stripe (FREE/STARTER/PRO/ENTERPRISE)
-- vers le nouveau système de tiers basé sur les crédits (FREE/BRONZE/SILVER/GOLD/PLATINUM)
-- Créé le: 2025-12-14
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: Renommer la colonne 'plan' en 'tier' dans admin_model_config
-- ============================================================================

-- Renommer la colonne
ALTER TABLE admin_model_config
RENAME COLUMN plan TO tier;

-- Mettre à jour le commentaire
COMMENT ON COLUMN admin_model_config.tier IS 'Tier: FREE, BRONZE, SILVER, GOLD, PLATINUM';

-- Recréer l'index avec le nouveau nom
DROP INDEX IF EXISTS idx_admin_model_config_plan;
CREATE INDEX idx_admin_model_config_tier ON admin_model_config(tier);


-- ============================================================================
-- ÉTAPE 2: Migrer les données existantes vers les nouveaux tiers
-- ============================================================================

-- Supprimer les anciennes configurations Stripe
DELETE FROM admin_model_config;

-- Insérer les nouvelles configurations basées sur les tiers
INSERT INTO admin_model_config (tier, model_id, model_name, provider, is_default, priority) VALUES
  -- FREE: gemini-flash uniquement
  ('FREE', 'gemini-2.5-flash', 'Gemini 2.5 Flash', 'GEMINI', true, 1),

  -- BRONZE: gemini-flash uniquement
  ('BRONZE', 'gemini-2.5-flash', 'Gemini 2.5 Flash', 'GEMINI', true, 1),

  -- SILVER: gemini-flash (défaut) + gemini-pro
  ('SILVER', 'gemini-2.5-flash', 'Gemini 2.5 Flash', 'GEMINI', true, 2),
  ('SILVER', 'gemini-2.5-pro', 'Gemini 2.5 Pro', 'GEMINI', false, 1),

  -- GOLD: gemini-flash, gemini-pro (défaut), gpt-4
  ('GOLD', 'gemini-2.5-flash', 'Gemini 2.5 Flash', 'GEMINI', false, 2),
  ('GOLD', 'gemini-2.5-pro', 'Gemini 2.5 Pro', 'GEMINI', true, 3),
  ('GOLD', 'gpt-4', 'GPT-4', 'OPENAI', false, 1),

  -- PLATINUM: tous les modèles, gemini-pro par défaut
  ('PLATINUM', 'gemini-2.5-flash', 'Gemini 2.5 Flash', 'GEMINI', false, 3),
  ('PLATINUM', 'gemini-2.5-pro', 'Gemini 2.5 Pro', 'GEMINI', true, 4),
  ('PLATINUM', 'gpt-4', 'GPT-4', 'OPENAI', false, 2),
  ('PLATINUM', 'gpt-4o', 'GPT-4 Optimized', 'OPENAI', false, 1)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- ÉTAPE 3: Mettre à jour site_settings pour refléter les tiers
-- ============================================================================

-- Supprimer les anciens quotas Stripe
DELETE FROM site_settings WHERE key IN ('defaultQuotaStarter', 'defaultQuotaPro', 'priceStarter', 'pricePro', 'priceEnterprise');

-- Les nouveaux quotas sont gérés par le système de crédits
-- Pas besoin de settings supplémentaires ici


-- ============================================================================
-- ÉTAPE 4: Ajouter une fonction pour récupérer le modèle par tier
-- ============================================================================

CREATE OR REPLACE FUNCTION get_model_for_tier(p_tier TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_model_id TEXT;
BEGIN
  -- Récupérer le modèle par défaut pour ce tier
  SELECT model_id INTO v_model_id
  FROM admin_model_config
  WHERE tier = p_tier
    AND is_default = true
  ORDER BY priority DESC
  LIMIT 1;

  -- Si aucun modèle trouvé, fallback vers gemini-flash
  IF v_model_id IS NULL THEN
    RETURN 'gemini-2.5-flash';
  END IF;

  RETURN v_model_id;
END;
$$;

COMMENT ON FUNCTION get_model_for_tier IS 'Récupère le modèle par défaut pour un tier donné';


-- ============================================================================
-- ÉTAPE 5: Ajouter une fonction pour lister les modèles disponibles par tier
-- ============================================================================

CREATE OR REPLACE FUNCTION get_available_models_for_tier(p_tier TEXT)
RETURNS TABLE(
  model_id TEXT,
  model_name TEXT,
  provider TEXT,
  is_default BOOLEAN,
  priority INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    amc.model_id,
    amc.model_name,
    amc.provider,
    amc.is_default,
    amc.priority
  FROM admin_model_config amc
  WHERE amc.tier = p_tier
  ORDER BY amc.priority DESC, amc.model_name ASC;
END;
$$;

COMMENT ON FUNCTION get_available_models_for_tier IS 'Liste tous les modèles disponibles pour un tier donné';


-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
