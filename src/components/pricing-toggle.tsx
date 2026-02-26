"use client";

import { useState } from "react";

type BillingCycle = "mensuel" | "annuel";

type PricingToggleProps = {
  defaultCycle?: BillingCycle;
};

export function PricingToggle({ defaultCycle = "mensuel" }: PricingToggleProps) {
  const [cycle, setCycle] = useState<BillingCycle>(defaultCycle);

  return (
    <div className="flex flex-col items-center gap-4 mb-12">
      <div className="p-1.5 bg-slate-200/50 rounded-2xl flex items-center w-full max-w-xs border border-slate-200/50">
        <button
          onClick={() => setCycle("mensuel")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
            cycle === "mensuel"
              ? "bg-white shadow-sm text-primary"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Mensuel
        </button>
        <button
          onClick={() => setCycle("annuel")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
            cycle === "annuel"
              ? "bg-white shadow-sm text-primary"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Annuel
        </button>
      </div>
      {/* AC-2 : badge Économisez 20% en annuel avec icône auto_awesome */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold uppercase tracking-wider">
        <span
          className="material-symbols-outlined text-sm"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
        Économisez 20% en annuel
      </span>
    </div>
  );
}
