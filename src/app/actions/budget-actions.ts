"use server";

import {
  getBudgets,
  getBudgetStatus,
  upsertBudget,
  deleteBudget,
} from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { canUseCoupleFeature } from "@/lib/subscription-utils";
import { upsertCoupleBudget } from "@/lib/couple-queries";

export async function getBudgetsAction(accountId: number) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return getBudgets(db, accountId);
}

export async function getBudgetStatusAction(accountId: number) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return getBudgetStatus(db, accountId);
}

export async function upsertBudgetAction(
  accountId: number,
  category: string,
  amountLimit: number,
  period: "monthly" | "yearly"
) {
  if (!accountId || !category || !amountLimit || amountLimit <= 0) {
    return { error: "Données invalides" };
  }
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await upsertBudget(db, accountId, category, amountLimit, period);
  revalidatePath("/dashboard");
  revalidatePath("/parametres");
  return { success: true };
}

export async function deleteBudgetAction(id: number) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await deleteBudget(db, id);
  revalidatePath("/dashboard");
  revalidatePath("/parametres");
  return { success: true };
}

export async function upsertCoupleBudgetAction(
  accountId: number,
  category: string,
  amountLimit: number,
  period: "monthly" | "yearly",
  coupleId: string
): Promise<{ success?: boolean; error?: string }> {
  if (!accountId || !category || !amountLimit || amountLimit <= 0 || !coupleId) {
    return { error: "Données invalides" };
  }
  const userId = await getRequiredUserId();
  const gate = await canUseCoupleFeature(userId);
  if (!gate.allowed) return { error: gate.reason ?? "Fonctionnalité Pro requise" };

  const db = await getUserDb(userId);
  await upsertCoupleBudget(db, accountId, category, amountLimit, period, coupleId);
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
  return { success: true };
}
