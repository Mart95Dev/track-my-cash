/**
 * PUT    /api/mobile/transactions/[id] — Modifier
 * DELETE /api/mobile/transactions/[id] — Supprimer
 * STORY-059
 */
import {
  getMobileUserId,
  jsonOk,
  jsonError,
  handleCors,
} from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import {
  updateTransaction,
  deleteTransaction,
} from "@/lib/queries/transaction-queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

interface UpdateTransactionBody {
  account_id?: number;
  type?: "income" | "expense";
  amount?: number;
  date?: string;
  category?: string;
  subcategory?: string;
  description?: string;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (isNaN(id) || id <= 0) {
      return jsonError(400, "ID de transaction invalide");
    }

    const body = (await req.json()) as UpdateTransactionBody;
    const { account_id, type, amount, date, category, subcategory, description } = body;

    if (!account_id || !type || amount === undefined || !date) {
      return jsonError(400, "Champs requis : account_id, type, amount, date");
    }

    if (type !== "income" && type !== "expense") {
      return jsonError(400, "Le type doit être 'income' ou 'expense'");
    }

    await updateTransaction(
      db,
      id,
      account_id,
      type,
      amount,
      date,
      category ?? "Autre",
      subcategory ?? "",
      description ?? ""
    );

    return jsonOk({ id, message: "Transaction mise à jour" });
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
    const { id: idParam } = await params;
    const id = Number(idParam);

    if (isNaN(id) || id <= 0) {
      return jsonError(400, "ID de transaction invalide");
    }

    await deleteTransaction(db, id);
    return jsonOk({ id, message: "Transaction supprimée" });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
