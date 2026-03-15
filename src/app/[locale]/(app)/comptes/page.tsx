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
  if (d === today) return "Mise a jour: Aujourd'hui";
  if (d === yesterday) return "Mise a jour: Hier";
  return `Mise a jour: ${d}`;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function ComptesPage() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const accounts = await getAllAccounts(db);
  const locale = await getLocale();

  return (
    <div className="flex flex-col pb-24 bg-background-light min-h-screen">

      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-end bg-background-light sticky top-0 z-10">
        <div>
          <p className="text-xs font-semibold text-primary mb-1">Koupli</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">Mes comptes</h1>
        </div>
        <AddAccountSheet />
      </header>

      {/* Liste des comptes */}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-surface flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-[32px]">account_balance_wallet</span>
          </div>
          <p className="text-text-main font-bold mb-1">Aucun compte configure</p>
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
                className="bg-white rounded-2xl border border-[#EEEEEE] shadow-soft overflow-hidden transition-all hover:shadow-card"
              >
                {/* Card body */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    {/* Left: name + balance */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-[#F0EEFF] flex items-center justify-center shrink-0">
                        <span className="text-[#6C5CE7] text-sm font-bold leading-none">
                          {getInitials(account.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#212121] leading-tight truncate">
                          {account.name}
                        </h3>
                        <p className="text-xs text-[#BDBDBD] mt-0.5">{dateLabel}</p>
                      </div>
                    </div>

                    {/* Right: balance + currency */}
                    <div className="flex flex-col items-end shrink-0 ml-4">
                      <div className="flex items-center gap-2">
                        {isAlert && (
                          <span className="text-[10px] font-bold bg-warning-surface text-warning rounded-full px-2 py-0.5">
                            Solde bas
                          </span>
                        )}
                        <span className="text-xs font-medium text-[#BDBDBD] bg-[#F5F5F5] rounded-full px-2 py-0.5">
                          {account.currency}
                        </span>
                      </div>
                      <p className="text-xs text-[#757575] font-medium mt-1.5">Solde</p>
                      <p
                        className={`text-xl font-bold tracking-tight ${
                          isPositive ? "text-[#00B894]" : "text-[#E17055]"
                        }`}
                      >
                        {formatCurrency(balance, account.currency, locale)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions footer */}
                <div className="flex items-center justify-end gap-2 bg-[#FAFAFA] border-t border-[#EEEEEE] px-6 py-3">
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
