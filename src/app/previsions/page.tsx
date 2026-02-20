import { getDetailedForecast, getAllAccounts } from "@/lib/queries";
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

export const dynamic = "force-dynamic";

const FREQ_LABEL: Record<string, string> = {
  monthly: "Mensuel",
  weekly: "Hebdo",
  yearly: "Annuel",
};

export default async function PrevisionsPage({
  searchParams,
}: {
  searchParams: Promise<{ months?: string; accountId?: string }>;
}) {
  const params = await searchParams;
  const months = parseInt(params.months ?? "6");
  const accountId = params.accountId ? parseInt(params.accountId) : null;
  const accounts = await getAllAccounts();

  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Prévisions de trésorerie</h2>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Créez d&apos;abord un compte pour voir les prévisions
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedAccount = accountId ? accounts.find((a) => a.id === accountId) ?? null : null;
  const currency = selectedAccount?.currency ?? "EUR";
  const forecast = await getDetailedForecast(months, accountId ?? undefined);
  const { monthDetails, currentBalance, projectedBalance, totalIncome, totalExpenses } = forecast;
  const totalNet = totalIncome - totalExpenses;

  // Collecter tous les récurrents actifs sur la période (au moins 1 mois actif)
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
        Prévisions de trésorerie
        {selectedAccount && (
          <span className="ml-2 text-lg font-normal text-muted-foreground">— {selectedAccount.name}</span>
        )}
      </h2>

      <ForecastControls currentMonths={months} currentAccountId={accountId} accounts={accounts} />

      {/* Cartes résumé */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Solde actuel</p>
            <p className={`text-2xl font-bold mt-1 ${currentBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(currentBalance, currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Revenus sur {months} mois</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              +{formatCurrency(totalIncome, currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Dépenses sur {months} mois</p>
            <p className="text-2xl font-bold mt-1 text-red-600">
              -{formatCurrency(totalExpenses, currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Solde dans {months} mois</p>
            <p className={`text-2xl font-bold mt-1 ${projectedBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(projectedBalance, currency)}
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
          <CardTitle>Détail mois par mois</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mois</TableHead>
                <TableHead className="text-right text-green-700">Revenus</TableHead>
                <TableHead className="text-right text-red-700">Dépenses</TableHead>
                <TableHead className="text-right">Net du mois</TableHead>
                <TableHead className="text-right">Solde fin de mois</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthDetails.map((m, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium capitalize">{m.month}</TableCell>
                  <TableCell className="text-right text-green-600">
                    {m.income > 0 ? `+${formatCurrency(m.income, currency)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {m.expenses > 0 ? `-${formatCurrency(m.expenses, currency)}` : "—"}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${m.netCashflow >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {m.netCashflow >= 0 ? "▲" : "▼"} {formatCurrency(Math.abs(m.netCashflow), currency)}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${m.endBalance >= 0 ? "" : "text-red-600"}`}>
                    {formatCurrency(m.endBalance, currency)}
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
            <CardTitle className="text-green-700">Revenus récurrents inclus</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {allIncomeItems.size === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">Aucun revenu récurrent</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Fréq.</TableHead>
                    <TableHead className="text-right">/mois</TableHead>
                    <TableHead>Période</TableHead>
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
                        +{formatCurrency(item.amount, currency)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span>Dès {formatDate(item.startsFrom)}</span>
                        {item.endsAt && (
                          <span className="block text-orange-600">Fin {formatDate(item.endsAt)}</span>
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
            <CardTitle className="text-red-700">Dépenses récurrentes incluses</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {allExpenseItems.size === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">Aucune dépense récurrente</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Fréq.</TableHead>
                    <TableHead className="text-right">/mois</TableHead>
                    <TableHead>Période</TableHead>
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
                        -{formatCurrency(item.amount, currency)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span>Dès {formatDate(item.startsFrom)}</span>
                        {item.endsAt && (
                          <span className="block text-orange-600">Fin {formatDate(item.endsAt)}</span>
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

      {/* Détail par compte — masqué si un seul compte sélectionné */}
      {accounts.length > 1 && !accountId && (
        <Card>
          <CardHeader>
            <CardTitle>Détail par compte — fin de période</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compte</TableHead>
                  <TableHead className="text-right">Solde actuel</TableHead>
                  <TableHead className="text-right text-green-700">Revenus/{months}m</TableHead>
                  <TableHead className="text-right text-red-700">Dépenses/{months}m</TableHead>
                  <TableHead className="text-right">Solde projeté</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthDetails[monthDetails.length - 1]?.accountBreakdown.map((acc) => {
                  const account = accounts.find((a) => a.id === acc.accountId);
                  const initialBal = account?.calculated_balance ?? account?.initial_balance ?? 0;
                  // Calculer cumul sur la période
                  const totalAccIncome = monthDetails.reduce((s, m) => {
                    const bd = m.accountBreakdown.find((b) => b.accountId === acc.accountId);
                    return s + (bd?.income ?? 0);
                  }, 0);
                  const totalAccExpenses = monthDetails.reduce((s, m) => {
                    const bd = m.accountBreakdown.find((b) => b.accountId === acc.accountId);
                    return s + (bd?.expenses ?? 0);
                  }, 0);
                  return (
                    <TableRow key={acc.accountId}>
                      <TableCell className="font-medium">{acc.accountName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(initialBal, acc.currency)}</TableCell>
                      <TableCell className="text-right text-green-600">
                        {totalAccIncome > 0 ? `+${formatCurrency(totalAccIncome, acc.currency)}` : "—"}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {totalAccExpenses > 0 ? `-${formatCurrency(totalAccExpenses, acc.currency)}` : "—"}
                      </TableCell>
                      <TableCell className={`text-right font-bold ${acc.endBalance >= 0 ? "" : "text-red-600"}`}>
                        {formatCurrency(acc.endBalance, acc.currency)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
