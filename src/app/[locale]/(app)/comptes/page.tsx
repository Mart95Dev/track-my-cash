import { getAllAccounts } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { formatCurrency } from "@/lib/format";
import { AddAccountSheet } from "@/components/add-account-sheet";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { EditAccountDialog } from "@/components/edit-account-dialog";
import { ReconciliationDialog } from "@/components/reconciliation-dialog";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

function getBalanceDateLabel(balanceDate: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const d = balanceDate.slice(0, 10);
  if (d === today) return "Mise à jour: Aujourd'hui";
  if (d === yesterday) return "Mise à jour: Hier";
  return `Mise à jour: ${d}`;
}

export default async function ComptesPage() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const accounts = await getAllAccounts(db);
  const locale = await getLocale();

  return (
    <div className="flex flex-col pb-24 bg-background-light min-h-screen">

      {/* Header sticky — AC-1 */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-end bg-background-light sticky top-0 z-10">
        <div>
          <p className="text-sm font-semibold text-primary mb-1">Koupli</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">Mes comptes</h1>
        </div>
        {/* Bouton + flottant — AC-2 */}
        <AddAccountSheet />
      </header>

      {/* Liste des comptes */}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-[32px]">account_balance</span>
          </div>
          <p className="text-text-main font-bold mb-1">Aucun compte configuré</p>
          <p className="text-text-muted text-sm mb-6">Commencez par ajouter votre premier compte bancaire.</p>
          <AddAccountSheet />
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-4 mt-2">
          {accounts.map((account) => {
            const balance = account.calculated_balance ?? account.initial_balance;
            const isPositive = balance >= 0;
            const isAlert =
              account.alert_threshold != null && balance < account.alert_threshold;
            const dateLabel = getBalanceDateLabel(account.balance_date);

            return (
              <div
                key={account.id}
                className="group bg-white dark:bg-[#1e1e2d] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md"
              >
                {/* Header card — AC-5 badge devise */}
                <div className="flex justify-between items-start mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-xl text-text-main leading-tight truncate">
                      {account.name}
                    </h3>
                    {/* Sous-titre date — AC-6 */}
                    <p className="text-xs text-slate-400 font-medium mt-1">{dateLabel}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isAlert && (
                      <span className="text-[11px] font-bold bg-warning/10 text-warning rounded-full px-2 py-0.5">
                        Solde bas
                      </span>
                    )}
                    {/* Badge devise — AC-5 */}
                    <span className="px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                      {account.currency}
                    </span>
                  </div>
                </div>

                {/* Solde coloré — AC-4 */}
                <div className="mt-4 mb-6">
                  <p
                    className={`text-4xl font-extrabold tracking-tight ${
                      isPositive ? "text-success" : "text-danger"
                    }`}
                  >
                    {isPositive ? "+" : "-"}
                    {formatCurrency(Math.abs(balance), account.currency, locale)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-50 dark:border-slate-800 pt-4">
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
