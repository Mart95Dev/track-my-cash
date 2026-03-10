import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ScrollRevealSection } from "@/components/marketing/scroll-reveal";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schemas";
import { SEO_CONFIG } from "@/lib/seo/constants";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Fonctionnalités — Balance couple, import bancaire, IA",
    description: "Gestion financière de couple : balance automatique, import CSV/XLSX/PDF, conseiller IA et objectifs communs. Tout ce dont votre couple a besoin.",
    path: "fonctionnalites",
    locale,
    ogImage: "/og/fonctionnalites.png",
  });
}

// Re-exported for test compatibility
export const IMPORT_FORMATS = ["CSV", "XLSX", "PDF"] as const;

/* ── Data ─────────────────────────────────────────────────────────────── */

const COUPLE_POINTS = [
  {
    title: "Balance en temps réel",
    desc: "Sachez toujours combien chacun doit, sans stress.",
  },
  {
    title: "Règlement simplifié",
    desc: "Un bouton pour remettre les compteurs à zéro.",
  },
  {
    title: "Règles flexibles",
    desc: "50/50, prorata des revenus ou personnalisé par dépense.",
  },
  {
    title: "Confidentialité préservée",
    desc: "Vos comptes perso restent privés. Point.",
  },
];

const AI_POINTS = [
  {
    title: "Catégorisation auto",
    desc: "L\u2019IA apprend et trie vos dépenses sans effort.",
  },
  {
    title: "Insights hebdo",
    desc: "Recevez un résumé clair de votre santé financière.",
  },
  {
    title: "Conseiller couple",
    desc: "L\u2019IA analyse vos finances communes (Premium).",
  },
  {
    title: "Alertes budget",
    desc: "Notification avant de dépasser votre plafond mensuel.",
  },
];

const IMPORT_POINTS = [
  {
    title: "CSV, XLSX et PDF",
    desc: "Tous les formats exportés par votre banque.",
  },
  {
    title: "Dédoublication auto",
    desc: "Jamais de doublon, même en important plusieurs fois.",
  },
  {
    title: "Données locales",
    desc: "Vos fichiers ne quittent jamais votre appareil lors de l\u2019import.",
  },
  {
    title: "Banque Populaire, Revolut, MCB, BNP Paribas, Crédit Agricole et plus.",
    desc: "",
  },
];

const MORE_FEATURES = [
  {
    num: "01",
    title: "Export de données",
    desc: "Vos données vous appartiennent. Exportez l\u2019intégralité de votre historique en CSV ou PDF à tout moment.",
  },
  {
    num: "02",
    title: "Objectifs Communs",
    desc: "Vacances, mariage, immobilier. Créez des cagnottes virtuelles et suivez la progression de l\u2019épargne de chacun.",
  },
  {
    num: "03",
    title: "Prévisions Cash-flow",
    desc: "Un simulateur qui projette votre solde sur 12 mois en fonction de vos dépenses récurrentes et revenus prévus.",
  },
  {
    num: "04",
    title: "Confidentialité Maximale",
    desc: "Chaque compte est privé par défaut. Vous activez explicitement le partage pour que votre partenaire le voie.",
  },
  {
    num: "05",
    title: "Paiements Récurrents",
    desc: "Détectez et suivez vos abonnements, loyers et prélèvements. Alertes avant chaque échéance.",
  },
  {
    num: "06",
    title: "Budgets par Catégorie",
    desc: "Définissez des budgets mensuels et suivez votre consommation en temps réel avec indicateur visuel.",
  },
];

/* ── Helpers ──────────────────────────────────────────────────────────── */

