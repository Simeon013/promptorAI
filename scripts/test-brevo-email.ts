// Charger dotenv EN PREMIER
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../.env.local') });

async function testBrevoEmail() {
  // Vérifier BREVO_API_KEY
  if (!process.env.BREVO_API_KEY) {
    console.error('❌ ERREUR: BREVO_API_KEY n\'est pas définie dans .env.local');
    console.log('\nPour configurer Brevo:');
    console.log('1. Créez un compte sur https://www.brevo.com');
    console.log('2. Allez dans Settings > SMTP & API > API Keys');
    console.log('3. Créez une nouvelle API key');
    console.log('4. Ajoutez BREVO_API_KEY=votre_clé dans .env.local');
    process.exit(1);
  }

  console.log('✅ BREVO_API_KEY trouvée');
  console.log(`   Clé: ${process.env.BREVO_API_KEY.substring(0, 15)}...`);

  // Importer APRES chargement des env vars (dynamic imports)
  const { sendEmail } = await import('../lib/email/send.js');
  const { getWelcomeEmailHtml } = await import(
    '../lib/email/templates/html/welcome.html.js'
  );

  const testEmail = process.argv[2] || process.env.BREVO_SENDER_EMAIL || 'test@example.com';

  console.log(`\n📧 Envoi d'un email de test à: ${testEmail}`);
  console.log('⏳ Envoi en cours...\n');

  const htmlContent = getWelcomeEmailHtml({
    userName: 'Utilisateur Test',
    dashboardUrl: 'http://localhost:3000/dashboard',
  });

  const result = await sendEmail({
    to: testEmail,
    subject: '[TEST] Email de bienvenue Promptor (via Brevo)',
    htmlContent,
    tags: ['test', 'welcome'],
  });

  if (result.success) {
    console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS !');
    console.log(`   ID du message: ${result.id}`);
    console.log(`   Destinataire: ${testEmail}`);
    console.log('\n💡 Vérifiez votre boîte mail (et les spams si besoin)');
    console.log('💡 Vous pouvez aussi vérifier dans le dashboard Brevo:');
    console.log('   https://app.brevo.com/campaign/list/transac');
  } else {
    console.error('❌ ÉCHEC DE L\'ENVOI');
    console.error('   Erreur:', result.error);
    console.log('\n💡 Vérifications à faire:');
    console.log('   1. Votre BREVO_API_KEY est-elle valide ?');
    console.log('   2. Votre compte Brevo est-il actif ?');
    console.log('   3. L\'email de destination est-il valide ?');
    console.log('   4. (Pour tests) Utilisez votre email de compte Brevo');
  }
}

testBrevoEmail().catch((error) => {
  console.error('❌ ERREUR INATTENDUE:', error);
  process.exit(1);
});
