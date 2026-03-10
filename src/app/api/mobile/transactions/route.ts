/**
 * GET  /api/mobile/transactions — Liste paginée + filtres
 * POST /api/mobile/transactions — Créer une transaction
 * STORY-059
 */
import {
  getMobileUserId,
  jsonOk,
  jsonCreated,
  jsonError,
  handleCors,
} from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import {
  searchTransactions,
  createTransaction,
} from "@/lib/queries/transaction-queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
    const accountId = url.searchParams.get("account_id")
      ? Number(url.searchParams.get("account_id"))
      : undefined;
    const search = url.searchParams.get("search") ?? undefined;
    const sort = url.searchParams.get("sort") ?? undefined;
    const tagId = url.searchParams.get("tag_id")
      ? Number(url.searchParams.get("tag_id"))
      : undefined;

    const category = url.searchParams.get("category") ?? undefined;
    const type = url.searchParams.get("type") ?? undefined;
    const from = url.searchParams.get("from") ?? undefined;
    const to = url.searchParams.get("to") ?? undefined;

    const result = await searchTransactions(db, {
      accountId,
      search,
      sort,
      page,
      perPage,
      tagId,
      category,
      type,
      from,
      to,
    });

    return jsonOk({
      transactions: result.transactions,
      total: result.total,
      page,
      per_page: perPage,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}

interface CreateTransactionBody {
  account_id?: number;
  type?: "income" | "expense";
  amount?: number;
  date?: string;
  category?: string;
  subcategory?: string;
  description?: string;
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const body = (await req.json()) as CreateTransactionBody;
    const { account_id, type, amount, date, category, subcategory, description } = body;

    if (!account_id || !type || amount === undefined || !date) {
      return jsonError(400, "Champs requis : account_id, type, amount, date");
    }

    if (type !== "income" && type !== "expense") {
      return jsonError(400, "Le type doit être 'income' ou 'expense'");
    }

    if (typeof amount !== "number" || amount < 0) {
      return jsonError(400, "Le montant doit être un nombre positif");
    }

    const transaction = await createTransaction(
      db,
      account_id,
      type,
      amount,
      date,
      category ?? "Autre",
      subcategory ?? "",
      description ?? ""
    );

    return jsonCreated(transaction);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
