export type PlanId = "free" | "pro" | "premium";
export type BillingCycle = "mensuel" | "annuel";

/** Pourcentage de remise appliqué au plan annuel */
export const ANNUAL_DISCOUNT = 0.15;

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // EUR/mois
  annualPrice: number; // EUR/an (avec remise)
  stripePriceId: string | null; // null pour free
  annualStripePriceId: string | null; // null pour free
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
    annualPrice: 0,
    stripePriceId: null,
    annualStripePriceId: null,
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
    price: 5.9,
    annualPrice: 59.97, // 4,99€/mois — prix psychologique
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO ?? "",
    annualStripePriceId: process.env.STRIPE_PRICE_ID_PRO_ANNUAL ?? "",
    features: [
      "5 comptes bancaires",
      "Import PDF, Excel & CSV",
      "Conseiller IA (50 req/mois)",
      "Partage couple (transactions partagées)",
      "Multi-devises",
      "Export CSV & rapports mensuels",
    ],
    limits: { maxAccounts: 5, ai: true },
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 8.9,
    annualPrice: 89.67, // 7,47€/mois — prix psychologique
    stripePriceId: process.env.STRIPE_PRICE_ID_PREMIUM ?? "",
    annualStripePriceId: process.env.STRIPE_PRICE_ID_PREMIUM_ANNUAL ?? "",
    features: [
      "Comptes illimités",
      "Conseiller IA illimité & prioritaire",
      "Objectifs intelligents IA",
      "IA conseiller couple illimitée",
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
