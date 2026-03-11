import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ScrollRevealSection } from "@/components/marketing/scroll-reveal";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schemas";
import { SEO_CONFIG } from "@/lib/seo/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Mentions légales — Koupli",
    description:
      "Informations légales relatives à l'édition et à l'hébergement du site koupli.com",
    path: "mentions-legales",
    locale,
  });
}

export default function MentionsLegalesPage() {
  return (
    <ScrollRevealSection>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Accueil", url: `${SEO_CONFIG.baseUrl}/fr` },
              {
                name: "Mentions légales",
                url: `${SEO_CONFIG.baseUrl}/fr/mentions-legales`,
              },
            ])
          ),
        }}
      />
      <div className="min-h-screen">
        {/* Hero */}
        <section className="bg-[#F5F3FF] py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-6 fade-up">
            <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight mb-4 text-slate-900">
              Mentions légales
            </h1>
            <p className="text-text-muted text-lg leading-relaxed">
              Informations légales relatives à l&apos;édition et à
              l&apos;hébergement du site koupli.com
            </p>
            <p className="text-text-light text-sm mt-4">
              Dernière mise à jour : [JJ/MM/AAAA]
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-24">
          <div className="legal-content max-w-3xl mx-auto px-6">
            <div className="highlight-box">
              <p>
                <strong>A PERSONNALISER :</strong> Les éléments entre [crochets]
                sont à remplacer par vos informations réelles avant publication.
              </p>
            </div>

            <h2>Éditeur du site</h2>
            <p>
              Le site <strong>koupli.com</strong> est édité par :
              <br />
              <br />
              <strong>[Raison sociale]</strong>
              <br />
              [Forme juridique] au capital de [montant] euros
              <br />
              Siège social : [Adresse complète]
              <br />
              Immatriculée au RCS de [Ville] sous le numéro [Numéro RCS]
              <br />
              Numéro SIRET : [Numéro SIRET]
              <br />
              Numéro de TVA intracommunautaire : [Numéro TVA]
              <br />
              <br />
              Directeur de la publication : [Prénom Nom]
              <br />
              Contact : [adresse email de contact]
              <br />
              Téléphone : [numéro de téléphone]
            </p>

            <h2>Hébergement</h2>
            <p>
              Le site est hébergé par :
              <br />
              <br />
              <strong>[Nom de l&apos;hébergeur]</strong>
              <br />
              [Adresse de l&apos;hébergeur]
              <br />
              [Téléphone de l&apos;hébergeur]
              <br />
              Site web : [URL de l&apos;hébergeur]
            </p>

            <h2>Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu du site koupli.com (textes,
              images, graphismes, logo, icônes, logiciels, base de données) est
              la propriété exclusive de [Raison sociale] ou de ses partenaires
              et est protégé par les lois françaises et internationales
              relatives à la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication,
              transmission, dénaturation, totale ou partielle du site ou de son
              contenu, par quelque procédé que ce soit, et sur quelque support
              que ce soit est interdite sans l&apos;autorisation écrite préalable
              de [Raison sociale].
            </p>
            <p>
              Toute exploitation non autorisée du site ou de son contenu, des
              informations qui y sont divulguées, engagerait la responsabilité
              de l&apos;utilisateur et constituerait une contrefaçon sanctionnée
              par les articles L.335-2 et suivants du Code de la Propriété
              Intellectuelle.
            </p>

            <h2>Responsabilité</h2>
            <p>
              [Raison sociale] s&apos;efforce d&apos;assurer au mieux
              l&apos;exactitude et la mise à jour des informations diffusées sur
              le site. Toutefois, [Raison sociale] ne peut garantir
              l&apos;exactitude, la précision ou l&apos;exhaustivité des
              informations mises à disposition sur le site.
            </p>
            <p>
              En conséquence, [Raison sociale] décline toute responsabilité pour
              toute imprécision, inexactitude ou omission portant sur des
              informations disponibles sur le site, ainsi que pour tous dommages
              résultant d&apos;une intrusion frauduleuse d&apos;un tiers ayant
              entraîné une modification des informations mises à disposition sur
              le site.
            </p>

            <h2>Liens hypertextes</h2>
            <p>
              Le site koupli.com peut contenir des liens hypertextes vers
              d&apos;autres sites internet. [Raison sociale] n&apos;exerce aucun
              contrôle sur ces sites et décline toute responsabilité quant à
              leur contenu ou aux pratiques de protection de la vie privée de
              ces sites tiers.
            </p>

            <h2>Protection des données personnelles</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données
              (RGPD) et à la loi Informatique et Libertés modifiée, vous
              disposez de droits sur vos données personnelles. Pour en savoir
              plus, consultez notre{" "}
              <Link href="/politique-confidentialite">
                Politique de confidentialité
              </Link>
              .
            </p>
            <p>
              Pour toute question relative à la protection de vos données
              personnelles, vous pouvez nous contacter à l&apos;adresse :{" "}
              <strong>[email DPO ou contact]</strong>
            </p>
            <p>
              Vous disposez également du droit d&apos;introduire une réclamation
              auprès de la CNIL (Commission Nationale de l&apos;Informatique et
              des Libertés) :{" "}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.cnil.fr
              </a>
            </p>

            <h2>Droit applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit français. En
              cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </div>
        </section>
      </div>
    </ScrollRevealSection>
  );
}
