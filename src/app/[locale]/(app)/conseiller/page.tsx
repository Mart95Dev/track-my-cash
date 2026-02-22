import { getAllAccounts, getMonthlySummary, getGoals, getBudgetStatus } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { getUserPlanId } from "@/lib/subscription-utils";
import { AiChat } from "@/components/ai-chat";
import { generateChatSuggestions } from "@/lib/chat-suggestions";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ConseillerPage() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const [accounts, t, monthlySummary, goals, planId] = await Promise.all([
    getAllAccounts(db),
    getTranslations("advisor"),
    getMonthlySummary(db),
    getGoals(db),
    getUserPlanId(userId),
  ]);

  // Budget statuses — nécessite les IDs des comptes (chargés en phase 1)
  const budgetStatusesList = await Promise.all(
    accounts.map((acc) => getBudgetStatus(db, acc.id))
  );
  const allBudgetStatuses = budgetStatusesList.flat();

  // Budgets dépassés (dédupliqués par catégorie)
  const seenCategories = new Set<string>();
  const exceededBudgets = allBudgetStatuses
    .filter((b) => b.spent > b.limit)
    .filter((b) => {
      if (seenCategories.has(b.category)) return false;
      seenCategories.add(b.category);
      return true;
    })
    .map((b) => ({ category: b.category }));

  // Objectifs en retard : < 50% atteint ET deadline dans les 3 prochains mois
  const now = new Date();
  const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
  const lateGoals = goals
    .filter((g) => {
      const progress = g.target_amount > 0 ? g.current_amount / g.target_amount : 0;
      if (progress >= 0.5) return false;
      if (!g.deadline) return false;
      return new Date(g.deadline) <= threeMonthsLater;
    })
    .map((g) => ({ name: g.name }));

  // Taux d'épargne moyen (3 derniers mois avec revenus > 0)
  const recentMonths = monthlySummary.slice(0, 3).filter((m) => m.income > 0);
  const avgSavingsRate =
    recentMonths.length > 0
      ? recentMonths.reduce((sum, m) => sum + (m.savingsRate ?? 0), 0) / recentMonths.length
      : 0;

  const suggestions = generateChatSuggestions({
    exceededBudgets,
    lateGoals,
    savingsRate: avgSavingsRate,
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("title")}</h2>
      <AiChat
        accounts={accounts}
        hasApiKey={!!process.env.API_KEY_OPENROUTER}
        suggestions={suggestions}
        isPremium={planId === "premium"}
      />
    </div>
  );
}
