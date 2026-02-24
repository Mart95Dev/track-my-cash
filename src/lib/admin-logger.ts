import type { Client } from "@libsql/client";

/**
 * Écrit un événement dans la table admin_logs de la DB principale.
 * Utilisé par les crons, webhooks et actions serveur pour que le
 * dashboard admin puisse les consulter via /logs.
 */
export async function writeAdminLog(
  db: Client,
  type: string,
  userId: string | null,
  message: string,
  payload?: Record<string, unknown>
): Promise<void> {
  const payloadStr = payload != null ? JSON.stringify(payload) : null;
  await db.execute({
    sql: `INSERT INTO admin_logs (type, user_id, message, payload) VALUES (?, ?, ?, ?)`,
    args: [type, userId, message, payloadStr],
  });
}
