"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { upsertBudgetAction } from "@/app/actions/budget-actions";
import type { BudgetSuggestion } from "@/lib/budget-suggester";

interface BudgetSuggestionsProps {
  suggestions: BudgetSuggestion[];
  accountId: number;
}

const CONFIDENCE_CONFIG: Record<
  BudgetSuggestion["confidence"],
  { label: string; badgeClass: string }
> = {
  high: { label: "Fiable", badgeClass: "bg-success/10 text-success" },
  medium: { label: "Modéré", badgeClass: "bg-warning/10 text-warning" },
  low: { label: "Variable", badgeClass: "bg-gray-100 text-text-muted" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

export function BudgetSuggestions({ suggestions, accountId }: BudgetSuggestionsProps) {
  const [created, setCreated] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  if (suggestions.length === 0) return null;

  async function handleCreate(s: BudgetSuggestion) {
    setLoading(s.category);
    await upsertBudgetAction(accountId, s.category, s.suggestedLimit, "monthly");
    setCreated((prev) => new Set([...prev, s.category]));
    setLoading(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-text-muted mb-1">
        Basées sur vos dépenses des 3 derniers mois.
      </p>
      {suggestions.map((s) => {
        const conf = CONFIDENCE_CONFIG[s.confidence];
        const isDone = created.has(s.category);
        return (
          <div
            key={s.category}
            className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-background-light p-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-text-main">{s.category}</p>
                <p className="text-xs text-text-muted">
                  Moy. {fmt(s.avgAmount)}/mois
                </p>
              </div>
              <span className={`text-xs font-bold rounded-full px-2.5 py-0.5 ${conf.badgeClass}`}>
                {conf.label}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-bold text-sm text-text-main">{fmt(s.suggestedLimit)}</span>
              <Button
                size="sm"
                variant={isDone ? "secondary" : "default"}
                disabled={isDone || loading === s.category}
                onClick={() => handleCreate(s)}
                className={isDone ? "" : "bg-primary text-white text-xs font-bold rounded-full px-3 h-7"}
              >
                {isDone ? "Créé ✓" : loading === s.category ? "…" : "Créer"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
