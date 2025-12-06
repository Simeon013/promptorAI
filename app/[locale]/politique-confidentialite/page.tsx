import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PolitiqueConfidentialitePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Politique de Confidentialité</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="lead">
            Chez Promptor, nous prenons très au sérieux la protection de vos données personnelles.
            Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons et protégeons vos informations.
          </p>

          <section className="mb-8 mt-8">
            <h2 className="text-2xl font-semibold mb-4">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles est :
            </p>
            <ul className="list-none space-y-1">
              <li><strong>Nom</strong> : [VOTRE NOM/RAISON SOCIALE]</li>
              <li><strong>Email</strong> : contact@promptor.fr</li>
              <li><strong>Adresse</strong> : [VOTRE ADRESSE]</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Données d'inscription</h3>
            <ul>
              <li><strong>Email</strong> : Pour créer votre compte et vous contacter</li>
              <li><strong>Nom et prénom</strong> : Pour personnaliser votre expérience</li>
              <li><strong>Photo de profil</strong> : Si vous choisissez d'en ajouter une (via Clerk)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Données d'utilisation</h3>
            <ul>
              <li><strong>Prompts générés</strong> : Stockés pour vous permettre d'accéder à votre historique</li>
              <li><strong>Type de prompts</strong> : Génération ou amélioration</li>
              <li><strong>Quotas</strong> : Nombre de prompts générés par mois</li>
              <li><strong>Favoris</strong> : Prompts que vous avez marqués comme favoris</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Données de paiement</h3>
            <ul>
              <li><strong>Informations de facturation</strong> : Nom, adresse (via Stripe)</li>
              <li><strong>Historique des paiements</strong> : Type d'abonnement, dates, montants</li>
              <li>⚠️ <strong>Note importante</strong> : Nous ne stockons JAMAIS vos coordonnées bancaires. Elles sont gérées de manière sécurisée par notre prestataire de paiement Stripe.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.4 Données techniques</h3>
            <ul>
              <li><strong>Cookies</strong> : Pour maintenir votre session et améliorer votre expérience</li>
              <li><strong>Adresse IP</strong> : Pour la sécurité et prévenir les abus</li>
              <li><strong>User-Agent</strong> : Type de navigateur et appareil</li>
              <li><strong>Logs d'utilisation</strong> : Horodatage des actions, pages visitées</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Finalités du traitement</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul>
              <li>✅ <strong>Fournir le service</strong> : Générer et améliorer des prompts IA</li>
              <li>✅ <strong>Gérer votre compte</strong> : Authentification, quotas, abonnements</li>
              <li>✅ <strong>Traiter les paiements</strong> : Facturation et gestion des abonnements</li>
              <li>✅ <strong>Améliorer le service</strong> : Analyser l'utilisation pour optimiser l'expérience</li>
              <li>✅ <strong>Communiquer</strong> : Emails transactionnels (bienvenue, paiement, quota)</li>
              <li>✅ <strong>Sécurité</strong> : Prévenir les abus, fraudes et violations</li>
              <li>✅ <strong>Support client</strong> : Répondre à vos questions et problèmes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Base légale</h2>
            <p>Le traitement de vos données repose sur :</p>
            <ul>
              <li>📝 <strong>Exécution du contrat</strong> : Fourniture du service (Art. 6(1)(b) RGPD)</li>
              <li>⚖️ <strong>Obligation légale</strong> : Facturation, comptabilité (Art. 6(1)(c) RGPD)</li>
              <li>🎯 <strong>Intérêt légitime</strong> : Sécurité, amélioration du service (Art. 6(1)(f) RGPD)</li>
              <li>✅ <strong>Consentement</strong> : Marketing, cookies non-essentiels (Art. 6(1)(a) RGPD)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Destinataires des données</h2>
            <p>Vos données peuvent être partagées avec :</p>
            <ul>
              <li>🔐 <strong>Clerk</strong> : Authentification et gestion des utilisateurs</li>
              <li>💳 <strong>Stripe</strong> : Traitement des paiements</li>
              <li>🗄️ <strong>Supabase</strong> : Hébergement de la base de données (PostgreSQL)</li>
              <li>🤖 <strong>Google Gemini</strong> : Génération de prompts IA (les prompts sont envoyés à l'API)</li>
              <li>📧 <strong>Brevo</strong> : Envoi d'emails transactionnels</li>
              <li>📊 <strong>Vercel</strong> : Hébergement de l'application</li>
            </ul>
            <p className="mt-4">
              ⚠️ <strong>Important</strong> : Tous nos prestataires sont conformes au RGPD et situés dans l'UE ou disposent de mécanismes de transfert appropriés (ex: clauses contractuelles types).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Durée de conservation</h2>
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left">Données</th>
                  <th className="border border-border p-3 text-left">Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-3">Compte utilisateur</td>
                  <td className="border border-border p-3">Jusqu'à suppression du compte + 1 mois</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Prompts générés</td>
                  <td className="border border-border p-3">Selon votre plan (7 jours à illimité)</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Données de facturation</td>
                  <td className="border border-border p-3">10 ans (obligation légale)</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Logs de sécurité</td>
                  <td className="border border-border p-3">6 mois maximum</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">Cookies</td>
                  <td className="border border-border p-3">13 mois maximum</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Vos droits (RGPD)</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li>👁️ <strong>Droit d'accès</strong> : Obtenir une copie de vos données</li>
              <li>✏️ <strong>Droit de rectification</strong> : Corriger vos données inexactes</li>
              <li>🗑️ <strong>Droit à l'effacement</strong> : Supprimer vos données (sous conditions)</li>
              <li>⏸️ <strong>Droit à la limitation</strong> : Limiter le traitement de vos données</li>
              <li>📦 <strong>Droit à la portabilité</strong> : Récupérer vos données dans un format structuré</li>
              <li>🚫 <strong>Droit d'opposition</strong> : Vous opposer au traitement de vos données</li>
              <li>🔄 <strong>Droit de retrait du consentement</strong> : Retirer votre consentement à tout moment</li>
            </ul>
            <p className="mt-4">
              Pour exercer vos droits, contactez-nous à : <strong>contact@promptor.fr</strong>
            </p>
            <p>
              Vous disposez également du droit d'introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">https://www.cnil.fr</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Sécurité des données</h2>
            <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
            <ul>
              <li>🔒 <strong>Chiffrement HTTPS</strong> : Toutes les communications sont chiffrées</li>
              <li>🛡️ <strong>Chiffrement en base de données</strong> : Données sensibles chiffrées au repos</li>
              <li>🔐 <strong>Authentification forte</strong> : Système d'authentification sécurisé via Clerk</li>
              <li>🚨 <strong>Rate Limiting</strong> : Protection contre les attaques par force brute</li>
              <li>📊 <strong>Monitoring</strong> : Surveillance 24/7 des accès et activités suspectes</li>
              <li>💾 <strong>Sauvegardes</strong> : Backups quotidiens de la base de données</li>
              <li>🔍 <strong>Audits réguliers</strong> : Tests de sécurité et mises à jour</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Cookies</h2>
            <p>Ce site utilise les cookies suivants :</p>

            <h3 className="text-xl font-semibold mt-6 mb-3">9.1 Cookies essentiels (obligatoires)</h3>
            <ul>
              <li><strong>Session Clerk</strong> : Maintient votre connexion</li>
              <li><strong>CSRF Token</strong> : Protection contre les attaques CSRF</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">9.2 Cookies fonctionnels</h3>
            <ul>
              <li><strong>Préférences utilisateur</strong> : Langue, thème (clair/sombre)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">9.3 Cookies analytiques (avec consentement)</h3>
            <ul>
              <li><strong>Vercel Analytics</strong> : Statistiques d'utilisation anonymisées</li>
            </ul>

            <p className="mt-4">
              Vous pouvez gérer vos préférences de cookies à tout moment dans les paramètres de votre navigateur.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
              Les modifications prennent effet dès leur publication sur cette page.
              Nous vous informerons par email en cas de changement significatif.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
            </p>
            <ul className="list-none space-y-1">
              <li><strong>Email</strong> : contact@promptor.fr</li>
              <li><strong>Adresse</strong> : [VOTRE ADRESSE POSTALE]</li>
            </ul>
          </section>

          <p className="text-sm text-muted-foreground mt-12">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
