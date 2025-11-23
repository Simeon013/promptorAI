/**
 * Script pour nettoyer les clés API masquées de Supabase
 *
 * Usage:
 *   npx tsx scripts/clean-masked-keys.ts
 */

import { createClient } from '@supabase/supabase-js';

// Utiliser les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes !');
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanMaskedKeys() {
  console.log('🔍 Recherche des clés masquées...\n');

  // Récupérer toutes les clés
  const { data: keys, error: fetchError } = await supabase
    .from('admin_api_keys')
    .select('*');

  if (fetchError) {
    console.error('❌ Erreur lors de la récupération des clés:', fetchError);
    process.exit(1);
  }

  if (!keys || keys.length === 0) {
    console.log('ℹ️  Aucune clé trouvée dans la base de données.');
    return;
  }

  console.log(`📊 ${keys.length} clé(s) trouvée(s) au total\n`);

  const maskedKeys = keys.filter(key => key.api_key_encrypted?.includes('•'));

  if (maskedKeys.length === 0) {
    console.log('✅ Aucune clé masquée trouvée ! Votre base de données est propre.\n');

    // Afficher les clés valides
    const validKeys = keys.filter(key => !key.api_key_encrypted?.includes('•'));
    if (validKeys.length > 0) {
      console.log('📋 Clés valides présentes :');
      validKeys.forEach(key => {
        const preview = key.api_key_encrypted?.substring(0, 10) + '...';
        console.log(`  - ${key.provider}: ${preview} (Actif: ${key.is_active})`);
      });
    }
    return;
  }

  console.log(`⚠️  ${maskedKeys.length} clé(s) masquée(s) trouvée(s) :\n`);
  maskedKeys.forEach(key => {
    console.log(`  - ${key.provider}: ${key.api_key_encrypted?.substring(0, 20)}...`);
  });

  console.log('\n🗑️  Suppression des clés masquées...\n');

  let deletedCount = 0;
  const errors: string[] = [];

  for (const key of maskedKeys) {
    const { error: deleteError } = await supabase
      .from('admin_api_keys')
      .delete()
      .eq('provider', key.provider);

    if (deleteError) {
      console.error(`  ❌ Erreur pour ${key.provider}:`, deleteError.message);
      errors.push(key.provider);
    } else {
      console.log(`  ✅ ${key.provider} supprimé`);
      deletedCount++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✨ Nettoyage terminé !`);
  console.log(`   - ${deletedCount} clé(s) supprimée(s)`);
  if (errors.length > 0) {
    console.log(`   - ${errors.length} erreur(s): ${errors.join(', ')}`);
  }
  console.log(`${'='.repeat(50)}\n`);

  console.log('📝 Prochaines étapes :');
  console.log('   1. Allez sur http://localhost:3000/admin/api-keys');
  console.log('   2. Entrez vos vraies clés API');
  console.log('   3. Cliquez sur "Enregistrer la configuration"');
  console.log('   4. Testez vos clés avec le bouton "Tester"\n');
}

cleanMaskedKeys().catch(console.error);
