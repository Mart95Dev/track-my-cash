/**
 * PUT    /api/mobile/goals/[id] — Modifier un objectif
 * DELETE /api/mobile/goals/[id] — Supprimer un objectif
 * STORY-061
 */
import { getMobileUserId, jsonOk, jsonError, jsonNoContent, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { updateGoal, deleteGoal, getGoals } from "@/lib/queries/goal-queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);
    const { id } = await params;
    const goalId = Number(id);

    const body = await req.json();

    await updateGoal(db, goalId, body);

    const goals = await getGoals(db);
    const updated = goals.find((g) => g.id === goalId);
    return jsonOk(updated ?? { id: goalId, message: "Objectif mis à jour" });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);
    const { id } = await params;

    await deleteGoal(db, Number(id));
    return jsonNoContent();
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
