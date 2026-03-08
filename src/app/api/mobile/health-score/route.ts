/**
 * GET /api/mobile/health-score — Score de santé financière
 * STORY-060
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { getDashboardData } from "@/lib/queries/dashboard-queries";
import { getBudgetStatus } from "@/lib/queries/budget-queries";
import { getGoals } from "@/lib/queries/goal-queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const dashboard = await getDashboardData(db);

    // Calcul du score de santé financière
    let score = 50; // Base
    const { monthlyIncome, monthlyExpenses, recurringMonthly } = dashboard;

    // Taux d'épargne (0-30 pts)
    if (monthlyIncome > 0) {
      const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome;
      if (savingsRate >= 0.2) score += 30;
      else if (savingsRate >= 0.1) score += 20;
      else if (savingsRate >= 0) score += 10;
      else score -= 10;
    }

    // Charges fixes vs revenus (0-10 pts)
    if (monthlyIncome > 0 && recurringMonthly / monthlyIncome < 0.5) {
      score += 10;
    }

    // Budgets respectés (0-10 pts)
    const accounts = dashboard.accounts;
    let budgetScore = 10;
    for (const account of accounts) {
      const statuses = await getBudgetStatus(db, account.id);
      for (const s of statuses) {
        if (s.percentage > 100) budgetScore -= 2;
      }
    }
    score += Math.max(0, budgetScore);

    // Objectifs en cours
    const goals = await getGoals(db);
    const activeGoals = goals.filter((g) => g.current_amount < g.target_amount);
    if (activeGoals.length > 0) score = Math.min(100, score + 5);

    score = Math.max(0, Math.min(100, score));

    const level =
      score >= 80 ? "excellent" : score >= 60 ? "bon" : score >= 40 ? "moyen" : "critique";

    return jsonOk({
      score,
      level,
      details: {
        savingsRate:
          monthlyIncome > 0
            ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
            : 0,
        recurringRatio:
          monthlyIncome > 0 ? Math.round((recurringMonthly / monthlyIncome) * 100) : 0,
        activeGoals: activeGoals.length,
      },
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
