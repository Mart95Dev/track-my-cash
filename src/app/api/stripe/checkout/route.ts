import { stripe } from "@/lib/stripe";
import { PLANS } from "@/lib/stripe-plans";
import { getRequiredSession } from "@/lib/auth-utils";

export async function POST(req: Request) {
  const { planId } = (await req.json()) as { planId: string };
  const session = await getRequiredSession();
  const userId = session.user.id;
  const userEmail = session.user.email;

  const plan = PLANS[planId as keyof typeof PLANS];
  if (!plan || !plan.stripePriceId) {
    return Response.json({ error: "Plan invalide" }, { status: 400 });
  }

  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    customer_email: userEmail,
    metadata: { userId, planId },
    success_url: `${baseUrl}/fr/parametres?tab=billing&success=true`,
    cancel_url: `${baseUrl}/fr/tarifs`,
    subscription_data: {
      metadata: { userId, planId },
    },
  });

  return Response.json({ url: checkoutSession.url });
}
