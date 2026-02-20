import { getRecurringPayments, getAllAccounts, getCategorizationRules } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecurringForm } from "@/components/recurring-form";
import { DeleteRecurringButton } from "@/components/delete-recurring-button";
import { EditRecurringDialog } from "@/components/edit-recurring-dialog";
import { AccountFilter } from "@/components/account-filter";

export const dynamic = "force-dynamic";

export default async function RecurrentsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const params = await searchParams;
  const accountId = params.accountId ? parseInt(params.accountId) : undefined;

  const [accounts, rules] = await Promise.all([
    getAllAccounts(),
    getCategorizationRules(),
  ]);

  const categories = [...new Set(rules.map((r) => r.category))].sort();
  if (!categories.includes("Autre")) categories.push("Autre");

  const payments = accountId ? await getRecurringPayments(accountId) : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Paiements Récurrents</h2>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau paiement récurrent</CardTitle>
        </CardHeader>
        <CardContent>
          <RecurringForm accounts={accounts} categories={categories} />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">Liste</h3>
        <AccountFilter
          accounts={accounts}
          currentAccountId={accountId}
          basePath="/recurrents"
        />
      </div>

      {!accountId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Sélectionnez un compte pour voir ses paiements récurrents
          </CardContent>
        </Card>
      ) : payments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun paiement récurrent pour ce compte
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <Card key={p.id}>
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{p.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="secondary">{p.frequency}</Badge>
                      <Badge variant="outline">{p.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Prochain : {formatDate(p.next_date)}
                      </span>
                      {p.end_date && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Jusqu&apos;au {formatDate(p.end_date)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <p
                      className={`text-lg font-bold ${
                        p.type === "income"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {p.type === "income" ? "+" : "-"}
                      {formatCurrency(p.amount)}
                    </p>
                    <EditRecurringDialog payment={p} accounts={accounts} categories={categories} />
                    <DeleteRecurringButton id={p.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
