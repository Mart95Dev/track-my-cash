import { type NextRequest, NextResponse } from "next/server";
import { getDb, getUserDb } from "@/lib/db";
import { isEligibleForDeletion, type DeletionRequest } from "@/lib/deletion-utils";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mainDb = getDb();

  const result = await mainDb.execute(
    "SELECT user_id, requested_at, scheduled_delete_at, notified_at FROM deletion_requests"
  );

  const overdueRows = result.rows.filter((row) =>
    isEligibleForDeletion({
      user_id: String(row.user_id),
      requested_at: String(row.requested_at),
      scheduled_delete_at: String(row.scheduled_delete_at),
    } satisfies DeletionRequest)
  );

  let deleted = 0;

  for (const row of overdueRows) {
    const userId = String(row.user_id);

    try {
      // 1. Supprimer les données Turso per-user (best-effort)
      try {
        const userDb = await getUserDb(userId);
        await userDb.executeMultiple(`
          DELETE FROM transaction_tags;
          DELETE FROM tags;
          DELETE FROM categorization_rules;
          DELETE FROM recurring_payments;
          DELETE FROM transactions;
          DELETE FROM accounts;
          DELETE FROM settings;
        `);
      } catch {
        // Best-effort
      }

      // 2. Supprimer les données DB principale
      await mainDb.execute({
        sql: "DELETE FROM users_databases WHERE user_id = ?",
        args: [userId],
      });
      await mainDb.execute({
        sql: "DELETE FROM subscriptions WHERE user_id = ?",
        args: [userId],
      });
      await mainDb.execute({
        sql: "DELETE FROM ai_usage WHERE user_id = ?",
        args: [userId],
      });
      await mainDb.execute({
        sql: "DELETE FROM deletion_requests WHERE user_id = ?",
        args: [userId],
      });

      // 3. Supprimer l'utilisateur Better-Auth
      await mainDb.execute({
        sql: 'DELETE FROM session WHERE "userId" = ?',
        args: [userId],
      });
      await mainDb.execute({
        sql: 'DELETE FROM account WHERE "userId" = ?',
        args: [userId],
      });
      await mainDb.execute({
        sql: 'DELETE FROM "user" WHERE id = ?',
        args: [userId],
      });

      deleted++;
    } catch {
      // Skip user on error, continue with next
    }
  }

  return NextResponse.json({ deleted });
}
