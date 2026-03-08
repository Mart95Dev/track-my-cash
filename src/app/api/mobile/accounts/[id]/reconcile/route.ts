/**
 * POST /api/mobile/accounts/[id]/reconcile — Réconciliation
 * STORY-058 — AC-6
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { getAccountById } from "@/lib/queries/account-queries";
import { createTransaction } from "@/lib/queries/transaction-queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);
    const { id } = await params;
    const accountId = Number(id);

    const account = await getAccountById(db, accountId);
    if (!account) {
      return jsonError(404, "Compte introuvable");
    }

    const body = await req.json();
    const { adjustment_amount } = body as {
      declared_balance?: number;
      adjustment_amount?: number;
    };

    if (adjustment_amount === undefined || adjustment_amount === 0) {
      return jsonError(400, "adjustment_amount requis et non nul");
    }

    const type = adjustment_amount > 0 ? "income" : "expense";
    const absAmount = Math.abs(adjustment_amount);
    const today = new Date().toISOString().split("T")[0];

    const transaction = await createTransaction(
      db,
      accountId,
      type,
      absAmount,
      today,
      "ajustement",
      "réconciliation",
      "Réconciliation bancaire"
    );

    return jsonOk(transaction);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
