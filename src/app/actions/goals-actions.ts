"use server";

import { getGoals, createGoal, updateGoal, deleteGoal } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getGoalsAction() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return getGoals(db);
}

export async function createGoalAction(
  name: string,
  targetAmount: number,
  currentAmount: number,
  currency: string,
  deadline?: string,
  accountId?: number,
  monthlyContribution?: number
): Promise<{ success: true } | { error: string }> {
  if (!name?.trim()) return { error: "Le nom est requis" };
  if (!targetAmount || targetAmount <= 0) return { error: "Le montant cible doit être supérieur à 0" };
  if (currentAmount < 0) return { error: "Le montant actuel ne peut pas être négatif" };

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await createGoal(db, name.trim(), targetAmount, currentAmount, currency, deadline, accountId, monthlyContribution);
  revalidatePath("/dashboard");
  revalidatePath("/objectifs");
  return { success: true };
}

export async function updateGoalAction(
  id: number,
  data: { name?: string; target_amount?: number; current_amount?: number; currency?: string; deadline?: string | null; account_id?: number | null; monthly_contribution?: number }
): Promise<{ success: true } | { error: string }> {
  if (!id) return { error: "ID invalide" };
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await updateGoal(db, id, data);
  revalidatePath("/dashboard");
  revalidatePath("/objectifs");
  return { success: true };
}

export async function deleteGoalAction(id: number): Promise<{ success: true } | { error: string }> {
  if (!id) return { error: "ID invalide" };
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await deleteGoal(db, id);
  revalidatePath("/dashboard");
  revalidatePath("/objectifs");
  return { success: true };
}
