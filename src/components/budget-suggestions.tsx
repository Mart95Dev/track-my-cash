"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { upsertBudgetAction } from "@/app/actions/budget-actions";
import type { BudgetSuggestion } from "@/lib/budget-suggester";

interface BudgetSuggestionsProps {
  suggestions: BudgetSuggestion[];
  accountId: number;
}

const CONFIDENCE_CONFIG: Record<
  BudgetSuggestion["confidence"],
  { label: string; className: string }
> = {
  high: { label: "Fiable", className: "border-income/40 text-income" },
  medium: { label: "Modéré", className: "border-warning/40 text-warning" },
  low: { label: "Variable", className: "border-muted-foreground/40 text-muted-foreground" },
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-warning" />
          Suggestions de budgets
          <Badge variant="secondary">{suggestions.length}</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Basées sur vos dépenses des 3 derniers mois. Cliquez sur &quot;Créer&quot; pour adopter une suggestion.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {suggestions.map((s) => {
            const conf = CONFIDENCE_CONFIG[s.confidence];
            const isDone = created.has(s.category);
            return (
              <div
                key={s.category}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{s.category}</p>
                    <p className="text-xs text-muted-foreground">
                      Moy. {fmt(s.avgAmount)}/mois
                    </p>
                  </div>
                  <Badge variant="outline" className={conf.className}>
                    {conf.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-sm">{fmt(s.suggestedLimit)}</span>
                  <Button
                    size="sm"
                    variant={isDone ? "secondary" : "default"}
                    disabled={isDone || loading === s.category}
                    onClick={() => handleCreate(s)}
                  >
                    {isDone ? "Créé ✓" : loading === s.category ? "…" : "Créer"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
