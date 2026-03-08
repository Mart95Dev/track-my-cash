/**
 * POST /api/mobile/couple/join — Rejoindre un couple via code
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
      sql: "SELECT couple_id FROM couple_members WHERE user_id = ?",
      args: [userId],
    });

    if (existing.rows.length > 0) {
      return jsonError(400, "Vous êtes déjà membre d'un couple");
    }

    const body = await req.json();
    const { invite_code } = body as { invite_code?: string };

    if (!invite_code) {
      return jsonError(400, "Code d'invitation requis");
    }

    const couple = await mainDb.execute({
      sql: "SELECT id, name FROM couples WHERE invite_code = ?",
      args: [invite_code],
    });

    if (couple.rows.length === 0) {
      return jsonError(404, "Code d'invitation invalide");
    }

    const coupleId = Number(couple.rows[0].id);

    // Vérifier qu'il n'y a pas déjà 2 membres
    const memberCount = await mainDb.execute({
      sql: "SELECT COUNT(*) as count FROM couple_members WHERE couple_id = ?",
      args: [coupleId],
    });

    if (Number(memberCount.rows[0].count) >= 2) {
      return jsonError(400, "Ce couple a déjà 2 membres");
    }

    await mainDb.execute({
      sql: "INSERT INTO couple_members (couple_id, user_id, role) VALUES (?, ?, 'member')",
      args: [coupleId, userId],
    });

    return jsonOk({
      id: coupleId,
      name: String(couple.rows[0].name),
      role: "member",
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
