"use client";

import { useState } from "react";
import Link from "next/link";
import type { UpgradeReason } from "@/hooks/use-upgrade-modal";
import { UPGRADE_CONFIGS } from "@/hooks/use-upgrade-modal";
import { PLANS } from "@/lib/stripe-plans";

type UpgradeModalProps = {
  reason: UpgradeReason | null;
  onClose: () => void;
};

export function UpgradeModal({ reason, onClose }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  if (!reason) return null;

  const config = UPGRADE_CONFIGS[reason];
  const plan = PLANS[config.targetPlan];

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: config.targetPlan }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full flex flex-col gap-5 shadow-xl">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}
            >
              lock_open
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="text-text-muted hover:text-text-main"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Titre + description */}
        <div>
          <h2 className="text-xl font-extrabold text-text-main">{config.title}</h2>
          <p className="text-text-muted text-sm mt-1">{config.description}</p>
        </div>

        {/* Plan cible */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-text-main">{plan.name}</span>
            <span className="font-extrabold text-primary text-lg">
              {plan.price}€<span className="text-sm font-normal">/mois</span>
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {config.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-text-main">
                <span
                  className="material-symbols-outlined text-success text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Passer au plan {plan.name}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
          <Link
            href="/tarifs"
            onClick={onClose}
            className="text-center text-primary text-sm font-medium hover:underline"
          >
            Voir tous les tarifs →
          </Link>
        </div>
      </div>
    </div>
  );
}
