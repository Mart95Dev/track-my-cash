"use server";

import { getRequiredSession } from "@/lib/auth-utils";
import { stripe } from "@/lib/stripe";
import { createClient } from "@libsql/client";

async function getMainDb() {
  return createClient({
    url: process.env.DATABASE_URL_TURSO ?? "file:./dev-auth.db",
    authToken: process.env.API_KEY_TURSO,
  });
}

export async function getUserSubscription() {
  const session = await getRequiredSession();
  const db = await getMainDb();

  const result = await db.execute({
    sql: "SELECT * FROM subscriptions WHERE user_id = ?",
    args: [session.user.id],
  });

  if (result.rows.length === 0) return { planId: "free", status: "active" };

  const row = result.rows[0];
  return {
    planId: String(row.plan_id ?? "free"),
    status: String(row.status ?? "active"),
    currentPeriodEnd: row.current_period_end ? Number(row.current_period_end) : null,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    stripeCustomerId: row.stripe_customer_id ? String(row.stripe_customer_id) : null,
    stripeSubscriptionId: row.stripe_subscription_id ? String(row.stripe_subscription_id) : null,
  };
}

export async function createBillingPortalSession() {
  const sub = await getUserSubscription();

  if (!sub.stripeCustomerId) {
    return { error: "Aucun abonnement actif" };
  }

  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${baseUrl}/fr/parametres?tab=billing`,
  });

  return { url: portalSession.url };
}
