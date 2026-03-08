/**
 * GET  /api/mobile/tags — Liste des tags
 * POST /api/mobile/tags — Créer un tag
 * STORY-062
 */
import { getMobileUserId, jsonOk, jsonCreated, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const result = await db.execute("SELECT * FROM tags ORDER BY name ASC");
    const tags = result.rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      color: String(row.color),
      created_at: String(row.created_at),
    }));

    return jsonOk(tags);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const body = await req.json();
    const { name, color } = body as { name?: string; color?: string };

    if (!name || !color) {
      return jsonError(400, "Champs requis : name, color");
    }

    const result = await db.execute({
      sql: "INSERT INTO tags (name, color) VALUES (?, ?)",
      args: [name, color],
    });

    return jsonCreated({
      id: Number(result.lastInsertRowid),
      name,
      color,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
