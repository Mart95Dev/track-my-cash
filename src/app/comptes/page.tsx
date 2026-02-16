import { getAllAccounts } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountForm } from "@/components/account-form";
import { DeleteAccountButton } from "@/components/delete-account-button";

export const dynamic = "force-dynamic";

export default function ComptesPage() {
  const accounts = getAllAccounts();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mes Comptes</h2>

      <Card>
        <CardHeader>
          <CardTitle>Créer un nouveau compte</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountForm />
        </CardContent>
      </Card>

      <h3 className="text-lg font-semibold">Comptes existants</h3>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun compte pour le moment
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => {
            const balance = account.calculated_balance ?? account.initial_balance;
            return (
              <Card key={account.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Solde initial au {formatDate(account.balance_date)} :{" "}
                      {formatCurrency(account.initial_balance, account.currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p
                      className={`text-xl font-bold ${
                        balance >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(balance, account.currency)}
                    </p>
                    <DeleteAccountButton accountId={account.id} accountName={account.name} />
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
