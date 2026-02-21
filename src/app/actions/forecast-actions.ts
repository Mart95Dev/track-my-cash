"use server";

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { canUseAI } from "@/lib/subscription-utils";
import { getSetting } from "@/lib/queries";
import type { CategoryForecast } from "@/lib/forecasting";

export async function getAIForecastInsightsAction(
  forecasts: CategoryForecast[]
): Promise<{ insights: string[] } | { error: string }> {
  const userId = await getRequiredUserId();

  const guard = await canUseAI(userId);
  if (!guard.allowed) {
    return { error: guard.reason ?? "Fonctionnalité réservée aux plans Pro/Premium" };
  }

  const db = await getUserDb(userId);
  const apiKey = await getSetting(db, "openrouter_api_key");
  if (!apiKey) {
    return { error: "Clé API OpenRouter non configurée dans les paramètres" };
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
      model: openrouter("openai/gpt-4o-mini"),
      system: `Tu es un conseiller financier personnel. Analyse les tendances de dépenses et génère exactement 3 insights actionnables pour améliorer les finances.
Réponds UNIQUEMENT avec du JSON valide, sans markdown, sans code block :
["insight 1", "insight 2", "insight 3"]
Chaque insight doit être concis (1-2 phrases) et spécifique aux données.`,
      prompt: `Voici les tendances de dépenses des 3 derniers mois :\n${summary}`,
    });

    const jsonStr = text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    const insights = JSON.parse(jsonStr) as string[];

    return { insights: insights.slice(0, 3) };
  } catch {
    return { error: "Erreur lors de la génération des insights IA" };
  }
}
