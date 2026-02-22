import type { JSX } from "react";
import Link from "next/link";

type PlanBannerProps = {
  plan: "free" | "pro" | "premium";
  status?: "inactive" | "active" | "trialing" | "canceled" | "expired";
  daysRemaining?: number;
};

export function PlanBanner({
  plan,
  status,
  daysRemaining,
}: PlanBannerProps): JSX.Element | null {
  // AC-3 : bannière orange pour les essais en cours
  if (status === "trialing") {
    const days = daysRemaining ?? 0;
    return (
      <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <p className="text-sm text-orange-800">
            <span className="font-semibold">Essai Pro</span> —{" "}
            {days > 0
              ? `${days} jour${days > 1 ? "s" : ""} restant${days > 1 ? "s" : ""}`
              : "Dernier jour"}
          </p>
          <Link
            href="/tarifs"
            className="text-sm font-semibold text-orange-900 underline hover:no-underline shrink-0"
          >
            Souscrire
          </Link>
        </div>
      </div>
    );
  }

  // AC-2 : bannière bleue pour les utilisateurs Free
  if (plan === "free") {
    return (
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Passez Pro</span> — Débloquez le
            conseiller IA, l&apos;import PDF/Excel et les rapports mensuels.
          </p>
          <Link
            href="/tarifs"
            className="text-sm font-semibold text-blue-900 underline hover:no-underline shrink-0"
          >
            Voir les tarifs
          </Link>
        </div>
      </div>
    );
  }

  // AC-4 : Pro actif ou Premium → aucune bannière
  return null;
}
