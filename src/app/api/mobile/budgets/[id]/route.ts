/**
 * DELETE /api/mobile/budgets/[id] — Supprimer un budget
 * STORY-061
 */
import { getMobileUserId, jsonError, jsonNoContent, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { deleteBudget } from "@/lib/queries/budget-queries";

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

    await deleteBudget(db, Number(id));
    return jsonNoContent();
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
