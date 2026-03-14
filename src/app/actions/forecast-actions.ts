"use server";

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { canUseAI } from "@/lib/subscription-utils";
import { incrementAiUsage } from "@/lib/ai-usage";
import type { CategoryForecast } from "@/lib/forecasting";

export async function getAIForecastInsightsAction(
  forecasts: CategoryForecast[]
): Promise<{ insights: string[] } | { error: string }> {
  const userId = await getRequiredUserId();

  const guard = await canUseAI(userId, "insights");
  if (!guard.allowed) {
    return { error: guard.reason ?? "Fonctionnalité réservée aux plans Pro/Premium" };
  }

  const apiKey = process.env.API_KEY_OPENROUTER;
  if (!apiKey) {
    return { error: "Service IA temporairement indisponible" };
  }

  if (forecasts.length === 0) {
    return { error: "Aucune donnée de prévision disponible" };
  }

  const summary = forecasts
    .map(
      (f) =>
        `${f.category}: moy ${f.avgAmount.toFixed(0)}€, dernier mois ${f.lastMonthAmount.toFixed(0)}€, tendance ${f.trend}, statut ${f.status}${f.budgetLimit ? `, budget ${f.budgetLimit}€` : ""}`
    )
    .join("\n");

  try {
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });

    const { text } = await generateText({
      model: openrouter("deepseek/deepseek-v3.2"),
      system: `Tu es un conseiller financier personnel. Analyse les tendances de dépenses et génère exactement 3 insights actionnables pour améliorer les finances.
Réponds UNIQUEMENT avec du JSON valide, sans markdown, sans code block :
["insight 1", "insight 2", "insight 3"]
Chaque insight doit être concis (1-2 phrases) et spécifique aux données.`,
      prompt: `Voici les tendances de dépenses des 3 derniers mois :\n${summary}`,
    });

    const jsonStr = text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    const insights = JSON.parse(jsonStr) as string[];

    // Incrémenter le compteur d'usage insights (quota séparé : 30/mois Pro)
    const month = new Date().toISOString().slice(0, 7);
    incrementAiUsage(getDb(), userId, month, "insights").catch(() => {});

    return { insights: insights.slice(0, 3) };
  } catch {
    return { error: "Erreur lors de la génération des insights IA" };
  }
}
