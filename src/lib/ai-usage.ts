import type { Client } from "@libsql/client";

const PRO_MONTHLY_LIMIT = 10;

export async function incrementAiUsage(
  mainDb: Client,
  userId: string,
  month: string // "YYYY-MM"
): Promise<void> {
  await mainDb.execute({
    sql: "INSERT INTO ai_usage (user_id, month, count) VALUES (?, ?, 1) ON CONFLICT(user_id, month) DO UPDATE SET count = count + 1",
    args: [userId, month],
  });
}

export async function getAiUsageCount(
  mainDb: Client,
  userId: string,
  month: string
): Promise<number> {
  const result = await mainDb.execute({
    sql: "SELECT count FROM ai_usage WHERE user_id = ? AND month = ?",
    args: [userId, month],
  });
  if (result.rows.length === 0) return 0;
  return Number(result.rows[0].count ?? 0);
}

export function checkAiLimit(
  plan: "free" | "pro" | "premium",
  currentCount: number
): { allowed: boolean; reason?: string } {
  if (plan === "premium") return { allowed: true };
  if (plan === "pro") {
    if (currentCount >= PRO_MONTHLY_LIMIT) {
      return {
        allowed: false,
        reason: `Limite de ${PRO_MONTHLY_LIMIT} conversations IA par mois atteinte. Passez en Premium pour un accès illimité.`,
      };
    }
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: "Le conseiller IA est disponible à partir du plan Pro.",
  };
}
