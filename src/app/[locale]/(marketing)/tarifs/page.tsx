import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { SubscribeButton } from "@/components/subscribe-button";
import { getSession } from "@/lib/auth-utils";
import { getUserPlanId } from "@/lib/subscription-utils";
import { PLANS } from "@/lib/stripe-plans";
import type { PlanId } from "@/lib/stripe-plans";
import { PricingToggle } from "@/components/pricing-toggle";
import { ScrollRevealSection } from "@/components/marketing/scroll-reveal";
import { FaqAccordion } from "./faq-accordion";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { faqPageSchema, breadcrumbSchema } from "@/lib/seo/schemas";
import { SEO_CONFIG } from "@/lib/seo/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    title: "Tarifs — Koupli",
    description:
      "Un abonnement pour deux. Découvrez nos plans gratuit, Pro et Premium pour la gestion financière de couple.",
    path: "tarifs",
    locale,
    ogImage: "/og/tarifs.png",
  });
}

type FeatureRow = {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  premium: string | boolean;
};

export const COMPARISON_FEATURES: FeatureRow[] = [
  { label: "Comptes bancaires",      free: "1",       pro: "∞",          premium: "∞" },
  { label: "Historique",             free: "3 mois",  pro: "∞",          premium: "∞" },
  { label: "Import CSV/XLSX/PDF",    free: "Basique", pro: "Complet",    premium: "Complet" },
  { label: "Catégorisation auto IA", free: false,     pro: true,         premium: true },
  { label: "Export CSV",             free: false,     pro: true,         premium: true },
  { label: "Conseiller IA",          free: false,     pro: "10/mois",    premium: "Illimité" },
  { label: "IA multi-modèles",       free: false,     pro: false,        premium: true },
  { label: "Partage couple",         free: false,     pro: true,         premium: true },
  { label: "IA conseiller couple",   free: false,     pro: false,        premium: true },
  { label: "Export PDF mensuel",     free: false,     pro: true,         premium: true },
  { label: "Objectifs d'épargne",    free: false,     pro: true,         premium: true },
  { label: "Email récap hebdo",      free: false,     pro: true,         premium: true },
  { label: "Rapport annuel IA",      free: false,     pro: false,        premium: true },
  { label: "Support prioritaire",    free: false,     pro: false,        premium: true },
];

export const FAQ_ITEMS = [
  {
    question: "Mon partenaire doit-il payer aussi ?",
    answer:
      "Non. Un seul abonnement Pro ou Premium suffit pour les deux. Le propriétaire du couple paie, et son partenaire bénéficie de toutes les fonctionnalités couple automatiquement.",
  },
  {
    question: "Puis-je tester l'espace couple gratuitement ?",
    answer:
      "Oui ! À l'inscription, vous bénéficiez de 14 jours d'essai Pro gratuit. Vous pouvez inviter votre partenaire et tester toutes les fonctionnalités couple sans engagement.",
  },
  {
    question: "Que se passe-t-il si on se sépare ?",
    answer:
      "Chacun garde son compte personnel et ses données privées. Seules les données de l'espace couple partagé sont concernées. Vous pouvez quitter l'espace couple à tout moment.",
  },
  {
    question: "Mon partenaire peut-il voir mes dépenses perso ?",
    answer:
      "Non. Vos comptes et transactions personnels restent strictement privés. Seuls les comptes et transactions marqués comme « partagés » sont visibles par votre partenaire.",
  },
];

function FeatureCell({ value }: { value: string | boolean }) {
  if (value === false) {
    return (
      <span
        className="material-symbols-outlined text-slate-300"
        style={{ fontSize: "20px", fontVariationSettings: "'FILL' 0" }}
        aria-label="Non inclus"
      >
        remove
      </span>
    );
  }
  if (value === true) {
    return (
      <span
        className="material-symbols-outlined text-success"
        style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}
        aria-label="Inclus"
      >
        check_circle
      </span>
    );
  }
  return <span className="text-sm font-medium text-text-main">{value}</span>;
}

type PlanCardProps = {
  planId: PlanId;
  isHighlighted: boolean;
  isCurrentPlan: boolean;
};

