/**
 * GET /api/mobile/subscription/portal-url — URL portail Stripe (STORY-143)
 * AC-2 : Retourne l'URL du portail billing Stripe
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { stripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(req: Request) {
  try {
    const userId = await getMobileUserId(req);

    const db = getDb();
    const result = await db.execute({
      sql: "SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?",
      args: [userId],
    });

    if (result.rows.length === 0 || !result.rows[0].stripe_customer_id) {
      return jsonError(404, "Aucun abonnement trouvé");
    }

    const stripeCustomerId = String(result.rows[0].stripe_customer_id);
    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/fr/parametres?tab=billing`,
    });

    return jsonOk({ url: portalSession.url });
  } catch (err) {
    if (err instanceof Response) throw err;
    return jsonError(500, "Erreur interne du serveur");
  }
}
