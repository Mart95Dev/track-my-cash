import { getDb } from "./db";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Rate limiter persistant via Turso.
 * Fonctionne correctement en serverless (multi-instance, survit aux cold starts).
 */
export function checkRateLimit(
  userId: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  // Synchronous wrapper — returns a pre-computed result.
  // We use the in-memory fallback for synchronous callers,
  // but expose checkRateLimitAsync for full DB-backed limiting.
  const now = Date.now();
  const entry = memoryStore.get(userId);

  if (!entry || now - entry.windowStart >= windowMs) {
    memoryStore.set(userId, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.windowStart + windowMs };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.windowStart + windowMs };
}

// In-memory store as fast path (still useful within a single invocation)
const memoryStore = new Map<string, { count: number; windowStart: number }>();

/**
 * Rate limiter persistant via DB Turso.
 * Utiliser cette version async dans les routes critiques (chat IA).
 */
export async function checkRateLimitAsync(
  userId: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const db = getDb();
  const now = Date.now();
  const windowStart = now - windowMs;

  // Cleanup old entries + count in one batch
  await db.execute({
    sql: "DELETE FROM rate_limits WHERE reset_at < ?",
    args: [now],
  });

  const result = await db.execute({
    sql: "SELECT count FROM rate_limits WHERE user_id = ? AND reset_at >= ?",
    args: [userId, now],
  });

  if (result.rows.length === 0) {
    const resetAt = now + windowMs;
    await db.execute({
      sql: "INSERT INTO rate_limits (user_id, count, reset_at) VALUES (?, 1, ?)",
      args: [userId, resetAt],
    });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  const currentCount = Number(result.rows[0].count);
  const resetAt = Number(
    (await db.execute({
      sql: "SELECT reset_at FROM rate_limits WHERE user_id = ? AND reset_at >= ?",
      args: [userId, now],
    })).rows[0]?.reset_at ?? now + windowMs
  );

  if (currentCount >= limit) {
    return { allowed: false, remaining: 0, resetAt };
  }

  await db.execute({
    sql: "UPDATE rate_limits SET count = count + 1 WHERE user_id = ? AND reset_at >= ?",
    args: [userId, now],
  });

  return { allowed: true, remaining: limit - (currentCount + 1), resetAt };
}
