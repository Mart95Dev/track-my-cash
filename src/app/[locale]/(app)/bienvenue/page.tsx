import type { Metadata } from "next";
import Link from "next/link";
import { PLANS } from "@/lib/stripe-plans";
import type { PlanId } from "@/lib/stripe-plans";
import { getSession } from "@/lib/auth-utils";

export const metadata: Metadata = {
  title: "Bienvenue — TrackMyCash",
  description: "Votre abonnement est actif. Commencez à suivre vos finances.",
};

type Props = {
  searchParams: Promise<{ plan?: string }>;
};

export default async function BienvenueePage({ searchParams }: Props) {
  const { plan } = await searchParams;
  const planId = (plan && plan in PLANS ? plan : "pro") as PlanId;
  const planData = PLANS[planId];

  // Session optionnelle — ne bloque pas si absent (redirect Stripe possible sans session)
  let userName = "";
  try {
    const session = await getSession();
    userName = session?.user?.name ?? "";
  } catch {
    // Page accessible sans session
  }

  const actions = [
    { href: "/transactions", icon: "upload_file", label: "Importer mes transactions" },
    { href: "/conseiller",   icon: "smart_toy",   label: "Essayer le Conseiller IA" },
    { href: "/dashboard",    icon: "space_dashboard", label: "Voir mon dashboard" },
  ];

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-8">

        {/* Icône succès */}
        <div className="flex items-center justify-center size-24 rounded-full bg-success/10">
          <span
            className="material-symbols-outlined text-success"
            style={{ fontSize: "56px", fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>

        {/* Titre */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
            {userName ? `Bienvenue, ${userName} !` : "Paiement confirmé !"}
          </h1>
          <p className="text-text-muted text-base mt-2">
            Votre abonnement{" "}
            <span className="font-bold text-text-main">{planData.name}</span>{" "}
            est actif.
          </p>
        </div>

        {/* Features débloquées */}
        <div className="w-full bg-white rounded-2xl p-5 flex flex-col gap-4 border border-slate-100 shadow-soft">
          <p className="text-xs uppercase tracking-widest font-bold text-text-muted">
            Ce que vous venez de débloquer
          </p>
          <ul className="flex flex-col gap-3">
            {planData.features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-text-main">
                <span
                  className="material-symbols-outlined text-primary text-[18px] shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest font-bold text-text-muted text-center">
            Par où commencer ?
          </p>
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="w-full bg-white border border-slate-200 hover:border-primary/30 hover:bg-primary/5 rounded-xl px-4 py-3.5 flex items-center gap-3 text-text-main font-medium transition-colors"
            >
              <span
                className="material-symbols-outlined text-primary text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {action.icon}
              </span>
              {action.label}
              <span className="material-symbols-outlined text-text-muted text-[18px] ml-auto">
                chevron_right
              </span>
            </Link>
          ))}
        </div>

        {/* Lien discret gestion abonnement */}
        <Link
          href="/parametres?tab=billing"
          className="text-text-muted text-sm hover:text-text-main transition-colors"
        >
          Gérer mon abonnement →
        </Link>
      </div>
    </div>
  );
}
