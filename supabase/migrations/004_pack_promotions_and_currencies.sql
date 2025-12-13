-- Migration : Promotions sur les packs et multi-devises
-- Date : 2025-12-13
-- Description : Ajouter promotions/réductions sur les packs + support multi-devises

-- ============================================================================
-- Table : pack_promotions
-- Promotions/réductions applicables aux packs de crédits
-- ============================================================================
CREATE TABLE IF NOT EXISTS pack_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations de base
  name TEXT NOT NULL,                    -- 'Black Friday 2025', 'Promo Noël'
  description TEXT,
  code TEXT UNIQUE,                      -- Code promo optionnel pour la promotion

  -- Ciblage
  pack_id UUID REFERENCES credit_packs(id) ON DELETE CASCADE,  -- null = tous les packs
  all_packs BOOLEAN DEFAULT false,       -- Si true, s'applique à tous les packs

  -- Type de réduction
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value INTEGER NOT NULL,       -- Pourcentage (20 = 20%) ou montant fixe

  -- Période de validité
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,

  -- Limites d'utilisation
  max_uses INTEGER,                      -- Nombre max d'utilisations (null = illimité)
  uses_count INTEGER DEFAULT 0,          -- Compteur d'utilisations
  max_uses_per_user INTEGER DEFAULT 1,   -- Max par utilisateur

  -- Configuration
  is_active BOOLEAN DEFAULT true,
  is_stackable BOOLEAN DEFAULT false,    -- Cumulable avec codes promo ?
  priority INTEGER DEFAULT 0,            -- Ordre d'application (plus haut = prioritaire)

  -- Affichage
  show_on_pricing BOOLEAN DEFAULT true,  -- Afficher sur la page pricing
  badge_text TEXT,                       -- 'PROMO -20%', 'SOLDES'
  badge_color TEXT,                      -- Couleur du badge

  -- Métadonnées
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT                        -- Admin qui a créé la promo
);

-- ============================================================================
-- Table : pack_promotion_uses
-- Suivi des utilisations des promotions
-- ============================================================================
CREATE TABLE IF NOT EXISTS pack_promotion_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  promotion_id UUID NOT NULL REFERENCES pack_promotions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES credit_purchases(id) ON DELETE SET NULL,

  discount_applied INTEGER NOT NULL,     -- Montant de la réduction appliquée

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(promotion_id, user_id, purchase_id)
);

-- ============================================================================
-- Table : currency_rates
-- Taux de change pour les devises
-- ============================================================================
CREATE TABLE IF NOT EXISTS currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  currency TEXT NOT NULL UNIQUE,         -- 'XOF', 'EUR', 'USD'
  name TEXT NOT NULL,                    -- 'Franc CFA', 'Euro', 'Dollar US'
  symbol TEXT NOT NULL,                  -- 'FCFA', '€', '$'

  -- Taux de change (base = XOF)
  rate_to_xof NUMERIC(12, 4) NOT NULL,   -- Combien de FCFA pour 1 unité
  rate_from_xof NUMERIC(12, 6) NOT NULL, -- Combien d'unités pour 1 FCFA

  -- Configuration
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  decimals INTEGER DEFAULT 0,            -- Nombre de décimales

  -- Affichage
  display_format TEXT,                   -- '{amount} {symbol}', '{symbol}{amount}'

  -- Métadonnées
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Étendre credit_packs pour multi-devises
-- ============================================================================
ALTER TABLE credit_packs
  ADD COLUMN IF NOT EXISTS price_usd INTEGER,
  ADD COLUMN IF NOT EXISTS price_eur INTEGER,
  ADD COLUMN IF NOT EXISTS price_xof INTEGER;

-- Migrer les prix existants vers price_xof
UPDATE credit_packs SET price_xof = price WHERE price_xof IS NULL;

-- ============================================================================
-- Étendre credit_purchases pour les promotions
-- ============================================================================
ALTER TABLE credit_purchases
  ADD COLUMN IF NOT EXISTS promotion_id UUID REFERENCES pack_promotions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS promotion_name TEXT,
  ADD COLUMN IF NOT EXISTS promotion_discount INTEGER DEFAULT 0;

