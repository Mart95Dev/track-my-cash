import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

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

  return NextResponse.json({ expired });
}
