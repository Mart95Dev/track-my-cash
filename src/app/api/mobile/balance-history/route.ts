/**
 * GET /api/mobile/balance-history — Historique des soldes
 * STORY-060
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { getMonthlyBalanceHistory } from "@/lib/queries/dashboard-queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const url = new URL(req.url);
    const days = Number(url.searchParams.get("days") ?? 30);
    // Convert days to months (approx)
    const months = Math.max(1, Math.ceil(days / 30));
    const accountId = url.searchParams.get("account_id")
      ? Number(url.searchParams.get("account_id"))
      : undefined;

    const history = await getMonthlyBalanceHistory(db, months, accountId);
    return jsonOk(history);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
