"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getAIForecastInsightsAction } from "@/app/actions/forecast-actions";
import type { CategoryForecast } from "@/lib/forecasting";

type Props = {
  forecasts: CategoryForecast[];
  canUseAI: boolean;
};

export function AIForecastInsights({ forecasts, canUseAI }: Props) {
  const [insights, setInsights] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  if (!canUseAI) return null;

  function handleGenerate() {
    startTransition(async () => {
      const result = await getAIForecastInsightsAction(forecasts);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setInsights(result.insights);
    });
  }

  return (
    <div className="space-y-3">
      {insights.length === 0 ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={isPending}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isPending ? "Génération en cours..." : "Générer des insights IA"}
        </Button>
      ) : (
        <ul className="space-y-2">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