function PlanCard({ planId, isHighlighted, isCurrentPlan }: PlanCardProps) {
  const plan = PLANS[planId];
  const priceWhole =
    plan.price === 0 ? "0" : plan.price.toFixed(2).replace(".", ",");

  const cardButton = isCurrentPlan ? (
    <button
      disabled
      className="w-full py-4 px-6 rounded-2xl bg-primary/10 text-primary font-bold cursor-not-allowed"
    >
      Plan actuel
    </button>
  ) : planId === "free" ? (
    <Link
      href="/inscription"
      className="w-full flex items-center justify-center py-4 px-6 rounded-2xl border-2 border-slate-200 text-text-main font-bold hover:border-primary hover:text-primary transition-colors"
    >
      Commencer
    </Link>
  ) : (
    <SubscribeButton
      planId={planId}
      label={planId === "pro" ? "Choisir Pro" : "Choisir Premium"}
    />
  );

  if (isHighlighted) {
    return (
      <div
        className="fade-up hover-lift relative bg-white rounded-3xl p-9 border-2 border-primary shadow-xl shadow-primary/10 flex flex-col h-full"
        style={{ transform: "scale(1.03)" }}
      >
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider px-5 py-1.5 rounded-full">
          Populaire
        </div>
        <div className="mb-6 pt-2">
          <h2 className="text-lg font-bold text-primary">{plan.name}</h2>
          <p className="text-slate-500 text-sm mb-4">Pour votre couple</p>
          <div className="flex items-baseline">
            <span className="font-serif text-5xl font-black tracking-tight text-slate-900">
              {priceWhole}
            </span>
            <span className="text-text-muted text-base font-medium ml-1">
              &euro;/mois
            </span>
          </div>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
              <span
                className="material-symbols-outlined text-success text-[20px] shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check
              </span>
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          {cardButton}
          <p className="text-center text-[11px] text-primary/80 mt-3 font-semibold">
            1 abonnement = 2 personnes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up hover-lift flex flex-col bg-white rounded-3xl p-9 border border-slate-200 shadow-sm h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-text-main">{plan.name}</h2>
          {isCurrentPlan && (
            <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full">
              Plan actuel
            </span>
          )}
        </div>
        <p className="text-text-muted text-sm mb-4">
          {planId === "free" ? "Pour découvrir" : "L'expérience complète"}
        </p>
        <div className="flex items-baseline">
          <span className="font-serif text-5xl font-black tracking-tight">
            {priceWhole}
          </span>
          <span className="text-text-muted text-base font-medium ml-1">
            &euro;/mois
          </span>
        </div>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
            <span
              className="material-symbols-outlined text-success text-[20px] shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check
            </span>
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        {cardButton}
        <p className="text-center text-[11px] text-text-muted mt-3">
          {planId === "free" ? "Aucune carte requise" : "1 abonnement = 2 personnes"}
        </p>
      </div>
    </div>
  );
}

export default async function TarifsPage() {
  let currentPlanId: string | null = null;
  try {
    const session = await getSession();
    if (session) {
      currentPlanId = await getUserPlanId(session.user.id);
    }
  } catch {
    // BetterAuth non disponible (env non configuré) — page reste accessible sans plan actuel
  }

  const planIds: PlanId[] = ["free", "pro", "premium"];

  const baseUrl = SEO_CONFIG.baseUrl;

  return (
    <ScrollRevealSection>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema(FAQ_ITEMS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Accueil", url: `${baseUrl}/fr` },
              { name: "Tarifs", url: `${baseUrl}/fr/tarifs` },
            ])
          ),
        }}
      />
      <div className="bg-[#f6f6f8] min-h-screen">
        <div className="max-w-5xl mx-auto px-6 pb-24">
          {/* Hero */}
          <div className="fade-up pt-12 md:pt-20 pb-8 text-center">
            <h1 className="font-serif text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
              Un abonnement, <em className="text-primary not-italic italic">deux personnes</em>
            </h1>
            <p className="text-text-muted text-lg max-w-md mx-auto">
              Choisissez le plan qui correspond à votre couple. Changez ou annulez à tout moment.
            </p>
          </div>

          {/* Toggle mensuel / annuel */}
          <div className="fade-up">
            <PricingToggle />
          </div>

          {/* 3 plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 items-stretch">
            {planIds.map((planId) => (
              <PlanCard
                key={planId}
                planId={planId}
                isHighlighted={planId === "pro"}
                isCurrentPlan={currentPlanId === planId}
              />
            ))}
          </div>

          {/* Tableau comparatif */}
          <section className="fade-up">
            <h3 className="font-serif text-2xl md:text-3xl font-extrabold mb-8 text-center">
              Comparatif détaillé
            </h3>
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-text-muted w-1/3">
                      Fonctionnalité
                    </th>
                    <th className="py-5 px-4 text-center text-xs font-bold uppercase tracking-wider text-text-muted w-1/5">
                      Gratuit
                    </th>
                    <th className="py-5 px-4 text-center text-xs font-bold uppercase tracking-wider text-primary w-1/5">
                      Pro
                    </th>
                    <th className="py-5 px-4 text-center text-xs font-bold uppercase tracking-wider text-text-muted w-1/5">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPARISON_FEATURES.map((row) => (
                    <tr key={row.label} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium text-slate-700">
                        {row.label}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <FeatureCell value={row.free} />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <FeatureCell value={row.pro} />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <FeatureCell value={row.premium} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ couple */}
          <section className="fade-up mt-16 bg-white rounded-3xl p-8 md:p-12 border border-slate-200">
            <h3 className="font-serif text-2xl md:text-3xl font-extrabold mb-8 text-center">
              Questions fréquentes
            </h3>
            <div className="max-w-2xl mx-auto">
              <FaqAccordion items={FAQ_ITEMS} />
            </div>
          </section>

          <p className="fade-up text-center text-sm text-text-muted mt-12">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="text-primary hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </ScrollRevealSection>
  );
}
