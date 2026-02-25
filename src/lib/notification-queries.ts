import type { Client } from "@libsql/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | "low_balance"
  | "couple_balance"
  | "goal_reached"
  | "partner_tx";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  metadata: string | null;
}

// ─── ID generation ────────────────────────────────────────────────────────────

function generateNotifId(): string {
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Crée une notification dans la per-user DB.
 * `body` est stocké dans la colonne `message` pour compatibilité.
 */
export async function createNotification(
  db: Client,
  type: NotificationType,
  title: string,
  body: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const id = generateNotifId();
  await db.execute({
    sql: "INSERT INTO notifications (id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)",
    args: [id, type, title, body, metadata ? JSON.stringify(metadata) : null],
  });
}

/**
 * Retourne le nombre de notifications non lues.
 */
export async function getUnreadCount(db: Client): Promise<number> {
  const result = await db.execute({
    sql: "SELECT COUNT(*) as count FROM notifications WHERE read = 0",
    args: [],
  });
  return Number(result.rows[0]?.count ?? 0);
}

/**
 * Marque toutes les notifications non lues comme lues.
 */
export async function markAllRead(db: Client): Promise<void> {
  await db.execute({
    sql: "UPDATE notifications SET read = 1 WHERE read = 0",
    args: [],
  });
}

/**
 * Retourne les `limit` dernières notifications, ordre anti-chronologique.
 */
export async function getNotifications(
  db: Client,
  limit = 50
): Promise<AppNotification[]> {
  const result = await db.execute({
    sql: "SELECT id, type, title, message, read, created_at, metadata FROM notifications ORDER BY created_at DESC LIMIT ?",
    args: [limit],
  });
  return result.rows.map((row) => ({
    id: String(row.id),
    type: String(row.type) as NotificationType,
    title: String(row.title),
    body: String(row.message),
    read: Number(row.read) === 1,
    created_at: String(row.created_at),
    metadata: row.metadata != null ? String(row.metadata) : null,
  }));
}
