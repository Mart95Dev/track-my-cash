import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { SubscribeButton } from "@/components/subscribe-button";
import { getSession } from "@/lib/auth-utils";
import { getUserPlanId } from "@/lib/subscription-utils";
import { PLANS } from "@/lib/stripe-plans";
import type { PlanId } from "@/lib/stripe-plans";

export const metadata: Metadata = {
  title: "Tarifs — TrackMyCash",
  description:
    "Découvrez nos plans gratuit, Pro et Premium. Commencez gratuitement, évoluez selon vos besoins.",
  openGraph: {
    title: "Tarifs — TrackMyCash",
    description:
      "Découvrez nos plans gratuit, Pro et Premium. Commencez gratuitement, évoluez selon vos besoins.",
    type: "website",
  },
};

type FeatureRow = {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  premium: string | boolean;
};

const COMPARISON_FEATURES: FeatureRow[] = [
  { label: "Comptes bancaires",      free: "1",       pro: "∞",          premium: "∞" },
  { label: "Historique",             free: "3 mois",  pro: "∞",          premium: "∞" },
  { label: "Import CSV/XLSX/PDF",    free: "Basique", pro: "Complet",    premium: "Complet" },
  { label: "Catégorisation auto IA", free: false,     pro: true,         premium: true },
  { label: "Export CSV",             free: false,     pro: true,         premium: true },
  { label: "Conseiller IA",          free: false,     pro: "10/mois",    premium: "Illimité" },
  { label: "IA multi-modèles",       free: false,     pro: false,        premium: true },
  { label: "Export PDF mensuel",     free: false,     pro: true,         premium: true },
  { label: "Objectifs d'épargne",    free: false,     pro: true,         premium: true },
  { label: "Email récap hebdo",      free: false,     pro: true,         premium: true },
  { label: "Rapport annuel IA",      free: false,     pro: false,        premium: true },
  { label: "Support prioritaire",    free: false,     pro: false,        premium: true },
];

function FeatureCell({ value }: { value: string | boolean }) {
  if (value === false) {
    return (
      <span
        className="material-symbols-outlined text-slate-300"
        style={{ fontSize: "20px" }}
        aria-label="Non inclus"
      >
        cancel
      </span>
    );
  }
  if (value === true) {
    return (
      <span
        className="material-symbols-outlined text-primary"
        style={{ fontSize: "20px" }}
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
  const priceStr =
    plan.price === 0
      ? "0€"
      : `${plan.price.toString().replace(".", ",")}€`;

  const cardButton = isCurrentPlan ? (
    <button
      disabled
      className="w-full flex items-center justify-center h-10 bg-primary/10 text-primary font-bold rounded-xl text-sm cursor-not-allowed"
    >
      Plan actuel
    </button>
  ) : planId === "free" ? (
    <Link
      href="/inscription"
      className="w-full flex items-center justify-center h-10 border-2 border-slate-200 text-text-main font-bold rounded-xl hover:border-primary hover:text-primary transition-colors text-sm"
    >
      Démarrer
    </Link>
  ) : (
    <SubscribeButton planId={planId} label={planId === "pro" ? "Choisir Pro" : "Choisir Premium"} />
  );

  if (isHighlighted) {
    return (
      <div className="relative p-6 bg-white rounded-2xl border-2 border-primary shadow-xl shadow-primary/10">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
          Populaire
        </div>
        {isCurrentPlan && (
          <div className="absolute -top-3 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
            Plan actuel
          </div>
        )}
        <h2 className="font-bold text-primary text-xl mb-1">{plan.name}</h2>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-4xl font-extrabold text-text-main">{priceStr}</span>
          <span className="text-text-muted">/mois</span>
        </div>
        {cardButton}
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-soft">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-bold text-text-main text-xl">{plan.name}</h2>
        {isCurrentPlan && (
          <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full">
            Plan actuel
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-extrabold text-text-main">{priceStr}</span>
        <span className="text-text-muted">/mois</span>
      </div>
      {cardButton}
    </div>
  );
}

export default async function TarifsPage() {
  const session = await getSession();
  const currentPlanId: string | null = session
    ? await getUserPlanId(session.user.id)
    : null;

  const planIds: PlanId[] = ["free", "pro", "premium"];

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-text-main mb-3">
            Tarifs simples et transparents
          </h1>
          <p className="text-text-muted text-lg">
            Commencez gratuitement. Pas de carte bleue requise.
          </p>
        </div>

        {/* 3 plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 items-start">
          {planIds.map((planId) => (
            <PlanCard
              key={planId}
              planId={planId}
              isHighlighted={planId === "pro"}
              isCurrentPlan={currentPlanId === planId}
            />
          ))}
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-bold text-text-main">Comparaison détaillée</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-4 text-sm font-semibold text-text-muted">
                    Fonctionnalité
                  </th>
                  <th className="text-center p-4 text-sm font-semibold text-text-muted">
                    Gratuit
                  </th>
                  <th className="text-center p-4 text-sm font-semibold text-primary">
                    Pro
                  </th>
                  <th className="text-center p-4 text-sm font-semibold text-text-muted">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON_FEATURES.map((row) => (
                  <tr key={row.label} className="hover:bg-slate-50/50">
                    <td className="p-4 text-sm text-text-main font-medium">
                      {row.label}
                    </td>
                    <td className="p-4 text-center">
                      <FeatureCell value={row.free} />
                    </td>
                    <td className="p-4 text-center">
                      <FeatureCell value={row.pro} />
                    </td>
                    <td className="p-4 text-center">
                      <FeatureCell value={row.premium} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-sm text-text-muted mt-8">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-primary hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
