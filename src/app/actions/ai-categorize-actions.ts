"use server";

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  getUncategorizedTransactions,
  batchUpdateCategories,
  getSetting,
} from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { canUseAI } from "@/lib/subscription-utils";
import { revalidatePath } from "next/cache";

const CATEGORIES = [
  "Alimentation",
  "Transport",
  "Logement",
  "Santé",
  "Loisirs",
  "Vêtements",
  "Éducation",
  "Épargne",
  "Revenus",
  "Banque",
  "Abonnements",
  "Autre",
] as const;

export interface CategorizationSuggestion {
  id: number;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
}

export async function autoCategorizeAction(
  transactionIds?: number[]
): Promise<CategorizationSuggestion[] | { error: string }> {
  const userId = await getRequiredUserId();

  const aiCheck = await canUseAI(userId);
  if (!aiCheck.allowed) {
    return { error: aiCheck.reason ?? "Fonctionnalité réservée aux plans Pro/Premium" };
  }

  const db = await getUserDb(userId);
  const apiKey = await getSetting(db, "openrouter_api_key");
  if (!apiKey) {
    return { error: "Clé API OpenRouter non configurée dans les paramètres" };
  }

  const transactions = transactionIds
    ? (await Promise.all(transactionIds.map(async (id) => {
        const rows = await db.execute({ sql: "SELECT * FROM transactions WHERE id = ?", args: [id] });
        if (!rows.rows[0]) return null;
        const r = rows.rows[0];
        return {
          id: Number(r.id),
          description: String(r.description),
          amount: Number(r.amount),
          type: String(r.type),
          category: String(r.category ?? ""),
        };
      }))).filter(Boolean)
    : (await getUncategorizedTransactions(db, 50)).map((t) => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
      }));

  if (transactions.length === 0) {
    return { error: "Toutes les transactions sont déjà catégorisées" };
  }

  const prompt = transactions.map((t) =>
    `ID:${t!.id} | ${t!.type === "income" ? "+" : "-"}${t!.amount} | ${t!.description}`
  ).join("\n");

  try {
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });

    const { text } = await generateText({
      model: openrouter("openai/gpt-4o-mini"),
      system: `Tu es un assistant financier. Pour chaque transaction bancaire, attribue une catégorie parmi : ${CATEGORIES.join(", ")}.
Réponds UNIQUEMENT avec du JSON valide, sans markdown, sans code block :
[{"id": 1, "category": "Alimentation", "subcategory": "Supermarché"}]
La subcategory est une description courte et précise (ex: "SNCF", "Netflix", "Pharmacie").`,
      prompt: `Catégorise ces transactions :\n${prompt}`,
    });

    const jsonStr = text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(jsonStr) as { id: number; category: string; subcategory?: string }[];

    return parsed.map((p) => {
      const tx = transactions.find((t) => t!.id === p.id);
      return {
        id: p.id,
        category: p.category,
        subcategory: p.subcategory,
        description: tx?.description ?? "",
        amount: tx?.amount ?? 0,
      };
    });
  } catch {
    return { error: "Erreur lors de la catégorisation IA. Vérifiez votre clé API." };
  }
}

export async function applyCategorizationsAction(
  categorizations: { id: number; category: string; subcategory?: string }[]
): Promise<{ success: true; count: number } | { error: string }> {
  if (!categorizations || categorizations.length === 0) {
    return { error: "Aucune catégorisation à appliquer" };
  }

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await batchUpdateCategories(db, categorizations);
  revalidatePath("/transactions");
  return { success: true, count: categorizations.length };
}
