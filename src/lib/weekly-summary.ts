import type { Client } from "@libsql/client";
import { getDb, getUserDb } from "@/lib/db";
import { getWeeklySummaryData } from "@/lib/queries";
import {
  getCoupleByUserId,
  getCoupleMembers,
  getCoupleWeeklyStats,
  type CoupleWeeklyData,
} from "@/lib/couple-queries";
import { getUserPlanId } from "@/lib/subscription-utils";

export type { CoupleWeeklyData };

export interface EnrichedWeeklySummaryData {
  weekStart: string;
  weekEnd: string;
  totalExpenses: number;
  totalIncome: number;
  topCategories: { category: string; amount: number }[];
  budgetsOver: { category: string; spent: number; limit: number }[];
  goalsProgress: { name: string; percent: number }[];
  coupleWeekly?: CoupleWeeklyData;
}

/**
 * Enrichit le résumé hebdomadaire avec les statistiques couple
 * pour les abonnés Pro/Premium ayant un couple actif.
 */
export async function computeWeeklySummary(
  userId: string,
  userDb: Client,
  weekStart: string,
  weekEnd: string
): Promise<EnrichedWeeklySummaryData> {
  const [weeklySummary, planId] = await Promise.all([
    getWeeklySummaryData(userDb, weekStart, weekEnd),
    getUserPlanId(userId),
  ]);

  let coupleWeekly: CoupleWeeklyData | undefined;

  if (planId === "pro" || planId === "premium") {
    const mainDb = getDb();
    const couple = await getCoupleByUserId(mainDb, userId);

    if (couple) {
      const members = await getCoupleMembers(mainDb, couple.id);
      const otherMember = members.find(
        (m) => m.user_id !== userId && m.status === "active"
      );

      if (otherMember) {
        const otherUserDb = await getUserDb(otherMember.user_id);

        const partnerRow = await mainDb.execute({
          sql: "SELECT name, email FROM user WHERE id = ?",
          args: [otherMember.user_id],
        });
        const partnerName = String(
          partnerRow.rows[0]?.name ?? partnerRow.rows[0]?.email ?? "Partenaire"
        );

        const stats = await getCoupleWeeklyStats(
          userDb,
          otherUserDb,
          userId,
          otherMember.user_id,
          weekStart
        );

        coupleWeekly = { ...stats, partnerName };
      }
    }
  }

  return { ...weeklySummary, coupleWeekly };
}
