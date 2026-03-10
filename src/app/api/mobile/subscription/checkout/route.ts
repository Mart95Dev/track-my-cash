/**
 * POST /api/mobile/subscription/checkout — Creer une session Stripe Checkout (STORY-143)
 * AC-1 : Retourne l'URL de checkout Stripe
 * AC-3 : Rejette les plans invalides
 * AC-4 : Requiert auth JWT
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { stripe } from "@/lib/stripe";
import { PLANS } from "@/lib/stripe-plans";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);

    const { planId } = (await req.json()) as { planId?: string };

    const plan = planId ? PLANS[planId as keyof typeof PLANS] : undefined;
    if (!plan || !plan.stripePriceId) {
      return jsonError(400, "Plan invalide");
    }

    // Recuperer l'email de l'utilisateur
    const db = getDb();
    const userResult = await db.execute({
      sql: "SELECT email FROM user WHERE id = ?",
      args: [userId],
    });

    const email = userResult.rows.length > 0 ? String(userResult.rows[0].email) : undefined;

    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      customer_email: email,
      metadata: { userId, planId: plan.id },
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      success_url: `${baseUrl}/fr/bienvenue?plan=${plan.id}`,
      cancel_url: `${baseUrl}/fr/tarifs`,
      subscription_data: {
        metadata: { userId, planId: plan.id },
      },
    });

    return jsonOk({ url: checkoutSession.url });
  } catch (err) {
    if (err instanceof Response) throw err;
    return jsonError(500, "Erreur interne du serveur");
  }
}
