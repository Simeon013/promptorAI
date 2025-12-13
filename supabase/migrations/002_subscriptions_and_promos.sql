-- Migration : Système d'abonnements et codes promo
-- Date : 2025-12-12
-- Description : Ajoute les tables pour gérer les abonnements récurrents et les codes promotionnels
-- Note : Compatible avec la table `users` existante (pas de modification de users)

-- ============================================================================
-- Étape 1 : Étendre la table users (optionnel, pour supporter Stripe ET FedaPay)
-- ============================================================================
-- Ajouter support FedaPay en plus de Stripe
ALTER TABLE users ADD COLUMN IF NOT EXISTS fedapay_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'stripe' CHECK (payment_provider IN ('stripe', 'fedapay'));

-- ============================================================================
-- Table : promo_codes (CRÉER EN PREMIER pour la foreign key)
-- Gère les codes promotionnels (réductions, essais gratuits)
-- ============================================================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations du code
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL, -- Nom interne (ex: "Lancement Black Friday")
  description TEXT,

  -- Type de promotion
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'free_trial')),

  -- Valeurs de réduction
  discount_percentage INTEGER, -- 0-100 pour pourcentage
  discount_amount INTEGER, -- Montant fixe en FCFA
  free_trial_days INTEGER, -- Nombre de jours d'essai gratuit

  -- Plans éligibles
  applicable_plans TEXT[] DEFAULT ARRAY['STARTER', 'PRO']::TEXT[],

  -- Limitations
  max_uses INTEGER, -- NULL = illimité
  max_uses_per_user INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,

  -- Validité
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  -- Métadonnées
  created_by TEXT, -- User ID de l'admin qui a créé le code
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Table : subscriptions
-- Gère les abonnements récurrents des utilisateurs
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Informations de l'abonnement
  plan TEXT NOT NULL CHECK (plan IN ('FREE', 'STARTER', 'PRO', 'ENTERPRISE')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),

  -- Dates importantes
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Informations de paiement
  amount INTEGER NOT NULL, -- Montant en FCFA (ou centimes pour Stripe)
  currency TEXT NOT NULL DEFAULT 'XOF',
  billing_interval TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'yearly')),

  -- Provider (Stripe OU FedaPay)
  payment_provider TEXT NOT NULL DEFAULT 'fedapay' CHECK (payment_provider IN ('stripe', 'fedapay')),
  provider_subscription_id TEXT, -- Pour Stripe subscription ID
  last_transaction_id TEXT, -- Pour FedaPay transaction ID

  -- Codes promo
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
  discount_amount INTEGER DEFAULT 0, -- Réduction appliquée

  -- Métadonnées
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Index pour les codes promo
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_is_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid_until ON promo_codes(valid_until);

-- ============================================================================
-- Table : promo_code_uses
-- Historique d'utilisation des codes promo
-- ============================================================================
CREATE TABLE IF NOT EXISTS promo_code_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Informations de l'utilisation
  discount_applied INTEGER NOT NULL, -- Montant de la réduction en FCFA
  original_amount INTEGER NOT NULL,
  final_amount INTEGER NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour l'historique des utilisations
CREATE INDEX IF NOT EXISTS idx_promo_code_uses_promo_code_id ON promo_code_uses(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_uses_user_id ON promo_code_uses(user_id);

-- ============================================================================
-- Table : payment_history
-- Historique de tous les paiements effectués
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Informations de paiement
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),

  -- FedaPay
  fedapay_transaction_id TEXT UNIQUE,
  payment_method TEXT, -- 'card', 'mtn_money', 'moov_money', 'orange_money'

  -- Métadonnées
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour l'historique des paiements
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription_id ON payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_fedapay_transaction_id ON payment_history(fedapay_transaction_id);

-- ============================================================================
-- Fonctions et Triggers
-- ============================================================================

-- Fonction : Mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_history_updated_at
  BEFORE UPDATE ON payment_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Fonction : Vérifier et expirer les abonnements
-- À appeler quotidiennement via un cron job
-- ============================================================================
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
  -- Marquer comme expirés les abonnements dont la période est terminée
  UPDATE subscriptions
  SET status = 'expired',
      expires_at = NOW()
  WHERE status = 'active'
    AND current_period_end < NOW()
    AND cancelled_at IS NULL;

  -- Mettre à jour les utilisateurs avec des abonnements expirés
  UPDATE users u
  SET plan = 'FREE',
      quota_limit = 10,
      quota_used = 0
  FROM subscriptions s
  WHERE u.id = s.user_id
    AND s.status = 'expired'
    AND u.plan != 'FREE';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Données de test : Codes promo initiaux
-- ============================================================================
INSERT INTO promo_codes (code, name, description, type, discount_percentage, discount_amount, applicable_plans, max_uses, valid_until)
VALUES
  ('BIENVENUE10', 'Réduction de bienvenue', '10% de réduction sur le premier mois', 'percentage', 10, NULL, ARRAY['STARTER', 'PRO'], NULL, '2026-12-31'::TIMESTAMPTZ),
  ('LAUNCH50', 'Lancement - 50% OFF', '50% de réduction pour les early adopters', 'percentage', 50, NULL, ARRAY['STARTER', 'PRO'], 100, '2025-12-31'::TIMESTAMPTZ),
  ('ESSAI14J', 'Essai gratuit 14 jours', '14 jours d''essai gratuit du plan PRO', 'free_trial', NULL, NULL, ARRAY['PRO'], NULL, NULL),
  ('NOEL2024', 'Promotion Noël', '2000 FCFA de réduction', 'fixed_amount', NULL, 2000, ARRAY['STARTER', 'PRO'], 500, '2025-12-25'::TIMESTAMPTZ)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- Commentaires
-- ============================================================================
COMMENT ON TABLE subscriptions IS 'Gère les abonnements récurrents des utilisateurs avec FedaPay';
COMMENT ON TABLE promo_codes IS 'Codes promotionnels pour réductions et essais gratuits';
COMMENT ON TABLE promo_code_uses IS 'Historique d''utilisation des codes promo par les utilisateurs';
COMMENT ON TABLE payment_history IS 'Historique complet de tous les paiements effectués';
