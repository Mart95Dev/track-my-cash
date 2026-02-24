import { getDetailedForecast, getAllAccounts, getSpendingTrend, getBudgets, getGoals } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { canUseAI } from "@/lib/subscription-utils";
import { computeForecast } from "@/lib/forecasting";
import { ForecastTable } from "@/components/forecast-table";
import { AIForecastInsights } from "@/components/ai-forecast-insights";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ForecastControls } from "@/components/forecast-controls";
import { ScenarioSimulator } from "@/components/scenario-simulator";
import { getTranslations, getLocale } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PrevisionsPage({
  searchParams,
}: {
  searchParams: Promise<{ months?: string; accountId?: string }>;
}) {
  const params = await searchParams;
  const months = parseInt(params.months ?? "6");
  const t = await getTranslations("forecasts");
  const locale = await getLocale();

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const accounts = await getAllAccounts(db);

  const FREQ_LABEL: Record<string, string> = {
    monthly: t("monthly"),
    weekly: t("weekly"),
    yearly: t("yearly"),
  };

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col gap-4 pb-4">
        <header className="flex items-center justify-between px-4 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[28px]">trending_up</span>
            <h1 className="text-xl font-bold text-text-main">{t("title")}</h1>
          </div>
        </header>
        <div className="mx-4">
          <EmptyState
            icon={<TrendingUp className="h-12 w-12" />}
            title={t("noAccounts")}
            description={t("noRecurrentsDesc")}
            action={{ label: t("noRecurrentsCta"), href: `/${locale}/comptes` }}
          />
        </div>
      </div>
    );
  }

  const rawAccountId = params.accountId ? parseInt(params.accountId) : null;
  const accountId = rawAccountId ?? accounts[0]!.id;
  const selectedAccount = accounts.find((a) => a.id === accountId) ?? accounts[0]!;
  const currency = selectedAccount.currency;
  const [forecast, trendData, accountBudgets, aiAccess, goals] = await Promise.all([
    getDetailedForecast(db, months, accountId),
    getSpendingTrend(db, 3, accountId),
    getBudgets(db, accountId),
    canUseAI(userId),
    getGoals(db),
  ]);
  const { monthDetails, currentBalance, projectedBalance, totalIncome, totalExpenses } = forecast;
  const categoryForecasts = computeForecast(trendData, accountBudgets);
  // Compter les mois distincts dans trendData
  const distinctMonths = new Set(trendData.map((e) => e.month)).size;
  const totalNet = totalIncome - totalExpenses;

  // Calcul des moyennes mensuelles pour les KPIs
  const monthlyRevenue = months > 0 ? totalIncome / months : 0;
  const monthlyExpenses = months > 0 ? totalExpenses / months : 0;

  const allIncomeItems = new Map<string, { name: string; amount: number; frequency: string; accountName: string; startsFrom: string; endsAt: string | null }>();
  const allExpenseItems = new Map<string, { name: string; amount: number; frequency: string; accountName: string; startsFrom: string; endsAt: string | null }>();

  for (const m of monthDetails) {
    for (const item of m.incomeItems) {
      if (!allIncomeItems.has(item.name)) allIncomeItems.set(item.name, item);
    }
    for (const item of m.expenseItems) {
      if (!allExpenseItems.has(item.name)) allExpenseItems.set(item.name, item);
    }
  }

  if (allIncomeItems.size === 0 && allExpenseItems.size === 0) {
    return (
      <div className="flex flex-col gap-4 pb-4">
        <header className="flex items-center justify-between px-4 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[28px]">trending_up</span>
            <h1 className="text-xl font-bold text-text-main">{t("title")}</h1>
          </div>
          <ForecastControls currentMonths={months} currentAccountId={accountId} accounts={accounts} />
        </header>
        <div className="mx-4">
          <EmptyState
            icon={<TrendingUp className="h-12 w-12" />}
            title={t("noRecurrents")}
            description={t("noRecurrentsDesc")}
            action={{ label: t("noRecurrentsCta"), href: `/${locale}/recurrents` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">

      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[28px]">trending_up</span>
          <h1 className="text-xl font-bold text-text-main">{t("title")}</h1>
        </div>
        <ForecastControls currentMonths={months} currentAccountId={accountId} accounts={accounts} />
      </header>

      {/* AI Insights (Premium) */}
      {aiAccess.allowed && distinctMonths >= 2 && categoryForecasts.length > 0 && (
        <div className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
            <h2 className="font-bold text-text-main">Insights IA</h2>
          </div>
          <AIForecastInsights
            forecasts={categoryForecasts}
            canUseAI={aiAccess.allowed}
          />
        </div>
      )}

      {/* 4 KPIs en scroll horizontal */}
      <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-2">
        {[
          { label: t("currentBalance"), value: currentBalance, icon: "account_balance", color: currentBalance >= 0 ? "text-success" : "text-danger" },
          { label: t("incomeOver", { months }), value: monthlyRevenue, icon: "arrow_downward", color: "text-success" },
          { label: t("expensesOver", { months }), value: monthlyExpenses, icon: "arrow_upward", color: "text-danger" },
          { label: t("balanceIn", { months }), value: projectedBalance, icon: "trending_up", color: projectedBalance >= 0 ? "text-success" : "text-danger" },
        ].map((kpi) => (
          <div key={kpi.label} className="flex-shrink-0 w-36 bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
            <span className={`material-symbols-outlined ${kpi.color} text-[20px]`}>{kpi.icon}</span>
            <p className="text-text-muted text-xs font-medium mt-2">{kpi.label}</p>
            <p className="text-text-main font-bold mt-0.5">{formatCurrency(kpi.value, currency, locale)}</p>
          </div>
        ))}
      </div>

      {/* Tableau mensuel dans card blanche */}
      <div className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
          <h2 className="font-bold text-text-main">{t("detailByMonth")}</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("month")}</TableHead>
                <TableHead className="text-right text-success">{t("income")}</TableHead>
                <TableHead className="text-right text-danger">{t("expenses")}</TableHead>
                <TableHead className="text-right">{t("netMonth")}</TableHead>
                <TableHead className="text-right">{t("endBalance")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthDetails.map((m, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium capitalize">{m.month}</TableCell>
                  <TableCell className="text-right text-success">
                    {m.income > 0 ? `+${formatCurrency(m.income, currency, locale)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right text-danger">
                    {m.expenses > 0 ? `-${formatCurrency(m.expenses, currency, locale)}` : "—"}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${m.netCashflow >= 0 ? "text-success" : "text-danger"}`}>
                    {m.netCashflow >= 0 ? "▲" : "▼"} {formatCurrency(Math.abs(m.netCashflow), currency, locale)}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${m.endBalance >= 0 ? "text-text-main" : "text-danger"}`}>
                    {formatCurrency(m.endBalance, currency, locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Récurrents inclus — Revenus & Dépenses */}
      <div className="mx-4 grid md:grid-cols-2 gap-4">
        {/* Revenus récurrents */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-gray-100">
            <span className="material-symbols-outlined text-success text-[20px]">arrow_downward</span>
            <h2 className="font-bold text-text-main">{t("recurringIncome")}</h2>
          </div>
          {allIncomeItems.size === 0 ? (
            <p className="px-4 py-4 text-sm text-text-muted">{t("noRecurringIncome")}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("freq")}</TableHead>
                    <TableHead className="text-right">{t("perMonth")}</TableHead>
                    <TableHead>{t("period")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...allIncomeItems.values()].map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <p className="font-medium text-text-main">{item.name}</p>
                        <p className="text-xs text-text-muted">{item.accountName}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{FREQ_LABEL[item.frequency] ?? item.frequency}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-success font-medium">
                        +{formatCurrency(item.amount, currency, locale)}
                      </TableCell>
                      <TableCell className="text-xs text-text-muted">
                        <span>{t("from", { date: formatDate(item.startsFrom, locale) })}</span>
                        {item.endsAt && (
                          <span className="block text-warning">{t("until", { date: formatDate(item.endsAt, locale) })}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Dépenses récurrentes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-gray-100">
            <span className="material-symbols-outlined text-danger text-[20px]">arrow_upward</span>
            <h2 className="font-bold text-text-main">{t("recurringExpenses")}</h2>
          </div>
          {allExpenseItems.size === 0 ? (
            <p className="px-4 py-4 text-sm text-text-muted">{t("noRecurringExpenses")}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("freq")}</TableHead>
                    <TableHead className="text-right">{t("perMonth")}</TableHead>
                    <TableHead>{t("period")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...allExpenseItems.values()].map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <p className="font-medium text-text-main">{item.name}</p>
                        <p className="text-xs text-text-muted">{item.accountName}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{FREQ_LABEL[item.frequency] ?? item.frequency}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-danger font-medium">
                        -{formatCurrency(item.amount, currency, locale)}
                      </TableCell>
                      <TableCell className="text-xs text-text-muted">
                        <span>{t("from", { date: formatDate(item.startsFrom, locale) })}</span>
                        {item.endsAt && (
                          <span className="block text-warning">{t("until", { date: formatDate(item.endsAt, locale) })}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Section Prévisions par catégorie */}
      {(distinctMonths >= 2 && categoryForecasts.length > 0) && (
        <div className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-gray-100">
            <span className="material-symbols-outlined text-primary text-[20px]">donut_small</span>
            <h2 className="font-bold text-text-main">Prévisions par catégorie</h2>
          </div>
          <div className="overflow-x-auto">
            <ForecastTable forecasts={categoryForecasts} />
          </div>
        </div>
      )}

      {/* Message si données insuffisantes pour catégories */}
      {distinctMonths < 2 && (
        <div className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-warning text-[20px]">info</span>
            <h2 className="font-bold text-text-main">Prévisions par catégorie</h2>
          </div>
          <p className="text-sm text-text-muted">
            Données insuffisantes pour les prévisions (minimum 2 mois requis — actuellement {distinctMonths} mois).
          </p>
        </div>
      )}

      {/* Solde net résumé */}
      <div className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">calculate</span>
            <p className="font-medium text-text-main">Net sur {months} mois</p>
          </div>
          <p className={`font-bold text-lg ${totalNet >= 0 ? "text-success" : "text-danger"}`}>
            {totalNet >= 0 ? "+" : ""}{formatCurrency(totalNet, currency, locale)}
          </p>
        </div>
      </div>

      {/* Simulateur de scénarios */}
      <div className="mx-4">
        <ScenarioSimulator
          base={{
            avgMonthlyIncome: monthlyRevenue,
            avgMonthlyExpenses: monthlyExpenses,
            goals: goals.map((g) => ({
              target_amount: g.target_amount,
              current_amount: g.current_amount,
            })),
          }}
        />
      </div>

    </div>
  );
}
