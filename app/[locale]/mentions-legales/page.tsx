import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MentionsLegalesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Mentions Légales</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Éditeur du site</h2>
            <p>
              Le site <strong>Promptor</strong> est édité par :
            </p>
            <ul className="list-none space-y-1">
              <li><strong>Raison sociale</strong> : [VOTRE NOM/RAISON SOCIALE]</li>
              <li><strong>Forme juridique</strong> : [Auto-entrepreneur / SARL / SAS / etc.]</li>
              <li><strong>Adresse du siège social</strong> : [VOTRE ADRESSE COMPLÈTE]</li>
              <li><strong>Email</strong> : contact@promptor.fr</li>
              <li><strong>SIRET</strong> : [VOTRE NUMÉRO SIRET]</li>
              <li><strong>TVA intracommunautaire</strong> : [VOTRE NUMÉRO TVA]</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              ⚠️ <strong>À COMPLÉTER</strong> : Remplacez les valeurs entre crochets par vos informations réelles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Directeur de la publication</h2>
            <p>
              <strong>Nom</strong> : [VOTRE NOM]<br />
              <strong>Email</strong> : contact@promptor.fr
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Hébergement</h2>
            <p>
              Le site est hébergé par :
            </p>
            <ul className="list-none space-y-1">
              <li><strong>Nom</strong> : Vercel Inc.</li>
              <li><strong>Adresse</strong> : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
              <li><strong>Site web</strong> : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">https://vercel.com</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, etc.) est la propriété exclusive de Promptor ou de ses partenaires.
              Toute reproduction, distribution ou utilisation sans autorisation écrite préalable est interdite et constitue une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Données personnelles</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.
            </p>
            <p>
              Pour plus d'informations, consultez notre <a href="/politique-confidentialite" className="text-primary hover:underline">Politique de confidentialité</a>.
            </p>
            <p>
              Pour exercer vos droits, contactez-nous à : <strong>contact@promptor.fr</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
            <p>
              Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser l'audience.
              En continuant votre navigation, vous acceptez l'utilisation de cookies conformément à notre politique de cookies.
            </p>
            <p>
              Vous pouvez à tout moment désactiver les cookies dans les paramètres de votre navigateur.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Responsabilité</h2>
            <p>
              L'éditeur s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site.
              Toutefois, il ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.
            </p>
            <p>
              L'éditeur ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation de ce site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Liens hypertextes</h2>
            <p>
              Ce site peut contenir des liens vers des sites tiers. L'éditeur n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont régies par le droit français.
              En cas de litige, et à défaut d'accord amiable, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Médiation</h2>
            <p>
              Conformément à l'article L.612-1 du Code de la consommation, nous proposons un dispositif de médiation de la consommation.
              L'entité de médiation retenue est : <strong>[NOM DU MÉDIATEUR]</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              ⚠️ <strong>À COMPLÉTER</strong> : Choisir un médiateur agréé (ex: Médiateur de la consommation CNPM).
            </p>
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
