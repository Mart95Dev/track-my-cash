export type PlanId = "free" | "pro" | "premium";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // EUR/mois
  stripePriceId: string | null; // null pour free
  features: string[];
  limits: {
    maxAccounts: number; // -1 = illimité
    ai: boolean;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Gratuit",
    price: 0,
    stripePriceId: null,
    features: [
      "2 comptes bancaires",
      "Import CSV uniquement",
      "Transactions illimitées",
      "Budgets & objectifs",
      "Résumé mensuel basique",
    ],
    limits: { maxAccounts: 2, ai: false },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 4.9,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO ?? "",
    features: [
      "5 comptes bancaires",
      "Import PDF, Excel & CSV",
      "Conseiller IA (10 req/mois)",
      "Multi-devises",
      "Export CSV & rapports mensuels",
    ],
    limits: { maxAccounts: 5, ai: true },
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 7.9,
    stripePriceId: process.env.STRIPE_PRICE_ID_PREMIUM ?? "",
    features: [
      "Comptes illimités",
      "Conseiller IA illimité & prioritaire",
      "Export PDF rapport mensuel",
      "Rapport annuel IA",
      "Support prioritaire",
    ],
    limits: { maxAccounts: -1, ai: true },
  },
};

export function getPlan(planId: string): Plan {
  return PLANS[planId as PlanId] ?? PLANS.free;
}
