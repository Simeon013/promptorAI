/**
 * Script de test pour vérifier l'envoi d'emails avec Resend
 *
 * Usage: npx tsx scripts/test-email.ts votre-email@example.com
 */

// Charger les variables d'environnement EN PREMIER
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function testEmail() {
  console.log('🧪 Test d\'envoi d\'email avec Resend...\n');

  // Vérifier que la clé API est définie
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ ERREUR: RESEND_API_KEY n\'est pas définie');
    console.log('   Assurez-vous que .env.local contient:');
    console.log('   RESEND_API_KEY=re_votre_cle_api\n');
    process.exit(1);
  }

  console.log('✅ RESEND_API_KEY est définie');
  console.log('   Clé: ' + process.env.RESEND_API_KEY.substring(0, 10) + '...\n');

  // Importer les modules APRÈS avoir chargé les variables d'environnement
  const { sendEmail } = await import('../lib/email/send.js');
  const { WelcomeEmail } = await import('../lib/email/templates/WelcomeEmail.js');

  // Demander l'email de test
  const testEmail = process.argv[2] || 'test@example.com';

  console.log(`📧 Envoi d'un email de test à: ${testEmail}\n`);

  try {
    const result = await sendEmail({
      to: testEmail,
      subject: '[TEST] Email de bienvenue Promptor',
      react: WelcomeEmail({
        userName: 'Utilisateur Test',
        dashboardUrl: 'http://localhost:3000/dashboard',
      }),
      tags: [{ name: 'type', value: 'test' }],
    });

    if (result.success) {
      console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS !');
      console.log(`   ID: ${result.id}`);
      console.log(`\n📬 Vérifiez votre boîte mail: ${testEmail}`);
      console.log('   (Vérifiez aussi les spams si nécessaire)\n');
    } else {
      console.error('❌ ÉCHEC DE L\'ENVOI');
      console.error('   Erreur:', result.error);
      console.log('\n💡 Vérifications à faire:');
      console.log('   1. La clé API Resend est-elle valide ?');
      console.log('   2. Allez sur https://resend.com/emails pour voir les logs');
      console.log('   3. Vérifiez que vous utilisez bien onboarding.resend.dev\n');
    }
  } catch (error) {
    console.error('❌ ERREUR INATTENDUE:');
    console.error(error);
  }
}

// Exécuter le test
testEmail();