-- ============================================================================
-- Index
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_pack_promotions_active ON pack_promotions(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_pack_promotions_pack_id ON pack_promotions(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_promotions_code ON pack_promotions(code) WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pack_promotions_dates ON pack_promotions(starts_at, ends_at);

CREATE INDEX IF NOT EXISTS idx_pack_promotion_uses_promotion ON pack_promotion_uses(promotion_id);
CREATE INDEX IF NOT EXISTS idx_pack_promotion_uses_user ON pack_promotion_uses(user_id);

CREATE INDEX IF NOT EXISTS idx_currency_rates_active ON currency_rates(is_active);

-- ============================================================================
-- Triggers
-- ============================================================================
CREATE TRIGGER update_pack_promotions_updated_at
  BEFORE UPDATE ON pack_promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Fonction : Obtenir les promotions actives pour un pack
-- ============================================================================
CREATE OR REPLACE FUNCTION get_active_promotions_for_pack(
  p_pack_id UUID,
  p_user_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  promotion_id UUID,
  name TEXT,
  discount_type TEXT,
  discount_value INTEGER,
  badge_text TEXT,
  badge_color TEXT,
  uses_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.id,
    pp.name,
    pp.discount_type,
    pp.discount_value,
    pp.badge_text,
    pp.badge_color,
    CASE
      WHEN pp.max_uses IS NULL THEN NULL
      ELSE pp.max_uses - pp.uses_count
    END as uses_remaining
  FROM pack_promotions pp
  WHERE pp.is_active = true
    AND NOW() BETWEEN pp.starts_at AND pp.ends_at
    AND (pp.pack_id = p_pack_id OR pp.all_packs = true)
    AND (pp.max_uses IS NULL OR pp.uses_count < pp.max_uses)
    AND (
      p_user_id IS NULL
      OR (
        SELECT COUNT(*)
        FROM pack_promotion_uses ppu
        WHERE ppu.promotion_id = pp.id AND ppu.user_id = p_user_id
      ) < pp.max_uses_per_user
    )
  ORDER BY pp.priority DESC, pp.discount_value DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Fonction : Calculer le prix avec promotion
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_price_with_promotion(
  p_original_price INTEGER,
  p_discount_type TEXT,
  p_discount_value INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_discount_amount INTEGER;
  v_final_price INTEGER;
BEGIN
  IF p_discount_type = 'percentage' THEN
    v_discount_amount := FLOOR(p_original_price * p_discount_value / 100);
  ELSIF p_discount_type = 'fixed_amount' THEN
    v_discount_amount := p_discount_value;
  ELSE
    v_discount_amount := 0;
  END IF;

  v_final_price := GREATEST(p_original_price - v_discount_amount, 0);

  RETURN v_final_price;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Données initiales : Devises
-- ============================================================================
INSERT INTO currency_rates (currency, name, symbol, rate_to_xof, rate_from_xof, is_active, is_default, decimals, display_format)
VALUES
  ('XOF', 'Franc CFA', 'FCFA', 1, 1, true, true, 0, '{amount} {symbol}'),
  ('EUR', 'Euro', '€', 655.957, 0.001524, true, false, 2, '{amount}{symbol}'),
  ('USD', 'Dollar US', '$', 607.50, 0.001646, true, false, 2, '{symbol}{amount}')
ON CONFLICT (currency) DO UPDATE SET
  rate_to_xof = EXCLUDED.rate_to_xof,
  rate_from_xof = EXCLUDED.rate_from_xof,
  last_updated = NOW();

-- ============================================================================
-- Données initiales : Exemple de promotion (désactivée par défaut)
-- ============================================================================
INSERT INTO pack_promotions (
  name,
  description,
  all_packs,
  discount_type,
  discount_value,
  starts_at,
  ends_at,
  is_active,
  show_on_pricing,
  badge_text,
  badge_color,
  max_uses,
  max_uses_per_user
) VALUES (
  'Promotion de Lancement',
  'Réduction de 20% sur tous les packs pour le lancement !',
  true,
  'percentage',
  20,
  NOW(),
  NOW() + INTERVAL '30 days',
  false,  -- Désactivée par défaut
  true,
  '-20%',
  'red',
  NULL,
  1
);

COMMENT ON TABLE pack_promotions IS 'Promotions et réductions sur les packs de crédits';
COMMENT ON TABLE pack_promotion_uses IS 'Suivi des utilisations des promotions par utilisateur';
COMMENT ON TABLE currency_rates IS 'Taux de change pour le support multi-devises';
