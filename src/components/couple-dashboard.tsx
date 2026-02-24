import { getUserDb } from "@/lib/db";
import {
  computeCoupleBalanceForPeriod,
  getSharedTransactionsForCouple,
} from "@/lib/couple-queries";
import { CoupleBalanceCard } from "@/components/couple-balance-card";
import { formatCurrency } from "@/lib/format";

interface CoupleDashboardProps {
  coupleId: string;
  userId: string;
  partnerUserId: string;
  locale: string;
}

export async function CoupleDashboard({
  userId,
  partnerUserId,
  locale,
}: CoupleDashboardProps) {
  const [userDb1, userDb2] = await Promise.all([
    getUserDb(userId),
    getUserDb(partnerUserId),
  ]);

  const period = new Date().toISOString().slice(0, 7);

  const [balance, sharedTxs] = await Promise.all([
    computeCoupleBalanceForPeriod(userDb1, userDb2, userId, partnerUserId, period),
    getSharedTransactionsForCouple(userDb1, userDb2, period),
  ]);

  const lastFive = sharedTxs.slice(0, 5);

  return (
    <div className="flex flex-col gap-4 px-4">
      <CoupleBalanceCard
        user1Paid={balance.user1Paid}
        user2Paid={balance.user2Paid}
        diff={balance.diff}
        partnerName={partnerUserId.slice(0, 8)}
        locale={locale}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px]">swap_horiz</span>
          <h3 className="font-bold text-text-main text-sm">Transactions partagées</h3>
        </div>

        {lastFive.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-2">
            Aucune transaction partagée ce mois
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {lastFive.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-main truncate max-w-[180px]">
                    {tx.description}
                  </span>
                  <span className="text-xs text-text-muted">{tx.date}</span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    tx.type === "expense" ? "text-danger" : "text-success"
                  }`}
                >
                  {tx.type === "expense" ? "-" : "+"}
                  {formatCurrency(tx.amount, "EUR", locale)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
