import {
  getDashboardData,
  getMonthlyBalanceHistory,
  getExpensesByCategory,
  getExpensesByBroadCategory,
  getMonthlySummary,
  getSpendingTrend,
  getAllAccounts,
  getSetting,
  getBudgetStatus,
  getGoals,
  getMonthlyExpensesByCategory,
  getTransactions,
} from "@/lib/queries";
import { formatCurrency } from "@/lib/format";
import { getUserDb, getDb } from "@/lib/db";
import { getRequiredSession } from "@/lib/auth-utils";
import { getAllRates, convertToReference, REFERENCE_CURRENCY } from "@/lib/currency";
import { BalanceEvolutionChart } from "@/components/charts/balance-evolution-chart";
import { IncomeExpenseBarChart } from "@/components/charts/income-expense-bar-chart";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { BudgetProgress } from "@/components/budget-progress";
import { SavingsGoalsWidget } from "@/components/savings-goals-widget";
import { AccountFilter } from "@/components/account-filter";
import { KpiCards } from "@/components/kpi-cards";
import { BalanceCard } from "@/components/balance-card";
import { HealthScoreWidget } from "@/components/health-score-widget";
import { YoYComparisonWidget } from "@/components/yoy-comparison-widget";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import { computeMoMVariation, computeYoYComparison } from "@/lib/mom-calculator";
import { computeHealthScore, computeGlobalHealthScore } from "@/lib/health-score";
import { MonthlySummary } from "@/components/monthly-summary";
import { CoupleDashboard } from "@/components/couple-dashboard";
import { CoupleOnboardingWizard } from "@/components/couple-onboarding-wizard";
import { getCoupleByUserId, getCoupleMembers, getOnboardingStatus, getOnboardingChoice } from "@/lib/couple-queries";
import { CoupleChoiceModal } from "@/components/couple-choice-modal";
import type { CoupleMember } from "@/lib/couple-queries";

