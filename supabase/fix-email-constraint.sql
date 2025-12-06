-- ============================================================================
-- Fix: Supprimer la contrainte unique sur l'email
-- ============================================================================
--
-- Problème: La table users a une contrainte UNIQUE sur l'email qui empêche
-- de recréer un compte avec le même email (même si l'utilisateur a été supprimé).
--
-- Solution: Supprimer la contrainte unique car l'ID Clerk est déjà la clé primaire.
-- Un utilisateur peut se recréer un compte avec le même email.
--
-- Date: 2 décembre 2025
-- ============================================================================

-- 1. Supprimer la contrainte unique sur l'email
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- 2. Créer un index pour optimiser les recherches par email (non unique)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. Vérifier que la contrainte a bien été supprimée
-- (Cette requête affichera toutes les contraintes restantes sur la table users)
SELECT
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'users'::regclass;

-- ============================================================================
-- Notes:
-- - L'ID Clerk (colonne 'id') reste la clé primaire unique
-- - L'email peut maintenant avoir des doublons (utile pour tests et recréation de comptes)
-- - L'index idx_users_email permet des recherches rapides par email
-- ============================================================================
