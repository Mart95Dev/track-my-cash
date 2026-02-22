import { getRecurringPayments, getAllAccounts, getCategorizationRules } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecurringForm } from "@/components/recurring-form";
import { DeleteRecurringButton } from "@/components/delete-recurring-button";
import { EditRecurringDialog } from "@/components/edit-recurring-dialog";
import { AccountFilter } from "@/components/account-filter";
import { getTranslations, getLocale } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { RefreshCw } from "lucide-react";
import { detectRecurringSuggestionsAction } from "@/app/actions/recurring-actions";
import { RecurringSuggestions } from "@/components/recurring-suggestions";

export const dynamic = "force-dynamic";

export default async function RecurrentsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string }>;
}) {
  const params = await searchParams;
  const accountId = params.accountId ? parseInt(params.accountId) : undefined;
  const t = await getTranslations("recurring");
  const locale = await getLocale();

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);

  const [accounts, rules] = await Promise.all([
    getAllAccounts(db),
    getCategorizationRules(db),
  ]);

  const [payments, suggestions] = await Promise.all([
    accountId ? getRecurringPayments(db, accountId) : Promise.resolve([]),
    accountId ? detectRecurringSuggestionsAction(accountId) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("title")}</h2>

      <Card>
        <CardHeader>
          <CardTitle>{t("newPayment")}</CardTitle>
        </CardHeader>
        <CardContent>
          <RecurringForm accounts={accounts} rules={rules} />
        </CardContent>
      </Card>

      {suggestions.length > 0 && accountId && (
        <RecurringSuggestions suggestions={suggestions} accountId={accountId} />
      )}

      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold">{t("list")}</h3>
        <AccountFilter
          accounts={accounts}
          currentAccountId={accountId}
          basePath="/recurrents"
        />
      </div>

      {!accountId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("selectAccount")}
          </CardContent>
        </Card>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<RefreshCw className="h-12 w-12" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
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
                      {p.subcategory && (
                        <span className="text-xs text-muted-foreground self-center">{p.subcategory}</span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {t("nextDate", { date: formatDate(p.next_date, locale) })}
                      </span>
                      {p.end_date && (
                        <Badge variant="outline" className="text-warning border-warning/50">
                          {t("untilDate", { date: formatDate(p.end_date, locale) })}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <p
                      className={`text-lg font-bold ${
                        p.type === "income"
                          ? "text-income"
                          : "text-expense"
                      }`}
                    >
                      {p.type === "income" ? "+" : "-"}
                      {formatCurrency(p.amount, "EUR", locale)}
                    </p>
                    <EditRecurringDialog payment={p} accounts={accounts} rules={rules} />
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
