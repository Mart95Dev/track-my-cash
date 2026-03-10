import type { Metadata } from "next";
import { ScrollRevealSection } from "@/components/marketing/scroll-reveal";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — TrackMyCash",
  description:
    "Les conditions régissant l'utilisation du service TrackMyCash.",
  openGraph: {
    title: "Conditions Générales d'Utilisation — TrackMyCash",
    description:
      "Les conditions régissant l'utilisation du service TrackMyCash.",
    type: "website",
  },
};

export default function CGUPage() {
  return (
    <ScrollRevealSection>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="bg-[#F5F3FF] py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-6 fade-up">
            <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight mb-4 text-slate-900">
              Conditions Générales d&apos;Utilisation
            </h1>
            <p className="text-text-muted text-lg leading-relaxed">
              Les présentes conditions régissent l&apos;utilisation du service
              TrackMyCash. En créant un compte, vous acceptez ces conditions
              dans leur intégralité.
            </p>
            <p className="text-text-light text-sm mt-4">
              Dernière mise à jour : [JJ/MM/AAAA]
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-24">
          <div className="legal-content max-w-3xl mx-auto px-6 fade-up">
            <div className="highlight-box">
              <p>
                <strong>A PERSONNALISER :</strong> Ce modèle est un point de
                départ solide mais doit être validé par un juriste avant
                publication, notamment les clauses de responsabilité et de
                résiliation.
              </p>
            </div>

            <h2>1. Objet</h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation (ci-après «
              CGU ») ont pour objet de définir les conditions d&apos;accès et
              d&apos;utilisation du service TrackMyCash, accessible à
              l&apos;adresse <strong>trackmycash.com</strong> et via les
              applications mobiles associées (ci-après « le Service »).
            </p>
            <p>
              Le Service est édité par <strong>[Raison sociale]</strong>, [forme
              juridique] au capital de [montant] euros, immatriculée au RCS de
              [Ville] sous le numéro [Numéro RCS] (ci-après « l&apos;Éditeur
              »).
            </p>

            <h2>2. Description du Service</h2>
            <p>
              TrackMyCash est un service de gestion financière collaborative
              destiné aux couples. Il permet notamment de :
            </p>
            <ul>
              <li>
                Importer des relevés bancaires au format CSV, XLSX ou PDF
              </li>
              <li>Catégoriser et organiser les transactions</li>
              <li>
                Partager certaines transactions et comptes avec un partenaire
                via un espace couple
              </li>
              <li>Définir des règles de répartition des dépenses</li>
              <li>Fixer et suivre des objectifs d&apos;épargne communs</li>
              <li>
                Recevoir des conseils personnalisés générés par intelligence
                artificielle
              </li>
              <li>Exporter ses données en CSV ou PDF</li>
            </ul>
            <p>
              Le Service ne constitue en aucun cas un service de conseil
              financier, bancaire ou d&apos;investissement. Les suggestions
              générées par l&apos;intelligence artificielle sont fournies à
              titre indicatif uniquement.
            </p>

            <h2>3. Inscription et compte</h2>
            <h3>3.1 Création de compte</h3>
            <p>
              L&apos;accès au Service nécessite la création d&apos;un compte
              personnel. L&apos;utilisateur doit fournir des informations
              exactes et s&apos;engage à les mettre à jour. Toute personne
              physique âgée d&apos;au moins 16 ans peut créer un compte.
            </p>

            <h3>3.2 Sécurité du compte</h3>
            <p>
              L&apos;utilisateur est responsable de la confidentialité de son
              mot de passe et de toute activité effectuée depuis son compte. En
              cas de suspicion d&apos;utilisation non autorisée,
              l&apos;utilisateur doit en informer immédiatement l&apos;Éditeur à
              l&apos;adresse [email de contact].
            </p>

            <h3>3.3 Espace couple</h3>
            <p>
              L&apos;espace couple est activé sur invitation d&apos;un
              partenaire. Chaque partenaire conserve son compte personnel
              distinct. Seules les données explicitement marquées comme «
              partagées » par un utilisateur sont visibles par son partenaire.
              Les comptes et transactions personnels restent strictement privés.
            </p>
            <p>
              En cas de séparation, chaque utilisateur peut quitter
              l&apos;espace couple à tout moment. Les données personnelles de
              chacun sont conservées sur leur compte respectif. Seules les
              données spécifiques à l&apos;espace couple partagé sont supprimées
              pour les deux parties.
            </p>

            <h2>4. Abonnements et tarification</h2>
            <h3>4.1 Offres disponibles</h3>
            <p>Le Service est proposé selon les formules suivantes :</p>
            <ul>
              <li>
                <strong>Gratuit :</strong> accès limité aux fonctionnalités de
                base
              </li>
              <li>
                <strong>Pro :</strong> [prix]/mois (ou [prix réduit]/mois en
                facturation annuelle) — fonctionnalités avancées et espace
                couple
              </li>
              <li>
                <strong>Premium :</strong> [prix]/mois (ou [prix réduit]/mois en
                facturation annuelle) — toutes les fonctionnalités, IA illimitée
                et support prioritaire
              </li>
            </ul>
            <p>
              Un seul abonnement Pro ou Premium couvre l&apos;accès pour deux
              personnes dans un même espace couple.
            </p>

            <h3>4.2 Essai gratuit</h3>
            <p>
              À la création d&apos;un compte, un essai gratuit de 14 jours de
              l&apos;offre Pro est proposé. Aucune carte bancaire n&apos;est
              requise pour l&apos;essai. À l&apos;issue de la période
              d&apos;essai, le compte bascule automatiquement sur l&apos;offre
              Gratuite sauf souscription à un abonnement payant.
            </p>

            <h3>4.3 Paiement</h3>
            <p>
              Le paiement s&apos;effectue par carte bancaire via notre
              prestataire de paiement sécurisé [Stripe / autre]. Les prix sont
              indiqués en euros TTC. L&apos;abonnement est renouvelé
              automatiquement à chaque échéance (mensuelle ou annuelle).
            </p>

            <h3>4.4 Résiliation</h3>
            <p>
              L&apos;utilisateur peut résilier son abonnement à tout moment
              depuis les paramètres de son compte. La résiliation prend effet à
              la fin de la période en cours. Aucun remboursement au prorata
              n&apos;est effectué pour la période déjà entamée.
            </p>

            <h2>5. Utilisation du Service</h2>
            <h3>5.1 Utilisation conforme</h3>
            <p>
              L&apos;utilisateur s&apos;engage à utiliser le Service de manière
              conforme aux présentes CGU et à la législation en vigueur. Il est
              interdit de :
            </p>
            <ul>
              <li>
                Utiliser le Service à des fins illicites ou frauduleuses
              </li>
              <li>
                Tenter d&apos;accéder aux données d&apos;autres utilisateurs
              </li>
              <li>
                Utiliser des moyens automatisés (bots, scripts) pour accéder au
                Service
              </li>
              <li>
                Modifier, copier ou distribuer le contenu du Service sans
                autorisation
              </li>
              <li>Introduire des virus ou tout autre code malveillant</li>
            </ul>

            <h3>5.2 Données importées</h3>
            <p>
              L&apos;utilisateur est seul responsable de l&apos;exactitude et de
              la légalité des données qu&apos;il importe dans le Service.
              L&apos;Éditeur ne vérifie pas le contenu des fichiers importés et
              décline toute responsabilité quant à leur exactitude.
            </p>

            <h2>6. Intelligence artificielle</h2>
            <p>
              Le Service intègre des fonctionnalités d&apos;intelligence
              artificielle (catégorisation automatique, conseils, alertes). Ces
              fonctionnalités sont fournies à titre d&apos;aide et
              d&apos;information uniquement.
            </p>
            <ul>
              <li>
                Les suggestions de l&apos;IA ne constituent pas des conseils
                financiers professionnels
              </li>
              <li>
                L&apos;IA peut commettre des erreurs de catégorisation ou
                d&apos;analyse
              </li>
              <li>
                L&apos;utilisateur reste seul responsable de ses décisions
                financières
              </li>
              <li>
                L&apos;Éditeur recommande de vérifier les catégorisations
                automatiques
              </li>
            </ul>

            <h2>7. Disponibilité du Service</h2>
            <p>
              L&apos;Éditeur met tout en œuvre pour assurer la disponibilité du
              Service 24h/24 et 7j/7. Toutefois, l&apos;accès peut être
              temporairement suspendu pour des raisons de maintenance, de mise à
              jour ou en cas de force majeure. L&apos;Éditeur ne garantit pas un
              fonctionnement ininterrompu et ne saurait être tenu responsable
              des dommages résultant d&apos;une indisponibilité du Service.
            </p>

            <h2>8. Responsabilité</h2>
            <h3>8.1 Limitation de responsabilité</h3>
            <p>
              Le Service est fourni « en l&apos;état ». L&apos;Éditeur ne
              saurait être tenu responsable des décisions financières prises par
              l&apos;utilisateur sur la base des informations ou suggestions
              fournies par le Service.
            </p>
            <p>
              En tout état de cause, la responsabilité de l&apos;Éditeur est
              limitée au montant des sommes versées par l&apos;utilisateur au
              cours des 12 derniers mois au titre de son abonnement.
            </p>

            <h3>8.2 Force majeure</h3>
            <p>
              L&apos;Éditeur ne saurait être tenu responsable de tout
              manquement à ses obligations résultant d&apos;un cas de force
              majeure tel que défini par la jurisprudence française (catastrophes
              naturelles, pannes de réseau, cyberattaques, etc.).
            </p>

            <h2>9. Propriété intellectuelle</h2>
            <p>
              Le Service, sa structure, son design, ses fonctionnalités, ses
              algorithmes et son contenu éditorial sont la propriété exclusive
              de [Raison sociale] et sont protégés par le droit de la propriété
              intellectuelle.
            </p>
            <p>
              L&apos;utilisateur conserve la propriété de ses données
              personnelles et financières importées dans le Service. En
              utilisant le Service, l&apos;utilisateur accorde à l&apos;Éditeur
              une licence limitée, non exclusive et révocable, uniquement pour
              les besoins du fonctionnement du Service (stockage, affichage,
              traitement IA).
            </p>

            <h2>10. Suppression de compte</h2>
            <p>
              L&apos;utilisateur peut supprimer son compte à tout moment depuis
              les paramètres de l&apos;application. La suppression entraîne :
            </p>
            <ul>
              <li>
                La suppression définitive de toutes les données personnelles et
                financières
              </li>
              <li>
                La résiliation de tout abonnement en cours (effectif à la fin de
                la période déjà payée)
              </li>
              <li>La sortie automatique de tout espace couple</li>
            </ul>
            <p>
              Nous recommandons d&apos;exporter vos données (CSV/PDF) avant de
              supprimer votre compte. Certaines données pourront être conservées
              pour des raisons légales (voir notre Politique de
              confidentialité).
            </p>

            <h2>11. Modification des CGU</h2>
            <p>
              L&apos;Éditeur se réserve le droit de modifier les présentes CGU à
              tout moment. Les modifications entreront en vigueur 30 jours après
              leur notification par email ou via l&apos;application. Si
              l&apos;utilisateur continue à utiliser le Service après cette
              date, il sera réputé avoir accepté les nouvelles CGU. En cas de
              désaccord, l&apos;utilisateur pourra supprimer son compte.
            </p>

            <h2>12. Droit applicable et litiges</h2>
            <p>
              Les présentes CGU sont régies par le droit français. En cas de
              litige relatif à l&apos;interprétation ou l&apos;exécution des
              présentes, les parties s&apos;engagent à rechercher une solution
              amiable avant toute action judiciaire.
            </p>
            <p>
              Conformément aux dispositions du Code de la consommation,
              l&apos;utilisateur peut recourir gratuitement au service de
              médiation de la consommation. Le médiateur compétent est : [Nom du
              médiateur, coordonnées, site web].
            </p>
            <p>
              À défaut de résolution amiable, le litige sera porté devant les
              tribunaux compétents conformément aux règles de droit commun.
            </p>

            <h2>13. Contact</h2>
            <p>
              Pour toute question relative aux présentes CGU :
              <br />
              <br />
              <strong>[Raison sociale]</strong>
              <br />
              Email : <strong>[email de contact]</strong>
              <br />
              Adresse : [adresse postale]
            </p>
          </div>
        </section>
      </div>
    </ScrollRevealSection>
  );
}
