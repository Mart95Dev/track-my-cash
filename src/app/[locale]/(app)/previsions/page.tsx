import { getDetailedForecast, getAllAccounts } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getTranslations, getLocale } from "next-intl/server";

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
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("noAccounts")}
          </CardContent>
        </Card>
      </div>
    );
  }

  const rawAccountId = params.accountId ? parseInt(params.accountId) : null;
  const accountId = rawAccountId ?? accounts[0]!.id;
  const selectedAccount = accounts.find((a) => a.id === accountId) ?? accounts[0]!;
  const currency = selectedAccount.currency;
  const forecast = await getDetailedForecast(db, months, accountId);
  const { monthDetails, currentBalance, projectedBalance, totalIncome, totalExpenses } = forecast;
  const totalNet = totalIncome - totalExpenses;

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">
        {t("title")}
        {selectedAccount && (
          <span className="ml-2 text-lg font-normal text-muted-foreground">— {selectedAccount.name}</span>
        )}
      </h2>

      <ForecastControls currentMonths={months} currentAccountId={accountId} accounts={accounts} />

      {/* Cartes résumé */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("currentBalance")}</p>
            <p className={`text-2xl font-bold mt-1 ${currentBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(currentBalance, currency, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("incomeOver", { months })}</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              +{formatCurrency(totalIncome, currency, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("expensesOver", { months })}</p>
            <p className="text-2xl font-bold mt-1 text-red-600">
              -{formatCurrency(totalExpenses, currency, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("balanceIn", { months })}</p>
            <p className={`text-2xl font-bold mt-1 ${projectedBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(projectedBalance, currency, locale)}
            </p>
            <p className={`text-xs mt-1 ${totalNet >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalNet >= 0 ? "+" : ""}{formatCurrency(totalNet, currency)} net
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tableau mensuel détaillé */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detailByMonth")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("month")}</TableHead>
                <TableHead className="text-right text-green-700">{t("income")}</TableHead>
                <TableHead className="text-right text-red-700">{t("expenses")}</TableHead>
                <TableHead className="text-right">{t("netMonth")}</TableHead>
                <TableHead className="text-right">{t("endBalance")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthDetails.map((m, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium capitalize">{m.month}</TableCell>
                  <TableCell className="text-right text-green-600">
                    {m.income > 0 ? `+${formatCurrency(m.income, currency, locale)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {m.expenses > 0 ? `-${formatCurrency(m.expenses, currency, locale)}` : "—"}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${m.netCashflow >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {m.netCashflow >= 0 ? "▲" : "▼"} {formatCurrency(Math.abs(m.netCashflow), currency, locale)}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${m.endBalance >= 0 ? "" : "text-red-600"}`}>
                    {formatCurrency(m.endBalance, currency, locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Récurrents inclus */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenus récurrents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">{t("recurringIncome")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {allIncomeItems.size === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">{t("noRecurringIncome")}</p>
            ) : (
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
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.accountName}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{FREQ_LABEL[item.frequency] ?? item.frequency}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        +{formatCurrency(item.amount, currency, locale)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span>{t("from", { date: formatDate(item.startsFrom, locale) })}</span>
                        {item.endsAt && (
                          <span className="block text-orange-600">{t("until", { date: formatDate(item.endsAt, locale) })}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dépenses récurrentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">{t("recurringExpenses")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {allExpenseItems.size === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">{t("noRecurringExpenses")}</p>
            ) : (
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
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.accountName}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{FREQ_LABEL[item.frequency] ?? item.frequency}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        -{formatCurrency(item.amount, currency, locale)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span>{t("from", { date: formatDate(item.startsFrom, locale) })}</span>
                        {item.endsAt && (
                          <span className="block text-orange-600">{t("until", { date: formatDate(item.endsAt, locale) })}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
