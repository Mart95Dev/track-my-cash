import { type NextRequest, NextResponse } from "next/server";
import { getDb, getUserDb } from "@/lib/db";
import { getSetting } from "@/lib/queries";
import { computeWeeklySummary } from "@/lib/weekly-summary";
import { renderWeeklyEmail } from "@/lib/email-templates";
import { sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mainDb = getDb();

  const usersResult = await mainDb.execute(`
    SELECT ud.user_id, u.email, u.name
    FROM users_databases ud
    JOIN user u ON u.id = ud.user_id
    JOIN subscriptions s ON s.user_id = ud.user_id
    WHERE s.plan_id IN ('pro', 'premium')
      AND (s.status = 'active' OR (s.status = 'trialing' AND s.trial_ends_at > datetime('now')))
  `);

  const now = new Date();
  const weekEnd = now.toISOString().slice(0, 10);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://koupli.com";

  let processed = 0;
  let sent = 0;

  for (const row of usersResult.rows) {
    const userId = String(row.user_id);
    const email = String(row.email);
    const name = String(row.name ?? "");
    processed++;

    try {
      const userDb = await getUserDb(userId);

      const optOut = await getSetting(userDb, "weekly_summary_email");
      if (optOut === "false") continue;

      const enriched = await computeWeeklySummary(userId, userDb, weekStart, weekEnd);
      const currency = (await getSetting(userDb, "reference_currency")) ?? "EUR";

      const data = { ...enriched, currency };
      const html = renderWeeklyEmail(data, name, appUrl);

      const weekLabel = new Date(weekStart + "T12:00:00").toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const result = await sendEmail({
        to: email,
        subject: `Récapitulatif hebdomadaire Koupli — semaine du ${weekLabel}`,
        html,
      });

      if (result.success) sent++;
    } catch {
      // Silencieux par utilisateur — ne pas bloquer les autres
    }
  }

  return NextResponse.json({ processed, sent });
}
