/**
 * GET /api/mobile/subscription — Statut abonnement
 * STORY-062
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const mainDb = getDb();

    const result = await mainDb.execute({
      sql: "SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      args: [userId],
    });

    if (result.rows.length === 0) {
      return jsonOk({
        plan: "free",
        status: "active",
        current_period_end: null,
      });
    }

    const row = result.rows[0];
    return jsonOk({
      plan: String(row.plan ?? "free"),
      status: String(row.status ?? "active"),
      current_period_end: row.current_period_end ? String(row.current_period_end) : null,
      stripe_customer_id: row.stripe_customer_id ? String(row.stripe_customer_id) : null,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
