import { getAllAccounts, getMonthlySummary, getGoals, getBudgetStatus } from "@/lib/queries";
import { getUserDb, getDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { getUserPlanId } from "@/lib/subscription-utils";
import { AiChat } from "@/components/ai-chat";
import { generateChatSuggestions } from "@/lib/chat-suggestions";
import { getCoupleByUserId } from "@/lib/couple-queries";

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

  const personalSuggestions = generateChatSuggestions({
    exceededBudgets,
    lateGoals,
    savingsRate: avgSavingsRate,
  });

  const isPremium = planId === "premium";

  // ─── Couple section ────────────────────────────────────────────────────────
  let hasCoupleActive = false;
  let coupleId: string | undefined;

  try {
    const mainDb = getDb();
    const couple = await getCoupleByUserId(mainDb, userId);
    if (couple) {
      hasCoupleActive = true;
      coupleId = couple.id;
    }
  } catch {
    // Silencieux — couple non critique
  }

  const coupleSuggestions = [
    "Analyse nos dépenses communes ce mois",
    "Qui a le plus dépensé ce mois-ci ?",
    "Quelle est notre balance couple ?",
  ];

  const suggestions =
    hasCoupleActive && isPremium
      ? [...coupleSuggestions, ...personalSuggestions].slice(0, 5)
      : personalSuggestions;

  return (
    <div className="flex flex-col bg-[#F8F7FC] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#F8F7FC]/95 backdrop-blur-md px-4 pt-12 pb-4 flex items-center justify-between border-b border-[#EEEEEE]">
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#F0EEFF] transition-colors">
            <span className="material-symbols-outlined text-[#212121] text-[20px]">arrow_back_ios_new</span>
          </button>
          <h1 className="text-xl font-bold text-[#212121]">Conseiller IA</h1>
        </div>
        <span className="text-xs font-semibold rounded-full px-3 py-1 bg-[#F0EEFF] text-[#6C5CE7]">
          Premium
        </span>
      </header>

      <AiChat
        accounts={accounts}
        hasApiKey={!!process.env.API_KEY_OPENROUTER}
        suggestions={suggestions}
        isPremium={isPremium}
        canAI={planId === "pro" || planId === "premium"}
        hasCoupleActive={hasCoupleActive}
        coupleId={coupleId}
      />
    </div>
  );
}
