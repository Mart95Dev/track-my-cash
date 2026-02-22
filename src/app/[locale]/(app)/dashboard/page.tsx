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
} from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { getAllRates, convertToReference, REFERENCE_CURRENCY } from "@/lib/currency";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BalanceEvolutionChart } from "@/components/charts/balance-evolution-chart";
import { ExpenseBreakdownChart } from "@/components/charts/expense-breakdown-chart";
import { MonthlySummary } from "@/components/monthly-summary";
import { AccountFilter } from "@/components/account-filter";
import { BudgetProgress } from "@/components/budget-progress";
import { SpendingTrendChart } from "@/components/charts/spending-trend-chart";
import { SavingsGoalsWidget } from "@/components/savings-goals-widget";
import { getTranslations, getLocale } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { LayoutDashboard } from "lucide-react";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { VariationBadge } from "@/components/variation-badge";
import { computeMoMVariation } from "@/lib/mom-calculator";
import { computeHealthScore } from "@/lib/health-score";
import { HealthScoreWidget } from "@/components/health-score-widget";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const params = await searchParams;
  const accountId = params.accountId ? parseInt(params.accountId) : undefined;
  const t = await getTranslations("dashboard");
  const locale = await getLocale();

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);

  const [data, balanceHistory, expensesByPattern, expensesByBroad, monthlySummary, spendingTrend, rates, accounts, refCurrencySetting, budgetStatuses, onboardingCompleted, goals] =
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
    ]);

  const showOnboarding = !onboardingCompleted && accounts.length === 0;

  const refCurrency = refCurrencySetting ?? REFERENCE_CURRENCY;
  const selectedAccount = accountId ? accounts.find((a) => a.id === accountId) : null;

  // MoM : calculer les variations revenus/dépenses vs mois précédent
  const now = new Date();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
  const prevSummary = monthlySummary.find((m) => m.month === prevMonthKey);
  const incomeVariation = computeMoMVariation(data.monthlyIncome, prevSummary?.income ?? null);
  const expensesVariation = computeMoMVariation(data.monthlyExpenses, prevSummary?.expenses ?? null);
  const hasMultiCurrency = data.accounts.some((a) => a.currency !== refCurrency);

  // Score de santé financière — 3 derniers mois de données
  const healthScore = computeHealthScore({
    monthlySummaries: monthlySummary.slice(0, 3).map((m) => ({ income: m.income, expenses: m.expenses })),
    budgets: budgetStatuses.map((b) => ({ category: b.category, amount_limit: b.limit, spent: b.spent })),
    goals: goals.map((g) => ({ target_amount: g.target_amount, current_amount: g.current_amount })),
  });

  const totalInRef = (accountId && selectedAccount)
    ? convertToReference(
        selectedAccount.calculated_balance ?? selectedAccount.initial_balance,
        selectedAccount.currency,
        rates
      )
    : data.accounts.reduce((sum, account) => {
        const balance = account.calculated_balance ?? account.initial_balance;
        return sum + convertToReference(balance, account.currency, rates);
      }, 0);

  if (data.accounts.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <EmptyState
          icon={<LayoutDashboard className="h-12 w-12" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={{ label: t("emptyCta"), href: `/${locale}/comptes` }}
        />
        {showOnboarding && <OnboardingWizard open={true} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">
          {t("title")}
          {selectedAccount && (
            <span className="ml-2 text-lg font-normal text-muted-foreground">— {selectedAccount.name}</span>
          )}
        </h2>
        <AccountFilter accounts={accounts} currentAccountId={accountId} basePath="/dashboard" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("monthlyIncome")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-income">
              {formatCurrency(data.monthlyIncome, "EUR", locale)}
            </p>
            <VariationBadge variation={incomeVariation} variant="income" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("monthlyExpenses")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-expense">
              {formatCurrency(data.monthlyExpenses, "EUR", locale)}
            </p>
            <VariationBadge variation={expensesVariation} variant="expense" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("recurringMonthly")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(data.recurringMonthly, "EUR", locale)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score de santé financière */}
      <HealthScoreWidget score={healthScore} />

      {data.accounts.length > 1 && hasMultiCurrency && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalBalance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalInRef, refCurrency, locale)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("totalConverted", { currency: refCurrency })}
            </p>
          </CardContent>
        </Card>
      )}

      {data.accounts.length > 0 && (
        <>
          <h3 className="text-lg font-semibold">{t("accountBalances")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(accountId ? data.accounts.filter((a) => a.id === accountId) : data.accounts).map((account) => {
              const balance = account.calculated_balance ?? account.initial_balance;
              return (
                <Card key={account.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {account.name}
                      </CardTitle>
                      <Badge variant="outline">{account.currency}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p
                      className={`text-2xl font-bold ${
                        balance >= 0 ? "text-income" : "text-expense"
                      }`}
                    >
                      {formatCurrency(balance, account.currency, locale)}
                    </p>
                    {account.alert_threshold != null &&
                      balance < account.alert_threshold && (
                        <Badge variant="destructive" className="mt-2">
                          {t("lowBalance")}
                        </Badge>
                      )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {balanceHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("balanceEvolution")}</CardTitle>
            </CardHeader>
            <CardContent>
              <BalanceEvolutionChart data={balanceHistory} />
            </CardContent>
          </Card>
        )}

        {expensesByBroad.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("expensesByCategory")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseBreakdownChart data={expensesByBroad} />
            </CardContent>
          </Card>
        )}
      </div>

      {expensesByPattern.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("expensesBySubcategory")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseBreakdownChart data={expensesByPattern} />
          </CardContent>
        </Card>
      )}

      {/* Budgets */}
      {budgetStatuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budgets du mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetStatuses.map((b) => (
                <BudgetProgress
                  key={b.category}
                  budget={b}
                  currency={selectedAccount?.currency ?? "EUR"}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tendances dépenses 6 mois */}
      {spendingTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tendances des dépenses (6 mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingTrendChart
              data={spendingTrend}
              currency={selectedAccount?.currency ?? refCurrency}
            />
          </CardContent>
        </Card>
      )}

      {/* Objectifs d'épargne */}
      {goals.length > 0 && <SavingsGoalsWidget goals={goals} />}

      {/* Monthly summary */}
      <MonthlySummary data={monthlySummary} />
    </div>
  );
}
