import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { renderCoupleReminderEmail } from "@/lib/email-templates";

interface CoupleReminderRow {
  user_id: string;
  email: string;
  name: string | null;
  invite_code: string;
  couple_id: string;
  created_at: number;
  reminder_couple_1d_sent: number;
  reminder_couple_3d_sent: number;
  reminder_couple_7d_sent: number;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  let sent = 0;

  // Récupère tous les utilisateurs ayant choisi 'couple',
  // appartenant à un couple actif, avec les infos du couple et des flags de rappel
  const result = await db.execute(`
    SELECT u.id as user_id, u.email, u.name,
           c.invite_code, c.id as couple_id, c.created_at,
           COALESCE(u.reminder_couple_1d_sent, 0) as reminder_couple_1d_sent,
           COALESCE(u.reminder_couple_3d_sent, 0) as reminder_couple_3d_sent,
           COALESCE(u.reminder_couple_7d_sent, 0) as reminder_couple_7d_sent
    FROM user u
    JOIN couple_members cm ON cm.user_id = u.id
    JOIN couples c ON c.id = cm.couple_id
    WHERE u.onboarding_choice = 'couple'
      AND cm.status = 'active'
  `);

  for (const rawRow of result.rows) {
    const row: CoupleReminderRow = {
      user_id: String(rawRow.user_id),
      email: String(rawRow.email),
      name: rawRow.name != null ? String(rawRow.name) : null,
      invite_code: String(rawRow.invite_code),
      couple_id: String(rawRow.couple_id),
      created_at: Number(rawRow.created_at),
      reminder_couple_1d_sent: Number(rawRow.reminder_couple_1d_sent),
      reminder_couple_3d_sent: Number(rawRow.reminder_couple_3d_sent),
      reminder_couple_7d_sent: Number(rawRow.reminder_couple_7d_sent),
    };

    // Compter les membres actifs dans ce couple
    const membersResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM couple_members WHERE couple_id = ? AND status = 'active'`,
      args: [row.couple_id],
    });
    const memberCount = Number(membersResult.rows[0]?.count ?? 0);

    // Ne traiter que les couples avec 1 seul membre (partenaire pas encore rejoint)
    if (memberCount !== 1) continue;

    // Calculer les jours depuis la création du couple
    const now = Math.floor(Date.now() / 1000);
    const daysSinceCreation = (now - row.created_at) / 86400;

    const tiers: Array<{ days: 1 | 3 | 7; field: string; threshold: number }> = [
      { days: 7, field: "reminder_couple_7d_sent", threshold: 7 },
      { days: 3, field: "reminder_couple_3d_sent", threshold: 3 },
      { days: 1, field: "reminder_couple_1d_sent", threshold: 1 },
    ];

    for (const tier of tiers) {
      const alreadySent =
        tier.field === "reminder_couple_1d_sent"
          ? row.reminder_couple_1d_sent
          : tier.field === "reminder_couple_3d_sent"
            ? row.reminder_couple_3d_sent
            : row.reminder_couple_7d_sent;

      if (daysSinceCreation >= tier.threshold && alreadySent === 0) {
        try {
          const html = renderCoupleReminderEmail(row.invite_code, tier.days);
          await sendEmail({
            to: row.email,
            subject: "Votre partenaire vous attend sur Koupli",
            html,
          });
          await db.execute({
            sql: `UPDATE user SET ${tier.field} = 1 WHERE id = ?`,
            args: [row.user_id],
          });
          sent++;
          // N'envoyer qu'un seul palier à la fois (le plus élevé atteint)
          break;
        } catch {
          // Best-effort — ne bloque pas les autres
        }
      }
    }
  }

  return NextResponse.json({ sent });
}
