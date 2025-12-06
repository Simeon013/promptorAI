import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CGUPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Conditions Générales d'Utilisation (CGU)</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="lead">
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du service Promptor.
            En utilisant notre service, vous acceptez sans réserve les présentes CGU.
          </p>

          <section className="mb-8 mt-8">
            <h2 className="text-2xl font-semibold mb-4">1. Objet</h2>
            <p>
              Promptor est une plateforme SaaS permettant de générer et d'améliorer des prompts pour modèles d'intelligence artificielle.
              Le service utilise Google Gemini AI pour fournir des suggestions et optimisations de prompts.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Acceptation des CGU</h2>
            <p>
              L'utilisation du service implique l'acceptation pleine et entière des présentes CGU.
              Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.
            </p>
            <p>
              Nous nous réservons le droit de modifier les CGU à tout moment.
              Les modifications prennent effet dès leur publication. Vous serez informé par email en cas de changement majeur.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Inscription et compte</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Création de compte</h3>
            <p>
              Pour utiliser Promptor, vous devez créer un compte en fournissant :
            </p>
            <ul>
              <li>Une adresse email valide</li>
              <li>Un nom et prénom</li>
              <li>Un mot de passe sécurisé (géré via Clerk)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Sécurité du compte</h3>
            <p>
              Vous êtes responsable de la confidentialité de vos identifiants de connexion.
              Toute utilisation de votre compte est présumée faite par vous.
              En cas d'utilisation non autorisée, vous devez nous en informer immédiatement.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Exactitude des informations</h3>
            <p>
              Vous vous engagez à fournir des informations exactes, à jour et complètes.
              Vous vous engagez à mettre à jour vos informations en cas de modification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Plans et tarification</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Plans disponibles</h3>
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left">Plan</th>
                  <th className="border border-border p-3 text-left">Prix</th>
                  <th className="border border-border p-3 text-left">Quotas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-3">FREE</td>
                  <td className="border border-border p-3">Gratuit</td>
                  <td className="border border-border p-3">10 prompts/mois, historique 7 jours</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">STARTER</td>
                  <td className="border border-border p-3">9 € HT/mois</td>
                  <td className="border border-border p-3">100 prompts/mois, historique 30 jours</td>
                </tr>
                <tr>
                  <td className="border border-border p-3">PRO</td>
                  <td className="border border-border p-3">29 € HT/mois</td>
                  <td className="border border-border p-3">Prompts illimités, historique illimité</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Facturation</h3>
            <p>
              Les abonnements sont facturés mensuellement à l'avance via Stripe.
              Les paiements sont non remboursables, sauf obligation légale.
              En cas de dépassement de quota, le service sera temporairement suspendu jusqu'au renouvellement.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Résiliation</h3>
            <p>
              Vous pouvez résilier votre abonnement à tout moment depuis votre tableau de bord.
              La résiliation prend effet à la fin de la période de facturation en cours.
              Aucun remboursement au prorata ne sera effectué.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.4 Modification des tarifs</h3>
            <p>
              Nous nous réservons le droit de modifier nos tarifs à tout moment.
              Les modifications de prix seront communiquées 30 jours à l'avance par email.
              Vous aurez la possibilité de résilier votre abonnement avant l'application des nouveaux tarifs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Utilisation du service</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Usage autorisé</h3>
            <p>
              Vous vous engagez à utiliser Promptor uniquement pour des fins légales et conformes aux présentes CGU.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Usages interdits</h3>
            <p>Il est strictement interdit de :</p>
            <ul>
              <li>❌ Générer du contenu illégal, offensant, diffamatoire ou nuisible</li>
              <li>❌ Utiliser le service pour spammer ou harceler</li>
              <li>❌ Tenter de contourner les limitations de quota ou de sécurité</li>
              <li>❌ Revendre ou redistribuer le service sans autorisation</li>
              <li>❌ Utiliser des robots, scrapers ou outils automatisés non autorisés</li>
              <li>❌ Tenter d'accéder aux comptes d'autres utilisateurs</li>
              <li>❌ Compromettre la sécurité ou les performances du service</li>
              <li>❌ Utiliser le service pour entraîner des modèles IA concurrents</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Sanctions</h3>
            <p>
              En cas de violation des présentes CGU, nous nous réservons le droit de :
            </p>
            <ul>
              <li>Suspendre ou résilier votre compte sans préavis</li>
              <li>Supprimer tout contenu en violation</li>
              <li>Refuser tout remboursement</li>
              <li>Prendre des mesures légales si nécessaire</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Propriété intellectuelle</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Propriété de Promptor</h3>
            <p>
              Tout le contenu du site (code, design, textes, logos, etc.) est protégé par le droit d'auteur et appartient à Promptor ou ses partenaires.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Licence d'utilisation</h3>
            <p>
              Nous vous accordons une licence personnelle, non exclusive, non transférable et révocable pour utiliser le service.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Contenu utilisateur</h3>
            <p>
              Vous conservez tous les droits sur les prompts que vous créez via le service.
              Cependant, vous nous accordez une licence mondiale pour stocker, traiter et afficher vos prompts afin de fournir le service.
            </p>
            <p>
              <strong>Important</strong> : Les prompts générés utilisent Google Gemini AI. Consultez également les <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer">conditions d'utilisation de Google Gemini</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Garanties et responsabilités</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Disponibilité</h3>
            <p>
              Nous nous efforçons de maintenir le service disponible 24/7, mais nous ne garantissons pas une disponibilité ininterrompue.
              Des maintenances programmées peuvent avoir lieu (vous serez prévenus à l'avance).
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Qualité du service</h3>
            <p>
              Le service est fourni "en l'état". Nous ne garantissons pas que :
            </p>
            <ul>
              <li>Les résultats générés seront toujours pertinents ou exacts</li>
              <li>Le service sera exempt d'erreurs ou de bugs</li>
              <li>Le service répondra à vos besoins spécifiques</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.3 Limitation de responsabilité</h3>
            <p>
              Dans les limites autorisées par la loi, Promptor ne saurait être tenu responsable de :
            </p>
            <ul>
              <li>Pertes de profits, données ou opportunités commerciales</li>
              <li>Dommages indirects, accessoires ou consécutifs</li>
              <li>Utilisation inappropriée du service ou de son contenu</li>
              <li>Actions de tiers (hacking, virus, etc.)</li>
            </ul>
            <p>
              Notre responsabilité totale est limitée au montant payé au cours des 12 derniers mois.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Protection des données</h2>
            <p>
              Le traitement de vos données personnelles est régi par notre <a href="/politique-confidentialite" className="text-primary hover:underline">Politique de confidentialité</a>, qui fait partie intégrante des présentes CGU.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Droit applicable et juridiction</h2>
            <p>
              Les présentes CGU sont régies par le droit français.
              Tout litige sera soumis aux tribunaux français compétents, après tentative de résolution amiable.
            </p>
            <p>
              Conformément à l'article L.612-1 du Code de la consommation, en cas de litige vous pouvez recourir gratuitement à la médiation de la consommation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p>
              Pour toute question concernant les présentes CGU :
            </p>
            <ul className="list-none space-y-1">
              <li><strong>Email</strong> : contact@promptor.fr</li>
              <li><strong>Support</strong> : Via le formulaire de contact</li>
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
