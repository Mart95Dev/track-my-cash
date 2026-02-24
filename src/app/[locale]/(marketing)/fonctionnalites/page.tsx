import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Fonctionnalités — TrackMyCash",
  description:
    "Découvrez toutes les fonctionnalités de TrackMyCash : gestion multi-comptes, import bancaire, catégorisation IA, budgets, objectifs d'épargne et plus encore.",
  openGraph: {
    title: "Fonctionnalités — TrackMyCash",
    description:
      "Découvrez toutes les fonctionnalités de TrackMyCash : gestion multi-comptes, import bancaire, catégorisation IA, budgets, objectifs d'épargne et plus encore.",
    type: "website",
  },
};

type Feature = {
  icon: string;
  title: string;
  desc: string;
  bullets: string[];
  badge?: string;
};

const FEATURE_GROUPS: Array<{ group: string; features: Feature[] }> = [
  {
    group: "Gestion des comptes",
    features: [
      {
        icon: "account_balance_wallet",
        title: "Multi-comptes",
        desc: "Centralisez tous vos comptes bancaires en un seul endroit. Chaque compte conserve son historique, son solde et ses transactions.",
        bullets: [
          "Comptes courants, épargne, cartes",
          "Solde calculé en temps réel",
          "Vue agrégée de tous les comptes",
          "Réconciliation manuelle possible",
        ],
      },
      {
        icon: "autorenew",
        title: "Paiements récurrents",
        desc: "Suivez automatiquement vos abonnements, loyers et prélèvements réguliers. Ne manquez plus aucune échéance.",
        bullets: [
          "Détection des récurrences",
          "Fréquences : mensuelle, hebdo, annuelle",
          "Alertes et rappels",
          "Suggestions IA de nouveaux récurrents",
        ],
      },
    ],
  },
  {
    group: "Import & Export",
    features: [
      {
        icon: "file_download",
        title: "Import multi-format",
        desc: "Importez votre historique bancaire depuis les formats CSV, Excel et PDF des principales banques françaises et internationales.",
        bullets: [
          "CSV, XLSX, PDF supportés",
          "Banque Populaire, ING, Boursorama, Revolut…",
          "Déduplication automatique",
          "Détection du solde initial",
        ],
      },
      {
        icon: "file_upload",
        title: "Export de vos données",
        desc: "Exportez vos transactions et rapports dans les formats de votre choix pour les archiver ou les utiliser dans d'autres outils.",
        bullets: [
          "Export CSV des transactions",
          "Export PDF mensuel (Pro)",
          "Portabilité RGPD complète",
          "Rapport annuel IA (Premium)",
        ],
      },
    ],
  },
  {
    group: "Analyse & Intelligence",
    features: [
      {
        icon: "auto_awesome",
        title: "Catégorisation IA automatique",
        desc: "L'IA analyse et catégorise vos transactions automatiquement dès l'import. Vous pouvez affiner ou corriger chaque catégorie.",
        bullets: [
          "Catégorisation instantanée à l'import",
          "Apprentissage de vos habitudes",
          "Tags personnalisables",
          "Disponible sur le plan Pro",
        ],
        badge: "Pro",
      },
      {
        icon: "smart_toy",
        title: "Conseiller IA",
        desc: "Posez vos questions financières à votre assistant IA intégré. Obtenez des analyses, conseils et alertes personnalisées.",
        bullets: [
          "10 conseils/mois sur le plan Pro",
          "Illimité sur le plan Premium",
          "Multi-modèles IA (Premium)",
          "Analyse des tendances de dépenses",
        ],
        badge: "Pro",
      },
    ],
  },
  {
    group: "Planification",
    features: [
      {
        icon: "donut_large",
        title: "Budgets par catégorie",
        desc: "Définissez des budgets mensuels par catégorie et suivez votre consommation en temps réel avec des indicateurs visuels clairs.",
        bullets: [
          "Budgets mensuels personnalisables",
          "Indicateur vert / orange / rouge",
          "Suggestions IA de budgets (Pro)",
          "Historique des dépassements",
        ],
      },
      {
        icon: "savings",
        title: "Objectifs d'épargne",
        desc: "Fixez-vous des objectifs d'épargne et suivez votre progression. TrackMyCash calcule automatiquement l'avancement vers chaque but.",
        bullets: [
          "Objectif en montant et date cible",
          "Progression en pourcentage",
          "Contributions mensuelles recommandées",
          "Disponible sur le plan Pro",
        ],
        badge: "Pro",
      },
    ],
  },
  {
    group: "Confort & Accessibilité",
    features: [
      {
        icon: "language",
        title: "Multilingue",
        desc: "TrackMyCash est disponible en 5 langues pour s'adapter à tous les utilisateurs, où qu'ils se trouvent.",
        bullets: [
          "Français, Anglais, Espagnol",
          "Allemand, Italien",
          "Détection automatique de la langue",
          "Formatage monétaire local",
        ],
      },
      {
        icon: "mail",
        title: "Résumés par email",
        desc: "Recevez chaque semaine un résumé de vos finances directement dans votre boîte mail, sans avoir à ouvrir l'application.",
        bullets: [
          "Récapitulatif hebdomadaire",
          "Alertes de dépassement de budget",
          "Rapport mensuel PDF (Pro)",
          "Rapport annuel IA (Premium)",
        ],
        badge: "Pro",
      },
    ],
  },
];

function BadgePlan({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
      {label}
    </span>
  );
}

export default function FonctionnalitesPage() {
  return (
    <div className="bg-background-light min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* En-tête */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-text-main tracking-tight mb-3">
            Tout ce que TrackMyCash peut faire pour vous
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Une application pensée pour simplifier la gestion de vos finances personnelles,
            de l&apos;import de vos relevés à l&apos;analyse IA de vos habitudes.
          </p>
        </div>

        {/* Groupes de fonctionnalités */}
        <div className="flex flex-col gap-16">
          {FEATURE_GROUPS.map((group) => (
            <section key={group.group}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">
                {group.group}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.features.map((feature) => (
                  <div
                    key={feature.title}
                    className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}
                        >
                          {feature.icon}
                        </span>
                      </div>
                      {feature.badge && <BadgePlan label={feature.badge} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-main text-base mb-1">{feature.title}</h3>
                      <p className="text-text-muted text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                    <ul className="flex flex-col gap-1.5 mt-auto">
                      {feature.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-2 text-sm text-text-main">
                          <span
                            className="material-symbols-outlined text-success flex-shrink-0"
                            style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-primary rounded-2xl p-10 text-center mt-16">
          <h2 className="text-2xl font-bold text-white mb-3">
            Prêt à essayer gratuitement ?
          </h2>
          <p className="text-white/80 mb-8">
            14 jours d&apos;essai gratuit · Aucune carte requise · Annulable à tout moment
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center h-12 px-8 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-colors"
            >
              Créer mon compte gratuitement
            </Link>
            <Link
              href="/tarifs"
              className="inline-flex items-center justify-center h-12 px-8 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
