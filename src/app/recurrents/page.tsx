import { getRecurringPayments, getAllAccounts } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecurringForm } from "@/components/recurring-form";
import { DeleteRecurringButton } from "@/components/delete-recurring-button";

export const dynamic = "force-dynamic";

export default function RecurrentsPage() {
  const payments = getRecurringPayments();
  const accounts = getAllAccounts();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Paiements Récurrents</h2>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau paiement récurrent</CardTitle>
        </CardHeader>
        <CardContent>
          <RecurringForm accounts={accounts} />
        </CardContent>
      </Card>

      <h3 className="text-lg font-semibold">Liste</h3>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun paiement récurrent
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">{p.frequency}</Badge>
                    <Badge variant="outline">{p.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {p.account_name} — Prochain : {formatDate(p.next_date)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p
                    className={`text-lg font-bold ${
                      p.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {p.type === "income" ? "+" : "-"}
                    {formatCurrency(p.amount)}
                  </p>
                  <DeleteRecurringButton id={p.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
