-- Migration : Système de crédits avec tiers
-- Date : 2025-12-12
-- Description : Remplace les abonnements par un système de crédits + tiers
-- Note : Garde les tables promo_codes pour compatibilité

-- ============================================================================
-- Étape 1 : Étendre la table users pour les crédits
-- ============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 10;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_purchased INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_gifted INTEGER DEFAULT 0;

-- Tier system
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'FREE'
  CHECK (tier IN ('FREE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent INTEGER DEFAULT 0; -- Pour calculer le tier

-- ============================================================================
-- Table : credit_packs
-- Packs de crédits configurables
-- ============================================================================
CREATE TABLE IF NOT EXISTS credit_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations du pack
  name TEXT NOT NULL UNIQUE,             -- 'STARTER', 'BASIC', 'PRO', 'PREMIUM'
  display_name TEXT NOT NULL,            -- 'Pack Starter' (pour affichage)
  description TEXT,

  -- Crédits
  credits INTEGER NOT NULL,              -- Nombre de crédits
  bonus_credits INTEGER DEFAULT 0,       -- Crédits bonus

  -- Tarification
  price INTEGER NOT NULL,                -- Prix en FCFA
  currency TEXT DEFAULT 'XOF',

  -- Tier
  tier_unlock TEXT,                      -- Tier débloqué ('BRONZE', 'SILVER', etc.)
  min_tier_spend INTEGER,                -- Montant minimum total pour ce tier

  -- Configuration
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,     -- Mis en avant
  sort_order INTEGER DEFAULT 0,

  -- Métadonnées
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Table : credit_purchases
-- Historique des achats de crédits
-- ============================================================================
CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_id UUID REFERENCES credit_packs(id) ON DELETE SET NULL,

  -- Informations de l'achat
  pack_name TEXT NOT NULL,               -- Snapshot du nom du pack
  credits_purchased INTEGER NOT NULL,
  bonus_credits INTEGER DEFAULT 0,
  total_credits INTEGER NOT NULL,        -- purchased + bonus

  -- Paiement
  amount INTEGER NOT NULL,               -- Prix original
  currency TEXT DEFAULT 'XOF',
  discount_amount INTEGER DEFAULT 0,
  final_amount INTEGER NOT NULL,         -- Après réduction

  -- Provider
  payment_provider TEXT DEFAULT 'fedapay' CHECK (payment_provider IN ('stripe', 'fedapay')),
  fedapay_transaction_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'refunded')),

  -- Code promo
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
  promo_code TEXT,                       -- Snapshot du code

  -- Tier impact
  tier_before TEXT,
  tier_after TEXT,
  total_spent_before INTEGER,
  total_spent_after INTEGER,

  -- Métadonnées
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Table : credit_transactions
-- Historique détaillé des mouvements de crédits
-- ============================================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Type de transaction
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'gift', 'refund', 'bonus')),

  -- Montants
  credits_change INTEGER NOT NULL,       -- Positif (ajout) ou négatif (retrait)
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,

  -- Contexte
  purchase_id UUID REFERENCES credit_purchases(id) ON DELETE SET NULL,
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  action TEXT,                           -- 'generate', 'improve', 'export_pdf', etc.

  -- Snapshot de l'état utilisateur
  tier_at_time TEXT,

  -- Description
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Table : tier_config
-- Configuration des tiers (pour référence et analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tier_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  tier TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,                    -- 'Bronze', 'Argent', 'Or'
  min_spend INTEGER NOT NULL,            -- Dépense minimum pour atteindre ce tier
  duration_days INTEGER DEFAULT 30,      -- Durée de validité

  -- Badge/UI
  badge_emoji TEXT,                      -- '🥉', '🥈', '🥇'
  badge_color TEXT,                      -- '#CD7F32', '#C0C0C0', '#FFD700'

  -- Metadata (features sont gérées dans votre code)
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Index
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_credit_packs_is_active ON credit_packs(is_active);
CREATE INDEX IF NOT EXISTS idx_credit_packs_sort_order ON credit_packs(sort_order);

CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_created_at ON credit_purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_fedapay_id ON credit_purchases(fedapay_transaction_id);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);

