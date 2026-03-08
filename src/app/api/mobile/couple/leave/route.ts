/**
 * POST /api/mobile/couple/leave — Quitter un couple
 * STORY-062
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const mainDb = getDb();

    const existing = await mainDb.execute({
      sql: "SELECT couple_id, role FROM couple_members WHERE user_id = ?",
      args: [userId],
    });

    if (existing.rows.length === 0) {
      return jsonError(400, "Vous n'êtes pas membre d'un couple");
    }

    const coupleId = Number(existing.rows[0].couple_id);
    const role = String(existing.rows[0].role);

    // Supprimer le membre
    await mainDb.execute({
      sql: "DELETE FROM couple_members WHERE user_id = ?",
      args: [userId],
    });

    // Si owner, supprimer le couple et les autres membres
    if (role === "owner") {
      await mainDb.execute({
        sql: "DELETE FROM couple_members WHERE couple_id = ?",
        args: [coupleId],
      });
      await mainDb.execute({
        sql: "DELETE FROM couples WHERE id = ?",
        args: [coupleId],
      });
    }

    return jsonOk({ message: "Vous avez quitté le couple" });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
