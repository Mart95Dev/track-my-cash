"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { getSmartGoalSuggestionsAction, type GoalSuggestion } from "@/app/actions/goal-suggestion-actions";
import { createGoalAction } from "@/app/actions/goals-actions";

export function SmartGoalsWidget({ isPremium }: { isPremium: boolean }) {
  const [suggestions, setSuggestions] = useState<GoalSuggestion[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [creatingId, setCreatingId] = useState<string | null>(null);

  function handleGenerate() {
    startTransition(async () => {
      const result = await getSmartGoalSuggestionsAction();
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setSuggestions(result.suggestions);
      }
    });
  }

  function handleCreate(suggestion: GoalSuggestion) {
    setCreatingId(suggestion.name);
    startTransition(async () => {
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + suggestion.timelineMonths);
      const result = await createGoalAction(
        suggestion.name,
        suggestion.suggestedTarget,
        0,
        "EUR",
        deadline.toISOString().slice(0, 10),
        undefined,
        suggestion.monthlyContribution
      );
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(`Objectif "${suggestion.name}" créé`);
        setSuggestions((prev) =>
          prev ? prev.filter((s) => s.name !== suggestion.name) : null
        );
      }
      setCreatingId(null);
    });
  }

  // Banner upgrade pour non-Premium
  if (!isPremium) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[24px] mt-0.5">
          auto_awesome
        </span>
        <div>
          <p className="text-sm font-bold text-text-main">
            Objectifs intelligents IA
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            L&apos;IA analyse vos finances et propose des objectifs d&apos;épargne
            réalistes avec un plan pour les atteindre.
          </p>
          <p className="text-xs text-primary font-semibold mt-1.5">
            Disponible avec le plan Premium
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-slate-800 shadow-soft p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            auto_awesome
          </span>
          <h2 className="font-bold text-text-main">Objectifs intelligents IA</h2>
          <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
            Premium
          </span>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="text-xs font-semibold text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
        >
          {isPending && !suggestions
            ? "Analyse en cours..."
            : suggestions
              ? "Régénérer"
              : "Analyser mes finances"}
        </button>
      </div>

      {!suggestions && !isPending && (
        <p className="text-xs text-text-muted">
          Cliquez sur &quot;Analyser mes finances&quot; pour recevoir des
          suggestions d&apos;objectifs personnalisés basés sur vos habitudes.
        </p>
      )}

      {isPending && !suggestions && (
        <div className="flex items-center gap-2 py-4 justify-center">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-text-muted">
            Analyse de vos 3 derniers mois...
          </p>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-col gap-3">
          {suggestions.map((s) => (
            <div
              key={s.name}
              className="rounded-xl bg-background-light dark:bg-slate-800/50 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-main">{s.name}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-text-muted">
                      🎯 {s.suggestedTarget.toLocaleString("fr-FR")} €
                    </span>
                    <span className="text-xs text-text-muted">
                      📅 {s.timelineMonths} mois
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      {s.monthlyContribution.toLocaleString("fr-FR")} €/mois
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                    {s.rationale}
                  </p>
                </div>
                <button
                  onClick={() => handleCreate(s)}
                  disabled={isPending || creatingId === s.name}
                  className="shrink-0 mt-1 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {creatingId === s.name ? "..." : "Créer"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {suggestions && suggestions.length === 0 && (
        <p className="text-xs text-text-muted text-center py-3">
          Vous avez déjà créé tous les objectifs suggérés.
        </p>
      )}
    </div>
  );
}
