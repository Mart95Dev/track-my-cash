/**
 * GET  /api/mobile/goals — Liste des objectifs
 * POST /api/mobile/goals — Créer un objectif
 * STORY-061
 */
import { getMobileUserId, jsonOk, jsonCreated, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { getGoals, createGoal } from "@/lib/queries/goal-queries";

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

    const goals = await getGoals(db, accountId);
    return jsonOk(goals);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}

interface CreateGoalBody {
  name?: string;
  target_amount?: number;
  current_amount?: number;
  currency?: string;
  deadline?: string;
  account_id?: number;
  monthly_contribution?: number;
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const body = (await req.json()) as CreateGoalBody;
    const { name, target_amount, currency } = body;

    if (!name || target_amount === undefined || !currency) {
      return jsonError(400, "Champs requis : name, target_amount, currency");
    }

    const goal = await createGoal(
      db,
      name,
      target_amount,
      body.current_amount ?? 0,
      currency,
      body.deadline,
      body.account_id,
      body.monthly_contribution
    );

    return jsonCreated(goal);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
