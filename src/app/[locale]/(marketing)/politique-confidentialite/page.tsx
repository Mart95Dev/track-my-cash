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
    title: "Politique de confidentialité — Koupli",
    description:
      "Comment Koupli collecte, utilise et protège vos données personnelles.",
    path: "politique-confidentialite",
    locale,
  });
}

export default function PolitiqueConfidentialitePage() {
  return (
    <ScrollRevealSection>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Accueil", url: `${SEO_CONFIG.baseUrl}/fr` },
              {
                name: "Confidentialité",
                url: `${SEO_CONFIG.baseUrl}/fr/politique-confidentialite`,
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
              Politique de confidentialité
            </h1>
            <p className="text-text-muted text-lg leading-relaxed">
              Nous prenons la protection de vos données personnelles très au
              sérieux. Cette politique décrit comment nous collectons, utilisons
              et protégeons vos informations.
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
                <strong>A PERSONNALISER :</strong> Adaptez ce document à vos
                pratiques réelles. Les éléments entre [crochets] sont à
                compléter. Ce modèle est un point de départ — nous recommandons
                une validation par un juriste.
              </p>
            </div>

            <h2>1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement de vos données personnelles est :
              <br />
              <br />
              <strong>[Raison sociale]</strong>
              <br />
              [Adresse complète]
              <br />
              Email : [email de contact]
              <br />
              [Si DPO désigné : Délégué à la Protection des Données (DPO) :
              [Nom], joignable à [email DPO]]
            </p>

            <h2>2. Données collectées</h2>
            <p>
              Dans le cadre de l&apos;utilisation de Koupli, nous
              collectons les données suivantes :
            </p>

            <h3>Données fournies directement par vous</h3>
            <ul>
              <li>
                <strong>Données d&apos;inscription :</strong> prénom, adresse
                email, mot de passe (stocké sous forme hashée)
              </li>
              <li>
                <strong>Données de profil :</strong> préférences
                d&apos;utilisation, paramètres de l&apos;espace couple
              </li>
              <li>
                <strong>Données financières importées :</strong> transactions
                bancaires (montant, date, libellé, catégorie) que vous importez
                volontairement via des fichiers CSV, XLSX ou PDF
              </li>
              <li>
                <strong>Données de l&apos;espace couple :</strong> transactions
                partagées, règles de répartition, objectifs d&apos;épargne
                communs
              </li>
            </ul>

            <h3>Données collectées automatiquement</h3>
            <ul>
              <li>
                <strong>Données techniques :</strong> adresse IP, type de
                navigateur, système d&apos;exploitation, pages consultées, date
                et heure de connexion
              </li>
              <li>
                <strong>Cookies :</strong> voir notre{" "}
                <Link href="/cookies">Politique de cookies</Link> pour plus de
                détails
              </li>
            </ul>

            <div className="highlight-box">
              <p>
                <strong>Ce que nous ne collectons PAS :</strong> nous
                n&apos;avons jamais accès à vos identifiants bancaires, vos mots
                de passe bancaires, vos numéros de carte ou votre RIB.
                L&apos;import de transactions se fait uniquement via des
                fichiers que vous téléchargez manuellement.
              </p>
            </div>

            <h2>3. Finalités du traitement</h2>
            <p>
              Vos données sont traitées pour les finalités suivantes :
            </p>
            <table>
              <thead>
                <tr>
                  <th>Finalité</th>
                  <th>Base légale</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Création et gestion de votre compte utilisateur</td>
                  <td>Exécution du contrat</td>
                </tr>
                <tr>
                  <td>
                    Fourniture du service Koupli (import, catégorisation,
                    répartition, budgets)
                  </td>
                  <td>Exécution du contrat</td>
                </tr>
                <tr>
                  <td>
                    Fonctionnement de l&apos;espace couple (partage de données
                    avec votre partenaire)
                  </td>
                  <td>Exécution du contrat + consentement</td>
                </tr>
                <tr>
                  <td>
                    Conseils personnalisés par l&apos;IA (catégorisation,
                    alertes, recommandations)
                  </td>
                  <td>Exécution du contrat</td>
                </tr>
                <tr>
                  <td>Envoi d&apos;emails récapitulatifs hebdomadaires</td>
                  <td>Exécution du contrat</td>
                </tr>
                <tr>
                  <td>
                    Envoi de communications marketing (newsletter, nouveautés)
                  </td>
                  <td>Consentement</td>
                </tr>
                <tr>
                  <td>
                    Amélioration du service et statistiques d&apos;usage
                    agrégées
                  </td>
                  <td>Intérêt légitime</td>
                </tr>
                <tr>
                  <td>Gestion des demandes de support</td>
                  <td>Exécution du contrat</td>
                </tr>
                <tr>
                  <td>Respect des obligations légales et fiscales</td>
                  <td>Obligation légale</td>
                </tr>
              </tbody>
            </table>

            <h2>4. Partage des données</h2>
            <p>
              Vos données personnelles ne sont jamais vendues à des tiers.
            </p>
            <p>
              Elles peuvent être partagées uniquement dans les cas suivants :
            </p>
            <ul>
              <li>
                <strong>Avec votre partenaire :</strong> uniquement les données
                que vous avez explicitement marquées comme « partagées » dans
                l&apos;espace couple. Vos comptes et transactions personnels
                restent strictement privés.
              </li>
              <li>
                <strong>Avec nos sous-traitants techniques :</strong>{" "}
                hébergement, envoi d&apos;emails, traitement des paiements. Ces
                prestataires sont contractuellement tenus de protéger vos
                données et ne peuvent les utiliser à d&apos;autres fins.
                [Lister les principaux sous-traitants : hébergeur, service
                email, processeur de paiement]
              </li>
              <li>
                <strong>En cas d&apos;obligation légale :</strong> si une
                autorité judiciaire ou administrative nous y contraint.
              </li>
            </ul>

            <h2>5. Durée de conservation</h2>
            <table>
              <thead>
                <tr>
                  <th>Type de données</th>
                  <th>Durée de conservation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Données de compte (profil, email)</td>
                  <td>
                    Pendant la durée de votre inscription + [X] mois après
                    suppression du compte
                  </td>
                </tr>
                <tr>
                  <td>Données financières importées</td>
                  <td>
                    Pendant la durée de votre inscription. Supprimées à la
                    clôture du compte.
                  </td>
                </tr>
                <tr>
                  <td>Données de l&apos;espace couple</td>
                  <td>
                    Pendant la durée de l&apos;espace couple. Supprimées quand
                    les deux partenaires quittent l&apos;espace.
                  </td>
                </tr>
                <tr>
                  <td>Données de facturation</td>
                  <td>10 ans (obligation légale comptable)</td>
                </tr>
                <tr>
                  <td>Logs de connexion</td>
                  <td>12 mois (obligation légale)</td>
                </tr>
                <tr>
                  <td>Cookies</td>
                  <td>13 mois maximum</td>
                </tr>
              </tbody>
            </table>

            <h2>6. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez des droits suivants sur vos
              données personnelles :
            </p>
            <ul>
              <li>
                <strong>Droit d&apos;accès :</strong> obtenir la confirmation
                que vos données sont traitées et en recevoir une copie
              </li>
              <li>
                <strong>Droit de rectification :</strong> corriger des données
                inexactes ou incomplètes
              </li>
              <li>
                <strong>Droit à l&apos;effacement :</strong> demander la
                suppression de vos données (dans les limites légales)
              </li>
              <li>
                <strong>Droit à la portabilité :</strong> recevoir vos données
                dans un format structuré et lisible (CSV, PDF)
              </li>
              <li>
                <strong>Droit d&apos;opposition :</strong> vous opposer au
                traitement de vos données pour des motifs légitimes
              </li>
              <li>
                <strong>Droit à la limitation :</strong> demander la suspension
                du traitement de vos données
              </li>
              <li>
                <strong>Droit de retirer votre consentement :</strong> à tout
                moment pour les traitements basés sur le consentement
              </li>
            </ul>

            <div className="highlight-box">
              <p>
                <strong>Comment exercer vos droits :</strong> envoyez un email à{" "}
                <strong>[email de contact / DPO]</strong> en précisant votre
                demande et en joignant un justificatif d&apos;identité. Nous
                nous engageons à répondre dans un délai d&apos;un mois.
              </p>
            </div>

            <p>
              Si vous estimez que vos droits ne sont pas respectés après nous
              avoir contactés, vous pouvez adresser une réclamation à la CNIL :
              <br />
              Commission Nationale de l&apos;Informatique et des Libertés
              <br />
              3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07
              <br />
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.cnil.fr
              </a>
            </p>

            <h2>7. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles
              appropriées pour protéger vos données personnelles contre tout
              accès non autorisé, modification, divulgation ou destruction :
            </p>
            <ul>
              <li>
                Les mots de passe sont hashés et ne sont jamais stockés en clair
              </li>
              <li>
                Les communications entre votre navigateur et nos serveurs sont
                chiffrées (HTTPS/TLS)
              </li>
              <li>
                L&apos;accès aux données en interne est restreint aux personnes
                qui en ont besoin
              </li>
              <li>Des sauvegardes régulières sont effectuées</li>
              <li>
                [Ajouter d&apos;autres mesures pertinentes : WAF, audit de
                sécurité, etc.]
              </li>
            </ul>

            <h2>8. Transferts de données hors UE</h2>
            <p>
              [Si vos données restent en UE :] Vos données sont hébergées au
              sein de l&apos;Union européenne et ne font l&apos;objet
              d&apos;aucun transfert vers des pays tiers.
            </p>
            <p>
              [Si certains sous-traitants sont hors UE :] Certains de nos
              sous-traitants techniques peuvent être situés en dehors de
              l&apos;Union européenne. Dans ce cas, nous nous assurons que des
              garanties appropriées sont en place (clauses contractuelles types
              de la Commission européenne, ou décision d&apos;adéquation).
            </p>

            <h2>9. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de
              confidentialité à tout moment. En cas de modification
              substantielle, nous vous en informerons par email ou via une
              notification dans l&apos;application. La date de dernière mise à
              jour est indiquée en haut de cette page.
            </p>

            <h2>10. Contact</h2>
            <p>
              Pour toute question relative à cette politique ou à vos données
              personnelles :
              <br />
              <br />
              <strong>[Raison sociale]</strong>
              <br />
              Email : <strong>[email de contact / DPO]</strong>
              <br />
              Adresse : [adresse postale]
            </p>
          </div>
        </section>
      </div>
    </ScrollRevealSection>
  );
}