import { CoupleLockedPreview } from "@/components/couple-locked-preview";
import { OnboardingProgressBar } from "@/components/onboarding-progress-bar";
import { computeOnboardingProgress } from "@/lib/onboarding-progress";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string; view?: string }>;
}) {
  const params = await searchParams;
  const isAll = params.accountId === "all";
  const accountId = (!isAll && params.accountId) ? parseInt(params.accountId) : undefined;
  const locale = await getLocale();

  const session = await getRequiredSession(locale);
  const userId = session.user.id;
  const db = await getUserDb(userId);

  const view = params.view ?? "personal";

  // Charger le couple de l'utilisateur (silencieux si erreur)
  let couple: Awaited<ReturnType<typeof getCoupleByUserId>> = null;
  let coupleMembers: CoupleMember[] = [];
  try {
    couple = await getCoupleByUserId(getDb(), userId);
    if (couple) {
      coupleMembers = await getCoupleMembers(getDb(), couple.id);
    }
  } catch {
    // couple features not available
  }
  const partnerMember = coupleMembers.find((m) => m.user_id !== userId);
  const hasCoupleActive = couple !== null;

  // STORY-105: daysSinceCreation pour afficher la barre de progression
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(session.user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const userName = session.user.name ?? "";
  const firstName = userName.split(" ")[0] ?? "vous";

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const previousYear = currentYear - 1;

  const [data, balanceHistory, , expensesByBroad, monthlySummary, spendingTrend, rates, accounts, refCurrencySetting, budgetStatuses, onboardingCompleted, goals, yoyCurrent, yoyPrevious, coupleOnboardingCompleted,
      coupleOnboardingChoice, recentTransactions] =
    await Promise.all([
      getDashboardData(db, accountId),
      getMonthlyBalanceHistory(db, 12, accountId),
      getExpensesByCategory(db, accountId),
      getExpensesByBroadCategory(db, accountId),
      getMonthlySummary(db, accountId),
      getSpendingTrend(db, 6, accountId),
      getAllRates(db),
      getAllAccounts(db),
      getSetting(db, "reference_currency"),
      accountId ? getBudgetStatus(db, accountId) : Promise.resolve([]),
      getSetting(db, "onboarding_completed"),
      getGoals(db),
      getMonthlyExpensesByCategory(db, accountId, currentYear, currentMonth),
      getMonthlyExpensesByCategory(db, accountId, previousYear, currentMonth),
      getOnboardingStatus(db),
      getOnboardingChoice(db),
      getTransactions(db, accountId, 5),
    ]);

  // STORY-105: Vérifier si l'utilisateur a au moins 1 budget couple
  let hasCoupleBudget = false;
  try {
    const coupleBudgetResult = await db.execute({
      sql: "SELECT COUNT(*) as n FROM budgets WHERE scope = 'couple'",
      args: [],
    });
    hasCoupleBudget = Number(coupleBudgetResult.rows[0]?.n ?? 0) > 0;
  } catch {
    // budgets table may not have scope column
  }

  const hasTransactions = data.monthlyExpenses > 0 || data.monthlyIncome > 0 || data.recurringMonthly > 0;
  const hasPartner = coupleMembers.length >= 2;
  const onboardingProgress = computeOnboardingProgress({ hasTransactions, hasPartner, hasCoupleBudget });

  const showCoupleChoiceModal = !coupleOnboardingChoice && accounts.length === 0;
  // OnboardingWizard seulement après le choix couple (évite 2 modals empilés)
  const showOnboarding = !onboardingCompleted && accounts.length === 0 && !showCoupleChoiceModal;
  const showCoupleOnboarding = !coupleOnboardingCompleted && accounts.length > 0;
  const refCurrency = refCurrencySetting ?? REFERENCE_CURRENCY;

  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const prevSummary = monthlySummary.find((m) => m.month === prevMonthKey);
  const incomeVariation = computeMoMVariation(data.monthlyIncome, prevSummary?.income ?? null);

  const healthScore = isAll
    ? (() => {
        const perAccountScores = data.accounts.map((acc) => {
          const balance = convertToReference(
            acc.calculated_balance ?? acc.initial_balance,
            acc.currency,
            rates
          );
          const score = computeHealthScore({
            monthlySummaries: monthlySummary.slice(0, 3).map((m) => ({ income: m.income, expenses: m.expenses })),
            budgets: [],
            goals: goals.map((g) => ({ target_amount: g.target_amount, current_amount: g.current_amount })),
          });
          return { score: score.total, balance };
        });
        const globalTotal = computeGlobalHealthScore(perAccountScores);
        const baseScore = computeHealthScore({
          monthlySummaries: monthlySummary.slice(0, 3).map((m) => ({ income: m.income, expenses: m.expenses })),
          budgets: [],
          goals: goals.map((g) => ({ target_amount: g.target_amount, current_amount: g.current_amount })),
        });
        return { ...baseScore, total: globalTotal };
      })()
    : computeHealthScore({
        monthlySummaries: monthlySummary.slice(0, 3).map((m) => ({ income: m.income, expenses: m.expenses })),
        budgets: budgetStatuses.map((b) => ({ category: b.category, amount_limit: b.limit, spent: b.spent })),
        goals: goals.map((g) => ({ target_amount: g.target_amount, current_amount: g.current_amount })),
      });

  const yoyData = yoyPrevious.length > 0 ? computeYoYComparison(yoyCurrent, yoyPrevious) : [];

  const totalInRef = (accountId && data.accounts.find(a => a.id === accountId))
    ? (() => {
        const acc = data.accounts.find(a => a.id === accountId)!;
        return convertToReference(acc.calculated_balance ?? acc.initial_balance, acc.currency, rates);
      })()
    : data.accounts.reduce((sum, account) => {
        const balance = account.calculated_balance ?? account.initial_balance;
        return sum + convertToReference(balance, account.currency, rates);
      }, 0);

  const balanceMom = incomeVariation.percentChange ?? undefined;

  // Suppress unused variable warning for spendingTrend (kept for future use)
  void spendingTrend;

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F7FC] px-4 text-center">
        <div className="w-16 h-16 rounded-[20px] bg-[#F0EEFF] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[#6C5CE7] text-[32px]">account_balance_wallet</span>
        </div>
        <h2 className="text-xl font-bold text-[#212121] mb-2">Bienvenue sur Koupli</h2>
        <p className="text-[#757575] text-sm mb-6">Ajoutez un compte pour commencer a suivre vos finances.</p>
        <Link
          href={`/${locale}/comptes`}
          className="bg-[#6C5CE7] text-white font-bold px-6 py-3 rounded-xl"
          style={{ boxShadow: "0 4px 12px rgba(108,92,231,0.25)" }}
        >
          Ajouter un compte
        </Link>
        {showOnboarding && <OnboardingWizard open={true} />}
        {showCoupleChoiceModal && <CoupleChoiceModal open={true} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-2 bg-[#F8F7FC] w-full">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#212121] text-xl font-bold leading-tight">Bonjour, {firstName}</h2>
            <p className="text-[#757575] text-sm mt-0.5">
              Voici le resume de vos finances — {now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase())}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/${locale}/dashboard?view=personal`}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${view !== "couple" ? "bg-[#6C5CE7] text-white" : "bg-white border border-[#EEEEEE] text-[#757575]"}`}
            >
              Personnel
            </Link>
            <Link
              href={`/${locale}/dashboard?view=couple`}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${view === "couple" ? "bg-[#6C5CE7] text-white" : "bg-white border border-[#EEEEEE] text-[#757575]"}`}
            >
              Couple
            </Link>
          </div>
        </div>
      </header>

      {/* Vue couple */}
      {view === "couple" && (
        hasCoupleActive && partnerMember ? (
          <CoupleDashboard
            coupleId={couple!.id}
            userId={userId}
            partnerUserId={partnerMember.user_id}
            locale={locale}
          />
        ) : (
          <div className="mx-4 my-4 bg-[#F0EEFF] rounded-2xl p-5 text-center">
            <div className="w-14 h-14 rounded-[16px] bg-white/60 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[#6C5CE7] text-[28px]">favorite</span>
            </div>
            <p className="text-[#212121] font-bold mb-1">Invitez votre partenaire</p>
            <p className="text-[#757575] text-sm mb-4">Creez un espace couple pour partager vos finances.</p>
            <Link href={`/${locale}/couple`} className="inline-flex items-center justify-center h-10 px-6 bg-[#6C5CE7] text-white font-bold rounded-xl text-sm">
              Creer un espace couple
            </Link>
          </div>
        )
      )}

      {/* Vue personnelle */}
      {view !== "couple" && (
        <>
      {/* Account pills */}
      <AccountFilter accounts={accounts} currentAccountId={isAll ? "all" : accountId} basePath={`/${locale}/dashboard`} />

      {/* Onboarding Progress Bar - STORY-105 */}
      {daysSinceCreation < 30 && (
        <OnboardingProgressBar progress={onboardingProgress} locale={locale} />
      )}

      {/* Balance card */}
      <BalanceCard
        totalBalance={totalInRef}
        currency={refCurrency}
        locale={locale}
        momVariation={balanceMom}
      />

      {/* KPI Cards */}
      <KpiCards
        revenue={data.monthlyIncome}
        expenses={data.monthlyExpenses}
        recurring={data.recurringMonthly}
        currency={refCurrency}
        locale={locale}
      />

      {/* Health Score */}
      <div className="px-4 mb-4">
        <HealthScoreWidget score={healthScore} />
      </div>

      {/* Balance Evolution */}
      {balanceHistory.length > 0 && (
        <div className="mx-4 mb-4 bg-white rounded-2xl border border-[#EEEEEE] p-4" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#212121]">Historique du solde</h3>
            <span className="text-xs font-medium text-[#757575] bg-[#F5F5F5] rounded-full px-2 py-0.5">12 mois</span>
          </div>
          <BalanceEvolutionChart data={balanceHistory} />
        </div>
      )}

      {/* Income vs Expenses Bar Chart — STORY-137 AC-1 */}
      {monthlySummary.length > 0 && (
        <div className="mx-4 mb-4 bg-white rounded-2xl border border-[#EEEEEE] p-4" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#212121]">Revenus vs Depenses</h3>
            <span className="text-xs font-medium text-[#757575] bg-[#F5F5F5] rounded-full px-2 py-0.5">6 mois</span>
          </div>
          <IncomeExpenseBarChart
            data={monthlySummary.slice(0, 6).reverse().map((m) => ({
              month: new Date(m.month + "-02").toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }).replace(".", ""),
              income: m.income,
              expenses: m.expenses,
            }))}
            currency={refCurrency}
          />
        </div>
      )}

      {/* Category Pie Chart — STORY-137 AC-2 */}
      {expensesByBroad.length > 0 && (
        <div className="mx-4 mb-4 bg-white rounded-2xl border border-[#EEEEEE] p-4" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
          <h3 className="text-sm font-bold text-[#212121] mb-3">Repartition des depenses</h3>
          <CategoryPieChart data={expensesByBroad} currency={refCurrency} />
        </div>
      )}

      {/* Espace couple verrouillé - STORY-103 */}
      <CoupleLockedPreview locale={locale} hasCoupleActive={hasCoupleActive} />

      {/* Budgets (3 max) */}
      {budgetStatuses.length > 0 && (
        <section className="px-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-[#212121]">Budgets</h3>
            <Link href={`/${locale}/budgets`} className="text-[#6C5CE7] text-xs font-bold">
              Voir tout
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {budgetStatuses.slice(0, 3).map((b) => (
              <BudgetProgress key={b.category} budget={b} currency={refCurrency} />
            ))}
          </div>
        </section>
      )}

      {/* Objectifs d'épargne */}
      {goals.length > 0 && (
        <section className="px-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-[#212121]">Objectifs d&apos;epargne</h3>
            <Link href={`/${locale}/objectifs`} className="text-[#6C5CE7] text-xs font-bold">
              Voir tout
            </Link>
          </div>
          <SavingsGoalsWidget goals={goals.slice(0, 2)} />
        </section>
      )}

      {/* YoY comparison */}
      {yoyData.length > 0 && (
        <div className="px-4 mb-4">
          <YoYComparisonWidget
            data={yoyData}
            currency={refCurrency}
            locale={locale}
            currentYear={currentYear}
            previousYear={previousYear}
          />
        </div>
      )}

      {/* Monthly summary */}
      <div className="px-4 mb-4">
        <MonthlySummary data={monthlySummary} />
      </div>

      {/* Dernières transactions */}
      {recentTransactions.length > 0 && (
        <section className="px-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-[#212121]">Dernieres transactions</h3>
            <Link href={`/${locale}/transactions`} className="text-[#6C5CE7] text-xs font-bold">
              Voir tout
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-[#EEEEEE] divide-y divide-[#EEEEEE]/50" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#212121] truncate">{tx.description}</p>
                  <p className="text-xs text-[#757575]">{tx.category}</p>
                </div>
                <span className={`text-sm font-bold ml-3 shrink-0 ${tx.type === "income" ? "text-[#00B894]" : "text-[#E17055]"}`}>
                  {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount, refCurrency, locale)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
        </>
      )}

      {showOnboarding && <OnboardingWizard open={true} />}
      {showCoupleOnboarding && <CoupleOnboardingWizard locale={locale} />}
    </div>
  );
}
