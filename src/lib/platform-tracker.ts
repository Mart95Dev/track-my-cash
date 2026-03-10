import type { Client } from "@libsql/client";

/**
 * Enregistre ou met à jour la plateforme d'un utilisateur.
 * UPSERT : si la combinaison (user_id, platform) existe, met à jour last_seen_at et app_version.
 */
export async function upsertUserPlatform(
  db: Client,
  userId: string,
  platform: "web" | "android" | "ios",
  appVersion?: string | null
): Promise<void> {
  await db.execute({
    sql: `INSERT INTO user_platforms (user_id, platform, app_version, last_seen_at, first_seen_at)
          VALUES (?, ?, ?, unixepoch(), unixepoch())
          ON CONFLICT(user_id, platform) DO UPDATE SET
            last_seen_at = unixepoch(),
            app_version = COALESCE(excluded.app_version, user_platforms.app_version)`,
    args: [userId, platform, appVersion ?? null],
  });
}
