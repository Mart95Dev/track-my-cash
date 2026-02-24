import { getAllAccounts } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { AccountForm } from "@/components/account-form";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { EditAccountDialog } from "@/components/edit-account-dialog";
import { ReconciliationDialog } from "@/components/reconciliation-dialog";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ComptesPage() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const accounts = await getAllAccounts(db);
  const locale = await getLocale();

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="material-symbols-outlined text-primary text-[28px]">account_balance_wallet</span>
        <h1 className="text-2xl font-bold text-text-main">Comptes</h1>
      </div>

      {/* Formulaire ajout compte */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
          <h2 className="font-bold text-text-main">Ajouter un compte</h2>
        </div>
        <AccountForm />
      </div>

      {/* Liste des comptes */}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-text-muted text-[48px] mb-3">account_balance</span>
          <p className="text-text-muted text-sm">Aucun compte configuré</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {accounts.map((account) => {
            const balance = account.calculated_balance ?? account.initial_balance;
            const isPositive = balance >= 0;
            const isAlert =
              account.alert_threshold != null && balance < account.alert_threshold;

            return (
              <div
                key={account.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Infos compte */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[20px]">account_balance</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-text-main">{account.name}</p>
                        <span className="text-xs font-bold bg-indigo-50 text-primary rounded-full px-2 py-0.5">
                          {account.currency}
                        </span>
                        {isAlert && (
                          <span className="text-xs font-bold bg-warning/10 text-warning rounded-full px-2 py-0.5">
                            Solde bas
                          </span>
                        )}
                      </div>
                      <p className="text-text-muted text-xs mt-0.5">
                        Depuis le {formatDate(account.balance_date, locale)}
                      </p>
                    </div>
                  </div>

                  {/* Solde */}
                  <div className="text-right shrink-0">
                    <p
                      className={`text-xl font-bold ${
                        isPositive ? "text-success" : "text-danger"
                      }`}
                    >
                      {formatCurrency(balance, account.currency, locale)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50">
                  <ReconciliationDialog account={account} />
                  <EditAccountDialog account={account} />
                  <DeleteAccountButton accountId={account.id} accountName={account.name} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
