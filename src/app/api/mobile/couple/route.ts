/**
 * GET /api/mobile/couple — Info couple
 * STORY-062
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const mainDb = getDb();

    const result = await mainDb.execute({
      sql: `SELECT c.*, cm.role
            FROM couple_members cm
            JOIN couples c ON cm.couple_id = c.id
            WHERE cm.user_id = ?`,
      args: [userId],
    });

    if (result.rows.length === 0) {
      return jsonOk({ couple: null });
    }

    const row = result.rows[0];
    const coupleId = Number(row.id);

    const members = await mainDb.execute({
      sql: `SELECT cm.user_id, cm.role, u.email, u.name
            FROM couple_members cm
            JOIN user u ON cm.user_id = u.id
            WHERE cm.couple_id = ?`,
      args: [coupleId],
    });

    return jsonOk({
      id: coupleId,
      name: String(row.name ?? ""),
      invite_code: String(row.invite_code ?? ""),
      role: String(row.role),
      members: members.rows.map((m) => ({
        user_id: String(m.user_id),
        role: String(m.role),
        email: String(m.email),
        name: String(m.name ?? ""),
      })),
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
