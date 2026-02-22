import { tool } from "ai";
import { z } from "zod";
import type { Client } from "@libsql/client";
import { upsertBudget, createGoal } from "@/lib/queries";

export const createBudgetSchema = z.object({
  category: z
    .string()
    .min(1)
    .describe("Catégorie de dépenses (ex: Restaurants, Loisirs, Transport)"),
  amount_limit: z
    .number()
    .positive()
    .describe("Montant limite mensuel en euros"),
});

export const createGoalSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe("Nom de l'objectif (ex: Vacances, Voiture, Urgences)"),
  target_amount: z
    .number()
    .positive()
    .describe("Montant cible à atteindre en euros"),
  deadline: z
    .string()
    .optional()
    .describe("Date limite au format YYYY-MM-DD (optionnel)"),
});

export type ToolCallResult =
  | {
      success: boolean;
      type: "budget";
      category: string;
      amount_limit: number;
      message: string;
    }
  | {
      success: boolean;
      type: "goal";
      name: string;
      target_amount: number;
      deadline?: string;
      message: string;
    };

export function createAiTools(db: Client, accountId: number) {
  return {
    createBudget: tool({
      description:
        "Crée un budget mensuel pour une catégorie de dépenses. Utilise quand l'utilisateur demande à définir ou fixer un budget.",
      inputSchema: createBudgetSchema,
      execute: async (input) => {
        await upsertBudget(db, accountId, input.category, input.amount_limit, "monthly");
        return {
          success: true,
          type: "budget" as const,
          category: input.category,
          amount_limit: input.amount_limit,
          message: `Budget ${input.category} créé : ${input.amount_limit}€/mois`,
        };
      },
    }),

    createGoal: tool({
      description:
        "Crée un objectif d'épargne. Utilise quand l'utilisateur veut épargner pour un projet.",
      inputSchema: createGoalSchema,
      execute: async (input) => {
        await createGoal(db, input.name, input.target_amount, 0, "EUR", input.deadline);
        return {
          success: true,
          type: "goal" as const,
          name: input.name,
          target_amount: input.target_amount,
          deadline: input.deadline,
          message: `Objectif "${input.name}" créé : ${input.target_amount}€`,
        };
      },
    }),
  };
}
