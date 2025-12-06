-- ============================================================================
-- Row Level Security (RLS) Policies pour Supabase
-- ============================================================================
--
-- IMPORTANT: Ces policies isolent les données entre utilisateurs
-- Actuellement, l'application utilise la clé service qui bypass RLS.
--
-- Pour activer RLS en production:
-- 1. Créer un JWT provider avec Clerk
-- 2. Configurer Supabase pour valider les JWTs Clerk
-- 3. Utiliser auth.uid() au lieu de la clé service
--
-- Date: 2 décembre 2025
-- ============================================================================

-- ============================================================================
-- Table: users
-- ============================================================================

-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "users_select_own"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id);

-- Policy: Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "users_update_own"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id);

-- Policy: Seuls les admins peuvent insérer des utilisateurs (via service key)
-- Les utilisateurs normaux sont créés via l'application avec la clé service
CREATE POLICY "users_insert_service"
  ON users
  FOR INSERT
  WITH CHECK (false); -- Les inserts doivent utiliser la clé service

-- Policy: Seuls les admins peuvent supprimer des utilisateurs
CREATE POLICY "users_delete_service"
  ON users
  FOR DELETE
  USING (false); -- Les deletes doivent utiliser la clé service

-- ============================================================================
-- Table: prompts
-- ============================================================================

-- Activer RLS
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent lire leurs propres prompts
CREATE POLICY "prompts_select_own"
  ON prompts
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Les utilisateurs peuvent insérer leurs propres prompts
CREATE POLICY "prompts_insert_own"
  ON prompts
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Les utilisateurs peuvent mettre à jour leurs propres prompts
CREATE POLICY "prompts_update_own"
  ON prompts
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Policy: Les utilisateurs peuvent supprimer leurs propres prompts
CREATE POLICY "prompts_delete_own"
  ON prompts
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================

-- 1. Ces policies ne s'appliquent PAS si vous utilisez la clé service Supabase
--    La clé service bypass RLS pour permettre l'administration

-- 2. Pour utiliser RLS avec Clerk:
--    - Configurer Clerk comme JWT provider dans Supabase
--    - Utiliser le client Supabase avec le JWT utilisateur au lieu de la clé service
--    - Exemple:
--      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
--        global: { headers: { Authorization: `Bearer ${clerkJWT}` } }
--      })

-- 3. Vérifier que les policies fonctionnent:
--    - Se connecter avec un utilisateur normal
--    - Essayer de lire les données d'un autre utilisateur
--    - Devrait retourner 0 résultats (isolation réussie)

-- 4. En développement:
--    - Vous pouvez désactiver RLS temporairement:
--      ALTER TABLE users DISABLE ROW LEVEL SECURITY;
--      ALTER TABLE prompts DISABLE ROW LEVEL SECURITY;
--    - ATTENTION: Ne jamais désactiver en production !

-- ============================================================================
-- Vérification
-- ============================================================================

-- Afficher toutes les policies créées
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'prompts')
ORDER BY tablename, policyname;
