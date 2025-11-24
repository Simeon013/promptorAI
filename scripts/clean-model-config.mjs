/**
 * Script pour nettoyer les doublons dans admin_model_config
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log('\n🧹 Nettoyage de la table admin_model_config...\n');

// Récupérer tous les enregistrements
const { data: allRecords } = await supabase
  .from('admin_model_config')
  .select('id');

// Supprimer TOUS les enregistrements
const { error: deleteError } = await supabase
  .from('admin_model_config')
  .delete()
  .in('id', allRecords?.map(r => r.id) || []);

if (deleteError) {
  console.error('❌ Erreur lors de la suppression:', deleteError);
} else {
  console.log('✅ Tous les enregistrements ont été supprimés\n');
  console.log('📝 Veuillez maintenant :');
  console.log('   1. Aller sur http://localhost:3000/admin/api-keys');
  console.log('   2. Sélectionner vos modèles pour chaque plan');
  console.log('   3. Cliquer sur "Sauvegarder la configuration"\n');
}
