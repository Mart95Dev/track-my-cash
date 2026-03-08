/**
 * GET  /api/mobile/budgets — Liste des budgets avec statut
 * POST /api/mobile/budgets — Créer/upsert un budget
 * STORY-061
 */
import { getMobileUserId, jsonOk, jsonCreated, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { getAllBudgets, getBudgetStatus, upsertBudget } from "@/lib/queries/budget-queries";

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

    if (accountId) {
      const statuses = await getBudgetStatus(db, accountId);
      return jsonOk(statuses);
    }

    const budgets = await getAllBudgets(db);
    return jsonOk(budgets);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}

interface CreateBudgetBody {
  account_id?: number;
  category?: string;
  amount_limit?: number;
  period?: "monthly" | "yearly";
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const body = (await req.json()) as CreateBudgetBody;
    const { account_id, category, amount_limit, period } = body;

    if (!account_id || !category || amount_limit === undefined || !period) {
      return jsonError(400, "Champs requis : account_id, category, amount_limit, period");
    }

    if (period !== "monthly" && period !== "yearly") {
      return jsonError(400, "Le period doit être 'monthly' ou 'yearly'");
    }

    await upsertBudget(db, account_id, category, amount_limit, period);

    const statuses = await getBudgetStatus(db, account_id);
    const created = statuses.find((s) => s.category === category);
    return jsonCreated(created ?? { account_id, category, amount_limit, period });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
