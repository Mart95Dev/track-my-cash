/**
 * GET /api/mobile/forecasts — Prévisions détaillées
 * STORY-060
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { getDetailedForecast } from "@/lib/queries/forecast-queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const url = new URL(req.url);
    const months = Math.min(24, Math.max(1, Number(url.searchParams.get("months") ?? 6)));
    const accountId = url.searchParams.get("account_id")
      ? Number(url.searchParams.get("account_id"))
      : undefined;

    const forecast = await getDetailedForecast(db, months, accountId);
    return jsonOk(forecast);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
