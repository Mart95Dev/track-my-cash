/**
 * DELETE /api/mobile/categorization-rules/[id] — Supprimer une regle (STORY-145)
 * AC-5 : Supprime la regle par ID
 */
import { getMobileUserId, jsonNoContent, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { deleteCategorizationRule } from "@/lib/queries";

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

    await deleteCategorizationRule(db, Number(id));
    return jsonNoContent();
  } catch (err) {
    if (err instanceof Response) throw err;
    return jsonError(500, "Erreur interne du serveur");
  }
}
