/**
 * GET  /api/mobile/recurring — Liste paiements récurrents
 * POST /api/mobile/recurring — Créer un paiement récurrent
 * STORY-061
 */
import { getMobileUserId, jsonOk, jsonCreated, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { getRecurringPayments, createRecurringPayment } from "@/lib/queries/recurring-queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const url = new URL(req.url);
    const accountId = url.searchParams.get("account_id")
      ? Number(url.searchParams.get("account_id"))
      : undefined;

    const recurring = await getRecurringPayments(db, accountId);
    return jsonOk(recurring);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}

interface CreateRecurringBody {
  account_id?: number;
  name?: string;
  type?: "income" | "expense";
  amount?: number;
  frequency?: string;
  next_date?: string;
  category?: string;
  end_date?: string | null;
  subcategory?: string | null;
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const body = (await req.json()) as CreateRecurringBody;
    const { account_id, name, type, amount, frequency, next_date, category } = body;

    if (!account_id || !name || !type || amount === undefined || !frequency || !next_date || !category) {
      return jsonError(400, "Champs requis : account_id, name, type, amount, frequency, next_date, category");
    }

    if (type !== "income" && type !== "expense") {
      return jsonError(400, "Le type doit être 'income' ou 'expense'");
    }

    const recurring = await createRecurringPayment(
      db,
      account_id,
      name,
      type,
      amount,
      frequency,
      next_date,
      category,
      body.end_date ?? null,
      body.subcategory ?? null
    );

    return jsonCreated(recurring);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
