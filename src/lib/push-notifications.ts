import webpush from "web-push";
import { getDb } from "@/lib/db";

// Configuration VAPID
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_EMAIL = process.env.VAPID_EMAIL ?? "contact@track-my-cash.fr";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${VAPID_EMAIL}`,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
}

/**
 * Sauvegarde une souscription push pour un utilisateur
 */
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionJSON
): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `INSERT OR REPLACE INTO push_subscriptions (user_id, endpoint, keys_p256dh, keys_auth, created_at)
          VALUES (?, ?, ?, ?, datetime('now'))`,
    args: [
      userId,
      subscription.endpoint ?? "",
      (subscription.keys as Record<string, string>)?.p256dh ?? "",
      (subscription.keys as Record<string, string>)?.auth ?? "",
    ],
  });
}

/**
 * Supprime la souscription push d'un utilisateur
 */
export async function removePushSubscription(userId: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "DELETE FROM push_subscriptions WHERE user_id = ?",
    args: [userId],
  });
}

/**
 * Envoie une notification push à un utilisateur
 */
export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;

  const db = getDb();
  const result = await db.execute({
    sql: "SELECT endpoint, keys_p256dh, keys_auth FROM push_subscriptions WHERE user_id = ?",
    args: [userId],
  });

  if (result.rows.length === 0) return false;

  const row = result.rows[0];
  const subscription = {
    endpoint: String(row.endpoint),
    keys: {
      p256dh: String(row.keys_p256dh),
      auth: String(row.keys_auth),
    },
  };

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon ?? "/icons/icon-192.png",
        data: { url: payload.url ?? "/dashboard" },
        tag: payload.tag,
      })
    );
    return true;
  } catch (err: unknown) {
    // Si le subscription est expiré (410 Gone), on le supprime
    if (err instanceof webpush.WebPushError && err.statusCode === 410) {
      await removePushSubscription(userId);
    }
    return false;
  }
}

/**
 * Vérifie si un utilisateur a une souscription push active
 */
export async function hasPushSubscription(userId: string): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT COUNT(*) as count FROM push_subscriptions WHERE user_id = ?",
    args: [userId],
  });
  return Number(result.rows[0]?.count ?? 0) > 0;
}

/**
 * Retourne la clé publique VAPID pour le client
 */
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}
