"use server";

import { getBudgetHistory } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import type { BudgetHistoryEntry } from "@/lib/queries";

export async function getBudgetHistoryAction(
  accountId: number,
  category: string
): Promise<BudgetHistoryEntry[]> {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return getBudgetHistory(db, accountId, category);
}
