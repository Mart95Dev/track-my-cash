import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isEligibleForReminder, type DeletionRequest } from "@/lib/deletion-utils";
import { sendEmail } from "@/lib/email";
import { renderDeletionReminderEmail } from "@/lib/email-templates";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mainDb = getDb();
  const appUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  // Récupérer les demandes éligibles au rappel (J+25 atteint, pas encore notifiées)
  const result = await mainDb.execute(`
    SELECT dr.user_id, dr.requested_at, dr.scheduled_delete_at, dr.notified_at,
           u.email
    FROM deletion_requests dr
    JOIN user u ON u.id = dr.user_id
    WHERE dr.notified_at IS NULL
  `);

  const candidates = result.rows.filter((row) =>
    isEligibleForReminder({
      user_id: String(row.user_id),
      requested_at: String(row.requested_at),
      scheduled_delete_at: String(row.scheduled_delete_at),
      notified_at: row.notified_at ? String(row.notified_at) : null,
    } satisfies DeletionRequest)
  );

  let notified = 0;

  for (const row of candidates) {
    const userEmail = String(row.email);
    const cancelUrl = `${appUrl}/parametres`;
    const deleteAt = String(row.scheduled_delete_at);

    try {
      await sendEmail({
        to: userEmail,
        subject: "Rappel : suppression de votre compte TrackMyCash dans 5 jours",
        html: renderDeletionReminderEmail(userEmail, deleteAt, cancelUrl),
        replyTo: process.env.EMAIL_REPLY_TO ?? process.env.EMAIL_USER,
      });

      await mainDb.execute({
        sql: "UPDATE deletion_requests SET notified_at = datetime('now') WHERE user_id = ?",
        args: [String(row.user_id)],
      });

      notified++;
    } catch {
      // Skip user on error, continue with next
    }
  }

  return NextResponse.json({ notified });
}
