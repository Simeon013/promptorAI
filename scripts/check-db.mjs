/**
 * Script pour vérifier la configuration des modèles dans Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log('\n🔍 Vérification de la configuration dans Supabase...\n');

// Vérifier les clés API
const { data: apiKeys, error: keysError } = await supabase
  .from('admin_api_keys')
  .select('*');

if (keysError) {
  console.error('❌ Erreur lors de la récupération des clés API:', keysError);
} else {
  console.log('📋 Clés API configurées :');
  if (apiKeys.length === 0) {
    console.log('  (Aucune clé configurée)');
  } else {
    apiKeys.forEach(key => {
      console.log(`  - ${key.provider}: ${key.is_active ? '✅ Active' : '❌ Inactive'}`);
    });
  }
}

console.log('\n📋 Modèles configurés par plan :');

// Vérifier les modèles par plan
const { data: models, error: modelsError } = await supabase
  .from('admin_model_config')
  .select('*')
  .order('plan');

if (modelsError) {
  console.error('❌ Erreur lors de la récupération des modèles:', modelsError);
} else {
  if (models.length === 0) {
    console.log('  (Aucun modèle configuré)');
  } else {
    models.forEach(model => {
      console.log(`  - ${model.plan}: ${model.model_id} ${model.is_default ? '✅ Défaut' : ''}`);
    });
  }
}

// Vérifier quels plans n'ont pas de modèle
const allPlans = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
const configuredPlans = models?.map(m => m.plan) || [];
const missingPlans = allPlans.filter(plan => !configuredPlans.includes(plan));

if (missingPlans.length > 0) {
  console.log('\n⚠️  Plans sans modèle configuré :');
  missingPlans.forEach(plan => {
    console.log(`  - ${plan}`);
  });
}

console.log('\n');
