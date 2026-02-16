import { getForecast, getAllAccounts } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ForecastControls } from "@/components/forecast-controls";

export const dynamic = "force-dynamic";

export default async function PrevisionsPage({
  searchParams,
}: {
  searchParams: Promise<{ months?: string }>;
}) {
  const params = await searchParams;
  const months = parseInt(params.months ?? "6");
  const forecast = await getForecast(months);
  const accounts = await getAllAccounts();

  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Prévisions</h2>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Créez d&apos;abord un compte pour voir les prévisions
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Prévisions de trésorerie</h2>

      <ForecastControls currentMonths={months} />

      <Card>
        <CardHeader>
          <CardTitle>Prévision sur {months} mois</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mois</TableHead>
                {accounts.map((a) => (
                  <TableHead key={a.id} className="text-right">
                    {a.name}
                  </TableHead>
                ))}
                <TableHead className="text-right font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecast.map((f, i) => {
                const total = f.accounts.reduce((sum, a) => sum + a.balance, 0);
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium capitalize">{f.month}</TableCell>
                    {f.accounts.map((a, j) => (
                      <TableCell
                        key={j}
                        className={`text-right ${
                          a.balance >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(a.balance, a.currency)}
                      </TableCell>
                    ))}
                    <TableCell
                      className={`text-right font-bold ${
                        total >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(total)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
