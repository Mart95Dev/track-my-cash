"use server";

import { getRequiredUserId } from "@/lib/auth-utils";
import { getDb, getUserDb } from "@/lib/db";
import {
  getAllAccounts,
  getTransactions,
  getRecurringPayments,
  getAllBudgets,
  getGoals,
  getAllSettings,
} from "@/lib/queries";

const DELETION_GRACE_DAYS = 30;

export async function requestAccountDeletionAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const userId = await getRequiredUserId();
    const mainDb = getDb();
    const scheduledDeleteAt = new Date(
      Date.now() + DELETION_GRACE_DAYS * 86400000
    ).toISOString();

    await mainDb.execute({
      sql: `INSERT INTO deletion_requests (user_id, requested_at, scheduled_delete_at)
            VALUES (?, datetime('now'), ?)
            ON CONFLICT(user_id) DO NOTHING`,
      args: [userId, scheduledDeleteAt],
    });

    return { success: true };
  } catch {
    return { success: false, error: "Une erreur est survenue. Veuillez réessayer." };
  }
}

export async function cancelDeletionAction(): Promise<{ success: boolean }> {
  try {
    const userId = await getRequiredUserId();
    const mainDb = getDb();
    await mainDb.execute({
      sql: "DELETE FROM deletion_requests WHERE user_id = ?",
      args: [userId],
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function exportUserDataAction(): Promise<
  { success: true; json: string } | { success: false; error: string }
> {
  try {
    const userId = await getRequiredUserId();
    const db = await getUserDb(userId);

    const [accounts, transactions, recurring, budgets, goals, settings] =
      await Promise.all([
        getAllAccounts(db),
        getTransactions(db),
        getRecurringPayments(db),
        getAllBudgets(db),
        getGoals(db),
        getAllSettings(db),
      ]);

    const payload = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      accounts,
      transactions,
      recurring,
      budgets,
      goals,
      settings,
    };

    return { success: true, json: JSON.stringify(payload, null, 2) };
  } catch {
    return { success: false, error: "Une erreur est survenue lors de l'export." };
  }
}
