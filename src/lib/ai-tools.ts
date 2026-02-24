import { tool } from "ai";
import { z } from "zod";
import type { Client } from "@libsql/client";
import { upsertBudget, createGoal, createRecurringPayment } from "@/lib/queries";
import { computeCoupleBalanceForPeriod, getSharedTransactionsForCouple } from "@/lib/couple-queries";

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

export const createRecurringSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe("Nom du paiement récurrent (ex: Loyer, Netflix, EDF)"),
  amount: z
    .number()
    .positive()
    .describe("Montant en euros"),
  type: z
    .enum(["income", "expense"])
    .describe("Revenu ou dépense"),
  frequency: z
    .enum(["weekly", "monthly", "quarterly", "yearly"])
    .describe("Fréquence du paiement"),
  category: z
    .string()
    .describe("Catégorie (ex: Logement, Abonnement, Revenus)"),
  next_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format YYYY-MM-DD")
    .describe("Prochaine date de paiement au format YYYY-MM-DD"),
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
    }
  | {
      success: boolean;
      type: "recurring";
      name: string;
      amount: number;
      frequency: string;
      message: string;
    }
  | {
      type: "couple_balance";
      user1Paid: number;
      user2Paid: number;
      diff: number;
      amount: number;
      message: string;
    }
  | {
      type: "couple_summary";
      totalExpenses: number;
      transactionCount: number;
      topCategories: Array<{ category: string; total: number }>;
      period?: string;
      message: string;
    };

export const getCoupleBalanceSchema = z.object({
  period: z
    .string()
    .optional()
    .describe("Période au format YYYY-MM (optionnel, défaut : mois courant)"),
});

export const getCoupleSummarySchema = z.object({
  period: z
    .string()
    .optional()
    .describe("Période au format YYYY-MM (optionnel, défaut : mois courant)"),
});

export function createCoupleAiTools(
  userDb1: Client,
  userDb2: Client,
  userId1: string,
  userId2: string
) {
  return {
    getCoupleBalance: tool({
      description:
        "Calcule la balance financière du couple : qui a payé quoi et qui doit combien à l'autre. Utilise quand l'utilisateur demande la balance ou l'équilibre des dépenses couple.",
      inputSchema: getCoupleBalanceSchema,
      execute: async (input) => {
        const balance = await computeCoupleBalanceForPeriod(
          userDb1,
          userDb2,
          userId1,
          userId2,
          input.period
        );
        let message: string;
        if (balance.diff > 0) {
          message = `Votre partenaire vous doit ${balance.amount.toFixed(2)}€`;
        } else if (balance.diff < 0) {
          message = `Vous devez ${balance.amount.toFixed(2)}€ à votre partenaire`;
        } else {
          message = `Vos contributions sont égales`;
        }
        return {
          type: "couple_balance" as const,
          user1Paid: balance.user1Paid,
          user2Paid: balance.user2Paid,
          diff: balance.diff,
          amount: balance.amount,
          message,
        };
      },
    }),

    getCoupleSummary: tool({
      description:
        "Résume les dépenses partagées du couple pour une période : total, nombre de transactions, catégories principales. Utilise quand l'utilisateur demande une analyse des dépenses communes.",
      inputSchema: getCoupleSummarySchema,
      execute: async (input) => {
        const transactions = await getSharedTransactionsForCouple(
          userDb1,
          userDb2,
          input.period
        );
        const expenses = transactions.filter((t) => t.type === "expense");
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const transactionCount = expenses.length;
        const categoryMap = new Map<string, number>();
        for (const t of expenses) {
          categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + t.amount);
        }
        const topCategories = Array.from(categoryMap.entries())
          .map(([category, total]) => ({ category, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);
        const period = input.period ?? new Date().toISOString().slice(0, 7);
        return {
          type: "couple_summary" as const,
          totalExpenses,
          transactionCount,
          topCategories,
          period,
          message: `Dépenses communes : ${totalExpenses.toFixed(2)}€ (${transactionCount} transactions)`,
        };
      },
    }),
  };
}

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

    createRecurring: tool({
      description:
        "Crée un paiement récurrent (abonnement, loyer, salaire, charge fixe...). Utilise quand l'utilisateur demande d'ajouter un paiement régulier ou automatique.",
      inputSchema: createRecurringSchema,
      execute: async (input) => {
        await createRecurringPayment(
          db,
          accountId,
          input.name,
          input.type,
          input.amount,
          input.frequency,
          input.next_date,
          input.category
        );
        const frequencyLabel: Record<string, string> = {
          weekly: "semaine",
          monthly: "mois",
          quarterly: "trimestre",
          yearly: "an",
        };
        const label = frequencyLabel[input.frequency] ?? input.frequency;
        return {
          success: true,
          type: "recurring" as const,
          name: input.name,
          amount: input.amount,
          frequency: input.frequency,
          message: `Récurrent "${input.name}" créé : ${input.amount}€/${label}`,
        };
      },
    }),
  };
}
