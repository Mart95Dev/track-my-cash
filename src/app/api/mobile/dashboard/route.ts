/**
 * GET /api/mobile/dashboard — Données dashboard
 * STORY-060
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { getDashboardData } from "@/lib/queries/dashboard-queries";

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

    const data = await getDashboardData(db, accountId);
    return jsonOk(data);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
