import type { Client } from "@libsql/client";
import type { Notification } from "./types";
import { rowToNotification } from "./mappers";

export async function getNotifications(db: Client, limit = 10): Promise<Notification[]> {
  const result = await db.execute({
    sql: "SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?",
    args: [limit],
  });
  return result.rows.map(rowToNotification);
}

export async function getUnreadNotificationsCount(db: Client): Promise<number> {
  const result = await db.execute({
    sql: "SELECT COUNT(*) as count FROM notifications WHERE read = 0",
    args: [],
  });
  return Number(result.rows[0]?.count ?? 0);
}

export async function createNotification(
  db: Client,
  type: Notification["type"],
  title: string,
  message: string
): Promise<void> {
  await db.execute({
    sql: "INSERT INTO notifications (type, title, message) VALUES (?, ?, ?)",
    args: [type, title, message],
  });
}

export async function markNotificationRead(db: Client, id: number): Promise<void> {
  await db.execute({ sql: "UPDATE notifications SET read = 1 WHERE id = ?", args: [id] });
}

export async function markAllNotificationsRead(db: Client): Promise<void> {
  await db.execute({ sql: "UPDATE notifications SET read = 1 WHERE read = 0", args: [] });
}
