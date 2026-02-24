import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { renderTrialReminderEmail } from "@/lib/email-templates";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  let sent = 0;

  // J-3 : trial expire entre 2j12h et 3j12h, rappel pas encore envoyé
  const result3d = await db.execute(`
    SELECT s.user_id, u.email, u.name
    FROM subscriptions s
    JOIN user u ON u.id = s.user_id
    WHERE s.status = 'trialing'
      AND s.trial_ends_at BETWEEN datetime('now', '+2 days', '+12 hours') AND datetime('now', '+3 days', '+12 hours')
      AND s.reminder_3d_sent = 0
  `);

  for (const row of result3d.rows) {
    const userId = String(row.user_id);
    const email = String(row.email);
    const name = row.name !== null ? String(row.name) : email;
    try {
      const html = renderTrialReminderEmail(3, name, baseUrl);
      await sendEmail({
        to: email,
        subject: "⏳ Votre essai Pro expire dans 3 jours",
        html,
      });
      await db.execute({
        sql: "UPDATE subscriptions SET reminder_3d_sent = 1 WHERE user_id = ?",
        args: [userId],
      });
      sent++;
    } catch {
      // Best-effort — ne bloque pas les autres
    }
  }

  // J-1 : trial expire entre 12h et 1j12h, rappel pas encore envoyé
  const result1d = await db.execute(`
    SELECT s.user_id, u.email, u.name
    FROM subscriptions s
    JOIN user u ON u.id = s.user_id
    WHERE s.status = 'trialing'
      AND s.trial_ends_at BETWEEN datetime('now', '+12 hours') AND datetime('now', '+1 day', '+12 hours')
      AND s.reminder_1d_sent = 0
  `);

  for (const row of result1d.rows) {
    const userId = String(row.user_id);
    const email = String(row.email);
    const name = row.name !== null ? String(row.name) : email;
    try {
      const html = renderTrialReminderEmail(1, name, baseUrl);
      await sendEmail({
        to: email,
        subject: "⚠️ Dernière chance — votre essai Pro expire demain",
        html,
      });
      await db.execute({
        sql: "UPDATE subscriptions SET reminder_1d_sent = 1 WHERE user_id = ?",
        args: [userId],
      });
      sent++;
    } catch {
      // Best-effort — ne bloque pas les autres
    }
  }

  return NextResponse.json({ sent });
}
