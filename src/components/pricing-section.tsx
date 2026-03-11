"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { PLANS, ANNUAL_DISCOUNT } from "@/lib/stripe-plans";
import type { PlanId, BillingCycle } from "@/lib/stripe-plans";
import { PricingToggle } from "@/components/pricing-toggle";
import { SubscribeButton } from "@/components/subscribe-button";

type PricingSectionProps = {
  currentPlanId: string | null;
};

function PlanCard({
  planId,
  billingCycle,
  isHighlighted,
  isCurrentPlan,
}: {
  planId: PlanId;
  billingCycle: BillingCycle;
  isHighlighted: boolean;
  isCurrentPlan: boolean;
}) {
  const plan = PLANS[planId];
  const isAnnual = billingCycle === "annuel";

  // Prix affiché : mensuel ou mensuel équivalent annuel
  const displayPrice = isAnnual && plan.annualPrice > 0
    ? (plan.annualPrice / 12)
    : plan.price;
  const priceWhole = displayPrice === 0
    ? "0"
    : displayPrice.toFixed(2).replace(".", ",");

  // Prix annuel total pour le badge
  const annualTotal = plan.annualPrice > 0
    ? plan.annualPrice.toFixed(2).replace(".", ",")
    : null;

  // Économie annuelle
  const monthlySavings = plan.price > 0 && isAnnual
    ? (plan.price - displayPrice).toFixed(2).replace(".", ",")
    : null;

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
      billingCycle={billingCycle}
      label={planId === "pro" ? "Choisir Pro" : "Choisir Premium"}
    />
  );

  const priceBlock = (
    <>
      <div className="flex items-baseline">
        <span className={`font-serif text-5xl font-black tracking-tight ${isHighlighted ? "text-slate-900" : ""}`}>
          {priceWhole}
        </span>
        <span className="text-text-muted text-base font-medium ml-1">
          &euro;/mois
        </span>
      </div>
      {isAnnual && annualTotal && (
        <p className="text-xs text-text-muted mt-1">
          Facturé {annualTotal}&euro;/an
        </p>
      )}
      {isAnnual && monthlySavings && (
        <p className="text-xs text-success font-semibold mt-0.5">
          -{monthlySavings}&euro;/mois vs mensuel
        </p>
      )}
    </>
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
          {priceBlock}
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
        {priceBlock}
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

export function PricingSection({ currentPlanId }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("mensuel");
  const planIds: PlanId[] = ["free", "pro", "premium"];

  return (
    <>
      <div className="fade-up">
        <PricingToggle onCycleChange={setBillingCycle} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 items-stretch">
        {planIds.map((planId) => (
          <PlanCard
            key={planId}
            planId={planId}
            billingCycle={billingCycle}
            isHighlighted={planId === "pro"}
            isCurrentPlan={currentPlanId === planId}
          />
        ))}
      </div>
    </>
  );
}
