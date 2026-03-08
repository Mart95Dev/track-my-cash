import type { Client } from "@libsql/client";

export async function getSetting(db: Client, key: string): Promise<string | null> {
  const result = await db.execute({ sql: "SELECT value FROM settings WHERE key = ?", args: [key] });
  return result.rows.length > 0 ? String(result.rows[0].value) : null;
}

export async function setSetting(db: Client, key: string, value: string): Promise<void> {
  await db.execute({
    sql: "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    args: [key, value],
  });
}

export async function getAllSettings(db: Client): Promise<{ key: string; value: string }[]> {
  const result = await db.execute("SELECT key, value FROM settings ORDER BY key");
  return result.rows.map((row) => ({
    key: String(row.key),
    value: String(row.value),
  }));
}
