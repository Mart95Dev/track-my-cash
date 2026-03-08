/**
 * PUT    /api/mobile/recurring/[id] — Modifier un paiement récurrent
 * DELETE /api/mobile/recurring/[id] — Supprimer un paiement récurrent
 * STORY-061
 */
import { getMobileUserId, jsonOk, jsonError, jsonNoContent, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { updateRecurringPayment, deleteRecurringPayment } from "@/lib/queries/recurring-queries";

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
    const recId = Number(id);

    const body = await req.json();
    const { account_id, name, type, amount, frequency, next_date, category, end_date, subcategory } = body;

    if (!account_id || !name || !type || amount === undefined || !frequency || !next_date || !category) {
      return jsonError(400, "Champs requis : account_id, name, type, amount, frequency, next_date, category");
    }

    await updateRecurringPayment(
      db,
      recId,
      account_id,
      name,
      type,
      amount,
      frequency,
      next_date,
      category,
      end_date ?? null,
      subcategory ?? null
    );

    return jsonOk({ id: recId, message: "Paiement récurrent mis à jour" });
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

    await deleteRecurringPayment(db, Number(id));
    return jsonNoContent();
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
