"use server";

import { getRequiredUserId } from "@/lib/auth-utils";
import { getDb } from "@/lib/db";

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
