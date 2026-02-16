"use server";

import {
  getCategorizationRules,
  createCategorizationRule,
  deleteCategorizationRule,
} from "@/lib/queries";
import { revalidatePath } from "next/cache";

export async function getRulesAction() {
  return getCategorizationRules();
}

export async function createRuleAction(_prev: unknown, formData: FormData) {
  const pattern = formData.get("pattern") as string;
  const category = formData.get("category") as string;
  const priority = parseInt(formData.get("priority") as string) || 0;

  if (!pattern || !category) {
    return { error: "Pattern et catégorie requis" };
  }

  await createCategorizationRule(pattern, category, priority);
  revalidatePath("/parametres");
  return { success: true };
}

export async function deleteRuleAction(id: number) {
  await deleteCategorizationRule(id);
  revalidatePath("/parametres");
  return { success: true };
}