-- ============================================================================
-- Fonctions et Triggers
-- ============================================================================

-- Trigger pour updated_at
CREATE TRIGGER update_credit_packs_updated_at
  BEFORE UPDATE ON credit_packs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction : Expirer les tiers
CREATE OR REPLACE FUNCTION expire_tiers()
RETURNS void AS $$
BEGIN
  -- Rétrograder les tiers expirés
  UPDATE users
  SET tier = CASE
    WHEN total_spent >= 30000 THEN 'GOLD'
    WHEN total_spent >= 12000 THEN 'SILVER'
    WHEN total_spent >= 5000 THEN 'BRONZE'
    ELSE 'FREE'
  END,
  tier_expires_at = NULL
  WHERE tier_expires_at < NOW()
    AND tier_expires_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Données initiales : Packs de crédits
-- ============================================================================
INSERT INTO credit_packs (name, display_name, description, credits, bonus_credits, price, tier_unlock, min_tier_spend, sort_order, is_featured)
VALUES
  ('STARTER', 'Pack Starter', 'Idéal pour découvrir', 50, 5, 2500, 'BRONZE', 0, 1, false),
  ('BASIC', 'Pack Basic', 'Le plus populaire', 100, 10, 5000, 'SILVER', 5000, 2, true),
  ('PRO', 'Pack Pro', 'Pour les utilisateurs actifs', 300, 50, 12000, 'GOLD', 12000, 3, true),
  ('PREMIUM', 'Pack Premium', 'Maximum de crédits', 1000, 200, 30000, 'PLATINUM', 30000, 4, false)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- Données initiales : Configuration des tiers
-- ============================================================================
INSERT INTO tier_config (tier, name, min_spend, duration_days, badge_emoji, badge_color)
VALUES
  ('FREE', 'Gratuit', 0, NULL, '⚪', '#6B7280'),
  ('BRONZE', 'Bronze', 2500, 30, '🥉', '#CD7F32'),
  ('SILVER', 'Argent', 5000, 30, '🥈', '#C0C0C0'),
  ('GOLD', 'Or', 12000, 30, '🥇', '#FFD700'),
  ('PLATINUM', 'Platine', 30000, 30, '💎', '#E5E4E2')
ON CONFLICT (tier) DO NOTHING;

-- ============================================================================
-- Mise à jour des codes promo pour supporter les crédits
-- ============================================================================
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS bonus_credits INTEGER DEFAULT 0;
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS applicable_packs TEXT[] DEFAULT ARRAY['STARTER', 'BASIC', 'PRO', 'PREMIUM']::TEXT[];

-- Ajouter un nouveau type de promo : credit_bonus
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_type_check;
ALTER TABLE promo_codes ADD CONSTRAINT promo_codes_type_check
  CHECK (type IN ('percentage', 'fixed_amount', 'free_trial', 'credit_bonus', 'free_credits'));

-- ============================================================================
-- Commentaires
-- ============================================================================
COMMENT ON TABLE credit_packs IS 'Packs de crédits configurables pour achats';
COMMENT ON TABLE credit_purchases IS 'Historique des achats de crédits par les utilisateurs';
COMMENT ON TABLE credit_transactions IS 'Journal détaillé de tous les mouvements de crédits';
COMMENT ON TABLE tier_config IS 'Configuration des tiers utilisateurs';

COMMENT ON COLUMN users.credits_balance IS 'Crédits disponibles actuellement';
COMMENT ON COLUMN users.credits_purchased IS 'Total des crédits achetés';
COMMENT ON COLUMN users.credits_used IS 'Total des crédits consommés';
COMMENT ON COLUMN users.credits_gifted IS 'Crédits bonus reçus';
COMMENT ON COLUMN users.total_spent IS 'Montant total dépensé en FCFA (pour calcul tier)';
COMMENT ON COLUMN users.tier IS 'Niveau actuel (FREE, BRONZE, SILVER, GOLD, PLATINUM)';
COMMENT ON COLUMN users.tier_expires_at IS 'Date d''expiration du tier (30j après dernier achat)';
