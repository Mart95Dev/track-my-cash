import { getDashboardData, getMonthlyBalanceHistory, getExpensesByCategory, getMonthlySummary, getSetting } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BalanceEvolutionChart } from "@/components/charts/balance-evolution-chart";
import { ExpenseBreakdownChart } from "@/components/charts/expense-breakdown-chart";
import { MonthlySummary } from "@/components/monthly-summary";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [data, balanceHistory, expensesByCategory, monthlySummary, exchangeRateStr] = await Promise.all([
    getDashboardData(),
    getMonthlyBalanceHistory(),
    getExpensesByCategory(),
    getMonthlySummary(),
    getSetting("exchange_rate_eur_mga"),
  ]);

  const exchangeRate = exchangeRateStr ? parseFloat(exchangeRateStr) : 5000;
  const totalInEUR = data.accounts.reduce((sum, account) => {
    const balance = account.calculated_balance ?? account.initial_balance;
    return sum + (account.currency === "MGA" ? balance / exchangeRate : balance);
  }, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenus du mois
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
              Dépenses du mois
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
              Récurrents /mois
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
              Total global (converti en EUR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalInEUR)}</p>
            <p className="text-xs text-muted-foreground mt-1">Taux : 1 EUR = {exchangeRate} MGA</p>
          </CardContent>
        </Card>
      )}

      {data.accounts.length > 0 && (
        <>
          <h3 className="text-lg font-semibold">Soldes des comptes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.accounts.map((account) => {
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
                          Solde bas
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
              <CardTitle className="text-base">Évolution du solde (12 mois)</CardTitle>
            </CardHeader>
            <CardContent>
              <BalanceEvolutionChart data={balanceHistory} />
            </CardContent>
          </Card>
        )}

        {expensesByCategory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dépenses par catégorie (mois en cours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseBreakdownChart data={expensesByCategory} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Monthly summary */}
      <MonthlySummary data={monthlySummary} />
    </div>
  );
}
