import { getAllAccounts, getMonthlySummary, getGoals, getBudgetStatus } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { getUserPlanId } from "@/lib/subscription-utils";
import { AiChat } from "@/components/ai-chat";
import { generateChatSuggestions } from "@/lib/chat-suggestions";

export const dynamic = "force-dynamic";

export default async function ConseillerPage() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const [accounts, monthlySummary, goals, planId] = await Promise.all([
    getAllAccounts(db),
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

  const isPremium = planId === "premium";

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[28px]">smart_toy</span>
          <h1 className="text-xl font-bold text-text-main">Conseiller IA</h1>
        </div>
        <span
          className={`text-xs font-bold rounded-full px-3 py-1 ${
            isPremium ? "bg-primary text-white" : "bg-indigo-50 text-primary"
          }`}
        >
          {isPremium ? "Premium" : "Pro"}
        </span>
      </header>
      <AiChat
        accounts={accounts}
        hasApiKey={!!process.env.API_KEY_OPENROUTER}
        suggestions={suggestions}
        isPremium={isPremium}
      />
    </div>
  );
}
