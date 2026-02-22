import type { Client } from "@libsql/client";

const TRIAL_DAYS = 14;

export interface TrialSubscription {
  plan: "free" | "pro" | "premium";
  status: "inactive" | "active" | "trialing" | "canceled" | "expired";
  trial_ends_at?: string | null;
}

export function isInTrial(subscription: TrialSubscription | null): boolean {
  if (!subscription) return false;
  if (subscription.status !== "trialing") return false;
  if (!subscription.trial_ends_at) return false;
  return new Date(subscription.trial_ends_at) > new Date();
}

export function getDaysRemaining(trial_ends_at: string): number {
  const end = new Date(trial_ends_at).getTime();
  const now = Date.now();
  const diff = Math.floor((end - now) / 86400000);
  return Math.max(0, diff);
}

export async function createTrialSubscription(
  mainDb: Client,
  userId: string
): Promise<void> {
  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString();
  const id = `trial_${userId}_${Date.now()}`;

  await mainDb.execute({
    sql: `INSERT INTO subscriptions (id, user_id, plan_id, status, trial_ends_at)
          VALUES (?, ?, 'pro', 'trialing', ?)
          ON CONFLICT(user_id) DO NOTHING`,
    args: [id, userId, trialEndsAt],
  });
}
