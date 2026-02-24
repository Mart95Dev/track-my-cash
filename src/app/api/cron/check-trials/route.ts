import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { writeAdminLog } from "@/lib/admin-logger";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mainDb = getDb();

  const result = await mainDb.execute(
    `UPDATE subscriptions
     SET status = 'expired', plan_id = 'free'
     WHERE status = 'trialing' AND trial_ends_at <= datetime('now')
     RETURNING user_id`
  );

  const expired = result.rows.length;

  for (const row of result.rows) {
    try {
      await writeAdminLog(
        mainDb,
        "trial_expired",
        String(row.user_id),
        "Trial expiré automatiquement",
        { planId: "free" }
      );
    } catch {
      // Best-effort — ne bloque pas le cron
    }
  }

  return NextResponse.json({ expired });
}
