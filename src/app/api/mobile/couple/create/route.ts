/**
 * POST /api/mobile/couple/create — Créer un couple
 * STORY-062
 */
import { getMobileUserId, jsonCreated, jsonError, handleCors } from "@/lib/mobile-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const mainDb = getDb();

    // Vérifier que l'utilisateur n'est pas déjà dans un couple
    const existing = await mainDb.execute({
      sql: "SELECT couple_id FROM couple_members WHERE user_id = ?",
      args: [userId],
    });

    if (existing.rows.length > 0) {
      return jsonError(400, "Vous êtes déjà membre d'un couple");
    }

    const body = await req.json();
    const name = body.name ?? "Mon couple";
    const inviteCode = generateInviteCode();

    const result = await mainDb.execute({
      sql: "INSERT INTO couples (name, invite_code) VALUES (?, ?)",
      args: [name, inviteCode],
    });

    const coupleId = Number(result.lastInsertRowid);

    await mainDb.execute({
      sql: "INSERT INTO couple_members (couple_id, user_id, role) VALUES (?, ?, 'owner')",
      args: [coupleId, userId],
    });

    return jsonCreated({
      id: coupleId,
      name,
      invite_code: inviteCode,
      role: "owner",
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
