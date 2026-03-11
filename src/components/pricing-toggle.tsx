"use client";

import { useState } from "react";
import type { BillingCycle } from "@/lib/stripe-plans";
import { ANNUAL_DISCOUNT } from "@/lib/stripe-plans";

type PricingToggleProps = {
  defaultCycle?: BillingCycle;
  onCycleChange?: (cycle: BillingCycle) => void;
};

export function PricingToggle({ defaultCycle = "mensuel", onCycleChange }: PricingToggleProps) {
  const [cycle, setCycle] = useState<BillingCycle>(defaultCycle);

  function handleChange(newCycle: BillingCycle) {
    setCycle(newCycle);
    onCycleChange?.(newCycle);
  }

  const discountPercent = Math.round(ANNUAL_DISCOUNT * 100);

  return (
    <div className="flex flex-col items-center gap-4 mb-12">
      <div className="p-1.5 bg-slate-200/50 rounded-2xl flex items-center w-full max-w-xs border border-slate-200/50">
        <button
          onClick={() => handleChange("mensuel")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
            cycle === "mensuel"
              ? "bg-white shadow-sm text-primary"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Mensuel
        </button>
        <button
          onClick={() => handleChange("annuel")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
            cycle === "annuel"
              ? "bg-white shadow-sm text-primary"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Annuel
        </button>
      </div>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold uppercase tracking-wider">
        <span
          className="material-symbols-outlined text-sm"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
        Économisez {discountPercent}% en annuel
      </span>
    </div>
  );
}
