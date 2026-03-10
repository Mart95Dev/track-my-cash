/**
 * DELETE /api/mobile/user/delete — Demande de suppression RGPD (STORY-144)
 * AC-2 : Cree une deletion_request avec delai 30 jours
 * AC-3 : Empeche la double suppression (409)
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getDb } from "@/lib/db";
import { writeAdminLog } from "@/lib/admin-logger";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const DELETION_GRACE_DAYS = 30;

export function OPTIONS() {
  return handleCors();
}

export async function DELETE(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = getDb();

    // Verifier si une demande existe deja (AC-3)
    const existing = await db.execute({
      sql: "SELECT user_id, scheduled_delete_at FROM deletion_requests WHERE user_id = ?",
      args: [userId],
    });

    if (existing.rows.length > 0) {
      return jsonError(409, "Suppression déjà planifiée");
    }

    // Recuperer l'email pour la confirmation
    const userResult = await db.execute({
      sql: "SELECT email FROM user WHERE id = ?",
      args: [userId],
    });
    const email = userResult.rows.length > 0 ? String(userResult.rows[0].email) : null;

    // Calculer la date de suppression
    const scheduledDeleteAt = new Date(
      Date.now() + DELETION_GRACE_DAYS * 86400000
    ).toISOString();

    // Lire le body (optionnel)
    let reason: string | null = null;
    try {
      const body = await req.json();
      reason = body.reason ?? null;
    } catch {
      // Body vide ou invalide, pas grave
    }

    // Creer la demande de suppression
    await db.execute({
      sql: `INSERT INTO deletion_requests (user_id, requested_at, scheduled_delete_at, reason)
            VALUES (?, datetime('now'), ?, ?)`,
      args: [userId, scheduledDeleteAt, reason],
    });

    // Admin log
    await writeAdminLog(db, "deletion_requested", userId, `Suppression planifiée au ${scheduledDeleteAt}`, {
      reason,
      scheduledDeleteAt,
      source: "mobile",
    });

    // Email de confirmation (best-effort)
    if (email) {
      const deleteDate = new Date(scheduledDeleteAt).toLocaleDateString("fr-FR");
      sendEmail({
        to: email,
        subject: "Confirmation de suppression de compte — TrackMyCash",
        html: `<p>Votre demande de suppression de compte a été enregistrée.</p>
               <p>Votre compte sera supprimé le <strong>${deleteDate}</strong>.</p>
               <p>Vous pouvez annuler cette demande à tout moment depuis les paramètres de l'application.</p>`,
      }).catch(() => {});
    }

    return jsonOk({ scheduledDeleteAt });
  } catch (err) {
    if (err instanceof Response) throw err;
    return jsonError(500, "Erreur interne du serveur");
  }
}
