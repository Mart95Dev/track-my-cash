"use server";

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getUserDb, getDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { canUseAI } from "@/lib/subscription-utils";
import { getUserPlanId } from "@/lib/subscription-utils";
import { getGoals } from "@/lib/queries";

export interface GoalSuggestion {
  name: string;
  suggestedTarget: number;
  timelineMonths: number;
  monthlyContribution: number;
  rationale: string;
}

export async function getSmartGoalSuggestionsAction(): Promise<
  { suggestions: GoalSuggestion[] } | { error: string }
> {
  const userId = await getRequiredUserId();

  // Premium-only
  const planId = await getUserPlanId(userId);
  if (planId !== "premium") {
    return {
      error:
        "Les objectifs intelligents IA sont réservés au plan Premium (8,90€/mois).",
    };
  }

  const aiCheck = await canUseAI(userId);
  if (!aiCheck.allowed) {
    return { error: aiCheck.reason ?? "Service IA indisponible" };
  }

  const apiKey = process.env.API_KEY_OPENROUTER;
  if (!apiKey) {
    return { error: "Service IA temporairement indisponible" };
  }

  const db = await getUserDb(userId);

  // Récupérer les données financières pour le contexte
  const [incomeResult, expenseResult, existingGoals] = await Promise.all([
    db.execute({
      sql: `SELECT strftime('%Y-%m', date) as month, SUM(amount) as total
            FROM transactions WHERE type = 'income' AND date >= date('now', '-3 months')
            GROUP BY month ORDER BY month`,
      args: [],
    }),
    db.execute({
      sql: `SELECT strftime('%Y-%m', date) as month, category, SUM(amount) as total
            FROM transactions WHERE type = 'expense' AND date >= date('now', '-3 months')
            GROUP BY month, category ORDER BY total DESC`,
      args: [],
    }),
    getGoals(db),
  ]);

  const avgIncome =
    incomeResult.rows.length > 0
      ? incomeResult.rows.reduce((s, r) => s + Number(r.total), 0) /
        incomeResult.rows.length
      : 0;

  const expensesByCategory = new Map<string, number[]>();
  for (const row of expenseResult.rows) {
    const cat = String(row.category);
    if (!expensesByCategory.has(cat)) expensesByCategory.set(cat, []);
    expensesByCategory.get(cat)!.push(Number(row.total));
  }

  const totalAvgExpenses = [...expensesByCategory.values()].reduce(
    (sum, amounts) => sum + amounts.reduce((s, v) => s + v, 0) / amounts.length,
    0
  );

  const monthlySavingsPotential = Math.max(0, avgIncome - totalAvgExpenses);

  const existingGoalNames = existingGoals.map((g) => g.name);

  const context = `Revenus moyens mensuels : ${Math.round(avgIncome)}€
Dépenses moyennes mensuelles : ${Math.round(totalAvgExpenses)}€
Capacité d'épargne estimée : ${Math.round(monthlySavingsPotential)}€/mois
Top catégories de dépenses : ${[...expensesByCategory.entries()]
    .map(([cat, amounts]) => `${cat} (${Math.round(amounts.reduce((s, v) => s + v, 0) / amounts.length)}€/mois)`)
    .slice(0, 5)
    .join(", ")}
Objectifs existants : ${existingGoalNames.length > 0 ? existingGoalNames.join(", ") : "aucun"}`;

  try {
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });

    const { text } = await generateText({
      model: openrouter("moonshotai/kimi-k2.5"),
      system: `Tu es un conseiller financier personnel. Analyse les finances de l'utilisateur et propose exactement 3 objectifs d'épargne réalistes et personnalisés.

Règles :
- Chaque objectif doit être réaliste par rapport à la capacité d'épargne
- Ne propose PAS d'objectifs qui existent déjà
- La contribution mensuelle ne doit pas dépasser 60% de la capacité d'épargne totale
- Les noms doivent être concis (2-4 mots)
- Le rationale doit expliquer le raisonnement en 1-2 phrases

Réponds UNIQUEMENT avec du JSON valide, sans markdown, sans code block :
[{"name": "Fonds urgence", "suggestedTarget": 3000, "timelineMonths": 12, "monthlyContribution": 250, "rationale": "Un matelas de sécurité de 3 mois de dépenses. En mettant 250€/mois, atteignable en 1 an."}]`,
      prompt: `Analyse ces finances et propose 3 objectifs d'épargne :\n${context}`,
    });

    const jsonStr = text
      .trim()
      .replace(/^```json\n?/, "")
      .replace(/\n?```$/, "");
    const parsed = JSON.parse(jsonStr) as GoalSuggestion[];

    return { suggestions: parsed.slice(0, 3) };
  } catch {
    return { error: "Erreur lors de la génération des suggestions IA" };
  }
}