function FeatureGrid({
  points,
}: {
  points: { title: string; desc: string }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {points.map((p) => (
        <div key={p.title} className="flex items-start gap-3">
          <span className="text-success mt-0.5 text-lg leading-none shrink-0">
            &#10003;
          </span>
          <div>
            <strong className="block text-slate-900">{p.title}</strong>
            {p.desc && (
              <span className="text-text-muted text-sm">{p.desc}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function FonctionnalitesPage() {
  const baseUrl = SEO_CONFIG.baseUrl;
  return (
    <ScrollRevealSection>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: "Accueil", url: `${baseUrl}/fr` },
        { name: "Fonctionnalités", url: `${baseUrl}/fr/fonctionnalites` },
      ])) }} />
      <div className="min-h-screen">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-[#F5F3FF] py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-6 text-center fade-up">
            <h1 className="font-serif text-4xl md:text-6xl leading-[1.1] tracking-tight mb-6 text-slate-900">
              Tout ce dont votre couple a{" "}
              <em className="text-primary not-italic italic">besoin</em>
            </h1>
            <p className="text-text-muted text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Une suite d&apos;outils financiers conçue pour la transparence et
              la sérénité. Pas un outil solo adapté après coup.
            </p>
          </div>
        </section>

        {/* ── Section 1 : Mode Couple ──────────────────────────────────── */}
        <section className="bg-white py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-6 fade-up">
            <div className="mb-10">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-[#FCE7F3] text-pink-600 mb-6">
                Mode Couple
              </span>
              <h2 className="font-serif text-3xl md:text-5xl leading-tight text-slate-900 mb-2">
                La fin des &laquo;&nbsp;Qui doit quoi&nbsp;?&nbsp;&raquo;
              </h2>
              <p className="font-serif text-3xl md:text-5xl leading-tight">
                <em className="text-primary">Le début de la sérénité.</em>
              </p>
            </div>
            <p className="text-text-muted text-lg leading-relaxed max-w-2xl mb-10">
              Chaque dépense peut être partagée instantanément. Définissez vos
              règles et laissez l&apos;application faire les calculs pénibles.
            </p>
            <FeatureGrid points={COUPLE_POINTS} />
          </div>
        </section>

        {/* ── Section 2 : Intelligence Artificielle ────────────────────── */}
        <section className="bg-[#FAFAF9] py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-6 fade-up">
            <div className="mb-10">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-[#EDE9FE] text-purple-600 mb-6">
                Intelligence Artificielle
              </span>
              <h2 className="font-serif text-3xl md:text-5xl leading-tight text-slate-900 mb-2">
                Un conseiller financier
              </h2>
              <p className="font-serif text-3xl md:text-5xl leading-tight text-slate-900">
                qui ne dort jamais.
              </p>
            </div>
            <p className="text-text-muted text-lg leading-relaxed max-w-2xl mb-10">
              Notre IA analyse vos habitudes de dépenses pour détecter des
              économies potentielles et vous alerter avant que vous ne dépassiez
              votre budget mensuel.
            </p>
            <FeatureGrid points={AI_POINTS} />
          </div>
        </section>

        {/* ── Section 3 : Import Multi-Formats ─────────────────────────── */}
        <section className="bg-white py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-6 fade-up">
            <div className="mb-10">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-[#DBEAFE] text-blue-600 mb-6">
                Import Multi-Formats
              </span>
              <h2 className="font-serif text-3xl md:text-5xl leading-tight text-slate-900 mb-2">
                Tous vos relevés,
              </h2>
              <p className="font-serif text-3xl md:text-5xl leading-tight text-slate-900">
                en quelques secondes.
              </p>
            </div>
            <p className="text-text-muted text-lg leading-relaxed max-w-2xl mb-10">
              Téléchargez votre relevé depuis votre espace bancaire en ligne et
              importez-le dans TrackMyCash. Nous supportons les formats CSV,
              XLSX et PDF des principales banques.
            </p>
            <FeatureGrid points={IMPORT_POINTS} />
          </div>
        </section>

        {/* ── Et bien plus encore ──────────────────────────────────────── */}
        <section className="bg-white py-24 md:py-32">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16 fade-up">
              <h3 className="font-serif text-3xl md:text-4xl text-slate-900 mb-4">
                Et bien plus encore
              </h3>
              <p className="text-text-muted text-lg">
                Tout ce dont vous avez besoin pour maîtriser votre budget.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {MORE_FEATURES.map((f) => (
                <div
                  key={f.num}
                  className="fade-up hover-lift rounded-2xl border border-border-light bg-white p-6 transition-all"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-sm font-bold mb-5">
                    {f.num}
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">
                    {f.title}
                  </h4>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 pb-24 md:pb-32">
          <div className="bg-primary rounded-3xl p-12 md:p-20 text-center fade-up">
            <h2 className="font-serif text-3xl md:text-5xl text-white mb-8 tracking-tight">
              Convaincu(e)&nbsp;?
            </h2>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center bg-white text-primary font-bold py-4 px-10 rounded-2xl hover:bg-slate-50 transition-colors text-lg shadow-lg"
            >
              Commencer gratuitement
            </Link>
          </div>
        </section>
      </div>
    </ScrollRevealSection>
  );
}
