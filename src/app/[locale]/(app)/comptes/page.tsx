import { getAllAccounts } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { AddAccountSheet } from "@/components/add-account-sheet";
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
    <div className="flex flex-col px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-text-main">Mes comptes</h1>
        <AddAccountSheet />
      </div>

      {/* Liste des comptes */}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-[32px]">account_balance</span>
          </div>
          <p className="text-text-main font-bold mb-1">Aucun compte configuré</p>
          <p className="text-text-muted text-sm mb-6">Commencez par ajouter votre premier compte bancaire.</p>
          <AddAccountSheet />
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
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[22px]">account_balance</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-text-main text-base">{account.name}</p>
                        <span className="text-[11px] font-bold bg-primary/8 text-primary rounded-full px-2 py-0.5">
                          {account.currency}
                        </span>
                        {isAlert && (
                          <span className="text-[11px] font-bold bg-warning/10 text-warning rounded-full px-2 py-0.5">
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
                      className={`text-xl font-extrabold tracking-tight ${
                        isPositive ? "text-success" : "text-danger"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {formatCurrency(balance, account.currency, locale)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
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
