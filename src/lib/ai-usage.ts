import type { Client } from "@libsql/client";

export const PRO_CHAT_LIMIT = 50;
export const PRO_INSIGHTS_LIMIT = 30;

export type AiUsageType = "chat" | "insights";

function monthKey(month: string, type: AiUsageType): string {
  return type === "chat" ? month : `${month}:${type}`;
}

export async function incrementAiUsage(
  mainDb: Client,
  userId: string,
  month: string, // "YYYY-MM"
  type: AiUsageType = "chat"
): Promise<void> {
  await mainDb.execute({
    sql: "INSERT INTO ai_usage (user_id, month, count) VALUES (?, ?, 1) ON CONFLICT(user_id, month) DO UPDATE SET count = count + 1",
    args: [userId, monthKey(month, type)],
  });
}

export async function getAiUsageCount(
  mainDb: Client,
  userId: string,
  month: string,
  type: AiUsageType = "chat"
): Promise<number> {
  const result = await mainDb.execute({
    sql: "SELECT count FROM ai_usage WHERE user_id = ? AND month = ?",
    args: [userId, monthKey(month, type)],
  });
  if (result.rows.length === 0) return 0;
  return Number(result.rows[0].count ?? 0);
}

export function checkAiLimit(
  plan: "free" | "pro" | "premium",
  currentCount: number,
  type: AiUsageType = "chat"
): { allowed: boolean; reason?: string } {
  if (plan === "premium") return { allowed: true };
  if (plan === "pro") {
    const limit = type === "chat" ? PRO_CHAT_LIMIT : PRO_INSIGHTS_LIMIT;
    const label = type === "chat" ? "requêtes IA" : "insights IA";
    if (currentCount >= limit) {
      return {
        allowed: false,
        reason: `Limite de ${limit} ${label} par mois atteinte. Passez en Premium pour un accès illimité.`,
      };
    }
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: "Le conseiller IA est disponible à partir du plan Pro.",
  };
}
