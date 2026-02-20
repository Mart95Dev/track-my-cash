import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      if (userId && planId && session.subscription) {
        await upsertSubscription(userId, {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          planId,
          status: "active",
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (userId) {
        // current_period_end is on SubscriptionItem in API version 2025-01-27.acacia
        const firstItem = sub.items.data[0];
        const currentPeriodEnd = firstItem?.current_period_end;
        await upsertSubscription(userId, {
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          planId: sub.metadata?.planId ?? "free",
          status: sub.status === "active" ? "active" : "inactive",
          currentPeriodEnd,
          cancelAtPeriodEnd: sub.cancel_at_period_end ? 1 : 0,
        });
      }
      break;
    }
  }

  return new Response("OK", { status: 200 });
}

async function upsertSubscription(
  userId: string,
  data: {
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    planId: string;
    status: string;
    currentPeriodEnd?: number;
    cancelAtPeriodEnd?: number;
  }
) {
  const { createClient } = await import("@libsql/client");
  const db = createClient({
    url: process.env.DATABASE_URL_TURSO ?? "file:./dev-auth.db",
    authToken: process.env.API_KEY_TURSO,
  });

  await db.execute({
    sql: `INSERT INTO subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, plan_id, status, current_period_end, cancel_at_period_end)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            stripe_customer_id = excluded.stripe_customer_id,
            stripe_subscription_id = excluded.stripe_subscription_id,
            plan_id = excluded.plan_id,
            status = excluded.status,
            current_period_end = excluded.current_period_end,
            cancel_at_period_end = excluded.cancel_at_period_end`,
    args: [
      `sub_${userId}`,
      userId,
      data.stripeCustomerId,
      data.stripeSubscriptionId,
      data.planId,
      data.status,
      data.currentPeriodEnd ?? null,
      data.cancelAtPeriodEnd ?? 0,
    ],
  });
}
