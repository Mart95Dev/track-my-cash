import type { Client } from "@libsql/client";

/**
 * Migrations per-user DB — exécutées à chaque getUserDb (idempotent via try/catch).
 * Les tables per-user (accounts, transactions, etc.) sont gérées via db.ts/initSchema.
 * Ce fichier gère les migrations spécifiques aux features nouvelles.
 */
const PER_USER_MIGRATIONS = [
  // STORY-095 — Table notifications (TEXT PRIMARY KEY + metadata)
  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    metadata TEXT
  )`,
  "ALTER TABLE notifications ADD COLUMN metadata TEXT",
  "CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read, created_at DESC)",
];

/**
 * Initialise le schéma de la DB per-user.
 * À appeler après `getUserDb()`. Idempotent (try/catch sur chaque migration).
 */
export async function initUserSchema(db: Client): Promise<void> {
  for (const sql of PER_USER_MIGRATIONS) {
    try {
      await db.execute(sql);
    } catch {
      // Colonne ou table déjà existante — ignoré
    }
  }
}
