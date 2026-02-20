import {
  getDashboardData,
  getMonthlyBalanceHistory,
  getExpensesByCategory,
  getExpensesByBroadCategory,
  getMonthlySummary,
  getAllAccounts,
} from "@/lib/queries";
import { getExchangeRate } from "@/lib/currency";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BalanceEvolutionChart } from "@/components/charts/balance-evolution-chart";
import { ExpenseBreakdownChart } from "@/components/charts/expense-breakdown-chart";
import { MonthlySummary } from "@/components/monthly-summary";
import { AccountFilter } from "@/components/account-filter";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const params = await searchParams;
  const accountId = params.accountId ? parseInt(params.accountId) : undefined;
  const t = await getTranslations("dashboard");

  const [data, balanceHistory, expensesByPattern, expensesByBroad, monthlySummary, exchangeRate, accounts] =
    await Promise.all([
      getDashboardData(accountId),
      getMonthlyBalanceHistory(12, accountId),
      getExpensesByCategory(accountId),
      getExpensesByBroadCategory(accountId),
      getMonthlySummary(accountId),
      getExchangeRate(),
      getAllAccounts(),
    ]);

  const selectedAccount = accountId ? accounts.find((a) => a.id === accountId) : null;

  const totalInEUR = (accountId && selectedAccount)
    ? (selectedAccount.calculated_balance ?? selectedAccount.initial_balance) /
      (selectedAccount.currency === "MGA" ? exchangeRate : 1)
    : data.accounts.reduce((sum, account) => {
        const balance = account.calculated_balance ?? account.initial_balance;
        return sum + (account.currency === "MGA" ? balance / exchangeRate : balance);
      }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">
          {t("title")}
          {selectedAccount && (
            <span className="ml-2 text-lg font-normal text-muted-foreground">— {selectedAccount.name}</span>
          )}
        </h2>
        <AccountFilter accounts={accounts} currentAccountId={accountId} basePath="/" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("monthlyIncome")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(data.monthlyIncome)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("monthlyExpenses")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(data.monthlyExpenses)}
            </p>
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
              {formatCurrency(data.recurringMonthly)}
            </p>
          </CardContent>
        </Card>
      </div>

      {data.accounts.length > 1 && data.accounts.some((a) => a.currency !== "EUR") && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalBalance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalInEUR)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("exchangeRate", { rate: exchangeRate.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) })}
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
                        balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(balance, account.currency)}
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

      {/* Monthly summary */}
      <MonthlySummary data={monthlySummary} />
    </div>
  );
}
