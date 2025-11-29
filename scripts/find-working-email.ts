/**
 * Script pour trouver quelle adresse email fonctionne avec Resend
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../.env.local') });

const testEmails = [
  'onboarding@resend.dev',
  'delivered@resend.dev',
  'noreply@resend.dev',
  'test@resend.dev',
];

async function findWorkingEmail() {
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY non définie');
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const testRecipient = process.argv[2] || 'test@example.com';

  console.log('🔍 Test de différentes adresses email...\n');

  for (const fromEmail of testEmails) {
    console.log(`📧 Test avec: ${fromEmail}`);

    try {
      const { data, error } = await resend.emails.send({
        from: `Promptor Test <${fromEmail}>`,
        to: testRecipient,
        subject: '[TEST] Recherche de l\'adresse email qui fonctionne',
        html: '<p>Ceci est un test pour trouver l\'adresse email Resend qui fonctionne.</p>',
      });

      if (error) {
        console.log(`   ❌ Erreur: ${error.message}\n`);
      } else {
        console.log(`   ✅ SUCCÈS ! ID: ${data?.id}`);
        console.log(`\n🎉 ADRESSE FONCTIONNELLE TROUVÉE: ${fromEmail}\n`);
        console.log(`Mettez à jour lib/email/resend.ts avec:`);
        console.log(`export const EMAIL_FROM = {`);
        console.log(`  DEFAULT: 'Promptor <${fromEmail}>',`);
        console.log(`  SUPPORT: 'Promptor Support <${fromEmail}>',`);
        console.log(`  MARKETING: 'Promptor <${fromEmail}>',`);
        console.log(`  NEWSLETTER: 'Promptor Newsletter <${fromEmail}>',`);
        console.log(`};\n`);
        return;
      }
    } catch (err: any) {
      console.log(`   ❌ Exception: ${err.message}\n`);
    }
  }

  console.log('❌ Aucune adresse n\'a fonctionné.');
  console.log('\n💡 Solution: Contactez le support Resend ou ajoutez votre propre domaine.');
}

findWorkingEmail();
