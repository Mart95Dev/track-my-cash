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
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
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

  const showOnboarding = !onboardingCompleted && accounts.length === 0;
  const showCoupleOnboarding = !coupleOnboardingCompleted && accounts.length > 0;
  const showCoupleChoiceModal = !coupleOnboardingChoice && accounts.length === 0;
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
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <span className="material-symbols-outlined text-primary text-[64px] mb-4">account_balance_wallet</span>
        <h2 className="text-xl font-bold text-text-main mb-2">Bienvenue sur TrackMyCash</h2>
        <p className="text-text-muted text-sm mb-6">Ajoutez un compte pour commencer à suivre vos finances.</p>
        <Link
          href={`/${locale}/comptes`}
          className="bg-primary text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20"
        >
          Ajouter un compte
        </Link>
        {showOnboarding && <OnboardingWizard open={true} />}
        {showCoupleChoiceModal && <CoupleChoiceModal open={true} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-2 dark:bg-background-dark max-w-md mx-auto w-full">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-base">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-white" />
          </div>
          <div>
            <p className="text-text-muted text-xs font-medium">Bonjour,</p>
            <h2 className="text-text-main text-lg font-bold leading-tight">{firstName}</h2>
          </div>
        </div>
        <Link
          href={`/${locale}/parametres`}
          className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-soft flex items-center justify-center text-text-muted hover:text-primary transition-colors"
          aria-label="Paramètres"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </Link>
      </header>

      {/* Chips filtres AC-2 */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-1 mb-2 scrollbar-none">
        <Link
          href={`/${locale}/dashboard?view=personal`}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${view !== "couple" ? "bg-primary text-white" : "bg-white border border-gray-200 text-text-muted"}`}
        >
          Personnel
        </Link>
        <Link
          href={`/${locale}/dashboard?view=couple`}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${view === "couple" ? "bg-primary text-white" : "bg-white border border-gray-200 text-text-muted"}`}
        >
          Couple
        </Link>
      </div>

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
          <div className="mx-4 my-4 bg-primary/10 rounded-2xl p-5 text-center">
            <span className="material-symbols-outlined text-primary text-[40px] mb-2">favorite</span>
            <p className="text-text-main font-bold mb-1">Invitez votre partenaire</p>
            <p className="text-text-muted text-sm mb-4">Créez un espace couple pour partager vos finances.</p>
            <Link href={`/${locale}/couple`} className="inline-flex items-center justify-center h-10 px-6 bg-primary text-white font-bold rounded-xl text-sm">
              Créer un espace couple
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
        <div className="mx-4 mb-4 bg-white rounded-2xl shadow-soft border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-text-main">Historique du solde</h3>
            <span className="text-xs text-text-muted">12 mois</span>
          </div>
          <BalanceEvolutionChart data={balanceHistory} />
        </div>
      )}

      {/* Spending donut */}
      {expensesByBroad.length > 0 && (
        <div className="mx-4 mb-4">
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-text-main mb-3">Dépenses par catégorie</h3>
            <div className="flex flex-wrap gap-2">
              {expensesByBroad.slice(0, 6).map((cat) => (
                <div key={cat.category} className="flex items-center gap-1.5 bg-background-light rounded-full px-2.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block shrink-0" />
                  <span className="text-xs text-text-muted font-medium">{cat.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Espace couple verrouillé - STORY-103 */}
      <CoupleLockedPreview locale={locale} hasCoupleActive={hasCoupleActive} />

      {/* Budgets (3 max) */}
      {budgetStatuses.length > 0 && (
        <section className="px-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-text-main">Budgets</h3>
            <Link href={`/${locale}/budgets`} className="text-primary text-xs font-bold">
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
            <h3 className="text-sm font-bold text-text-main">Objectifs d&apos;épargne</h3>
            <Link href={`/${locale}/objectifs`} className="text-primary text-xs font-bold">
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
            <h3 className="text-sm font-bold text-text-main">Dernières transactions</h3>
            <Link href={`/${locale}/transactions`} className="text-primary text-xs font-bold">
              Voir tout
            </Link>
          </div>
          <div className="bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft divide-y divide-gray-50">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-main truncate">{tx.description}</p>
                  <p className="text-xs text-text-muted">{tx.category}</p>
                </div>
                <span className={`text-sm font-bold ml-3 shrink-0 ${tx.type === "income" ? "text-success" : "text-danger"}`}>
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
