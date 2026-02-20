"use server";

import {
  getCategorizationRules,
  createCategorizationRule,
  deleteCategorizationRule,
} from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getRulesAction() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return getCategorizationRules(db);
}

export async function createRuleAction(_prev: unknown, formData: FormData) {
  const pattern = formData.get("pattern") as string;
  const category = formData.get("category") as string;
  const priority = parseInt(formData.get("priority") as string) || 0;

  if (!pattern || !category) {
    return { error: "Pattern et catégorie requis" };
  }

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await createCategorizationRule(db, pattern, category, priority);
  revalidatePath("/parametres");
  return { success: true };
}

export async function deleteRuleAction(id: number) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await deleteCategorizationRule(db, id);
  revalidatePath("/parametres");
  return { success: true };
}
