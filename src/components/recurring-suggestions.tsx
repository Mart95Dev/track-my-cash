"use client";

import { useState } from "react";
import type { RecurringSuggestion } from "@/lib/recurring-detector";
import {
  createRecurringFromSuggestionAction,
} from "@/app/actions/recurring-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, X } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface RecurringSuggestionsProps {
  suggestions: RecurringSuggestion[];
  accountId: number;
}

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Hebdo.",
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  yearly: "Annuel",
};

export function RecurringSuggestions({ suggestions: initial, accountId }: RecurringSuggestionsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  const visible = initial.filter((s) => !dismissed.has(s.normalizedName));

  if (visible.length === 0) return null;

  const handleCreate = async (suggestion: RecurringSuggestion) => {
    setLoading(suggestion.normalizedName);
    await createRecurringFromSuggestionAction(accountId, {
      displayName: suggestion.displayName,
      type: suggestion.type,
      avgAmount: suggestion.avgAmount,
      frequency: suggestion.frequency,
      nextDate: suggestion.nextDate,
      category: suggestion.category,
    });
    setDismissed((prev) => new Set([...prev, suggestion.normalizedName]));
    setLoading(null);
  };

  const handleDismiss = (normalizedName: string) => {
    setDismissed((prev) => new Set([...prev, normalizedName]));
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Paiements récurrents détectés ({visible.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visible.map((s) => (
            <div
              key={s.normalizedName}
              className="flex items-center justify-between gap-4 py-2 border-b last:border-0"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{s.displayName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {FREQUENCY_LABELS[s.frequency] ?? s.frequency}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {s.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {s.occurrences} occurrences
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`font-bold text-sm ${
                    s.type === "income" ? "text-income" : "text-expense"
                  }`}
                >
                  {s.type === "income" ? "+" : "-"}
                  {formatCurrency(s.avgAmount, "EUR", "fr")}
                </span>
                <Button
                  size="sm"
                  variant="default"
                  disabled={loading === s.normalizedName}
                  onClick={() => handleCreate(s)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Créer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(s.normalizedName)}
                  aria-label="Ignorer"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
