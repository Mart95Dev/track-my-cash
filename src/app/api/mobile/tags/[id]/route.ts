/**
 * DELETE /api/mobile/tags/[id] — Supprimer un tag
 * STORY-062
 */
import { getMobileUserId, jsonError, jsonNoContent, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);
    const { id } = await params;

    await db.execute({ sql: "DELETE FROM tags WHERE id = ?", args: [Number(id)] });
    return jsonNoContent();
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
