import { getAllAccounts } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccountForm } from "@/components/account-form";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { EditAccountDialog } from "@/components/edit-account-dialog";
import { ReconciliationDialog } from "@/components/reconciliation-dialog";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ComptesPage() {
  const accounts = await getAllAccounts();
  const t = await getTranslations("accounts");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("title")}</h2>

      <Card>
        <CardHeader>
          <CardTitle>{t("createNew")}</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountForm />
        </CardContent>
      </Card>

      <h3 className="text-lg font-semibold">{t("existing")}</h3>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => {
            const balance = account.calculated_balance ?? account.initial_balance;
            return (
              <Card key={account.id}>
                <CardContent className="py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{account.name}</p>
                        <Badge variant="outline">{account.currency}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("initialBalance", { date: formatDate(account.balance_date) })}{" "}
                        {formatCurrency(account.initial_balance, account.currency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p
                        className={`text-xl font-bold ${
                          balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatCurrency(balance, account.currency)}
                      </p>
                      {account.alert_threshold != null && balance < account.alert_threshold && (
                        <Badge variant="destructive">{t("lowBalance")}</Badge>
                      )}
                      <ReconciliationDialog account={account} />
                      <EditAccountDialog account={account} />
                      <DeleteAccountButton accountId={account.id} accountName={account.name} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
