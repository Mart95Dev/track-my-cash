import { getRequiredUserId } from "@/lib/auth-utils";
import { getDb, getUserDb } from "@/lib/db";
import {
  getCoupleByUserId,
  getCoupleMembers,
  getCoupleMonthStats,
  getCoupleSharedGoals,
  computeCoupleBalanceForPeriod,
} from "@/lib/couple-queries";
import { leaveCoupleFormAction } from "@/app/actions/couple-actions";
import { CopyInviteCodeButton } from "@/components/copy-invite-code-button";
import { CoupleCreateForm } from "@/components/couple-create-form";
import { CoupleJoinForm } from "@/components/couple-join-form";
import { CoupleBalanceCard } from "@/components/couple-balance-card";
import { CoupleStatsCard } from "@/components/couple-stats-card";
import { CoupleCategoriesPills } from "@/components/couple-categories-pills";
import { formatCurrency } from "@/lib/format";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function CouplePage() {
  const userId = await getRequiredUserId();
  const db = getDb();
  const locale = await getLocale();

  const couple = await getCoupleByUserId(db, userId);

  if (!couple) {
    return (
      <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary text-[28px]">favorite</span>
          <h1 className="text-2xl font-bold text-text-main">Espace couple</h1>
        </div>

        <p className="text-sm text-text-muted">
          Partagez vos finances avec votre partenaire. Créez un espace ou rejoignez-en un avec un code.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
            <h2 className="font-bold text-text-main">Créer un espace couple</h2>
          </div>
          <CoupleCreateForm />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-text-muted font-medium">ou</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">group_add</span>
            <h2 className="font-bold text-text-main">Rejoindre avec un code</h2>
          </div>
          <CoupleJoinForm />
        </div>
      </div>
    );
  }

  const members = await getCoupleMembers(db, couple.id);
  const partner = members.find((m) => m.user_id !== userId);

  // Si pas encore de partenaire → page invite simplifiée
  if (!partner) {
    return (
      <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary text-[28px]">favorite</span>
          <h1 className="text-2xl font-bold text-text-main">Espace couple</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">favorite</span>
            <h2 className="font-bold text-text-main">Votre espace couple</h2>
          </div>
          {couple.name && (
            <p className="text-sm font-medium text-text-main mb-3">{couple.name}</p>
          )}
          <p className="text-sm text-text-muted italic mb-4">En attente d&apos;un partenaire</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
                Code d&apos;invitation
              </p>
              <CopyInviteCodeButton inviteCode={couple.invite_code} />
            </div>
            <p className="text-2xl font-extrabold text-primary tracking-widest">
              {couple.invite_code}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Partagez ce code avec votre partenaire pour qu&apos;il rejoigne votre espace.
            </p>
          </div>
          <form action={leaveCoupleFormAction}>
            <button
              type="submit"
              className="w-full border border-danger/30 text-danger font-bold rounded-xl px-4 py-2.5 text-sm hover:bg-danger/5"
            >
              Quitter le couple
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard couple enrichi
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [userDb, partnerDb] = await Promise.all([
    getUserDb(userId),
    getUserDb(partner.user_id),
  ]);

  const [balance, monthStats, sharedGoals] = await Promise.all([
    computeCoupleBalanceForPeriod(userDb, partnerDb, userId, partner.user_id, currentMonth),
    getCoupleMonthStats(userDb, partnerDb, currentMonth),
    getCoupleSharedGoals(userDb, partnerDb, couple.id),
  ]);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-6">
      {/* ── En-tête ── */}
      <div className="flex items-center gap-3 mb-2">
        <span className="material-symbols-outlined text-primary text-[28px]">favorite</span>
        <div>
          <h1 className="text-2xl font-bold text-text-main">
            {couple.name ?? "Espace couple"}
          </h1>
          <p className="text-xs text-text-muted">
            {members.length} membres
          </p>
        </div>
      </div>

      {/* ── Balance couple ── */}
      <CoupleBalanceCard
        user1Paid={balance.user1Paid}
        user2Paid={balance.user2Paid}
        diff={balance.diff}
        partnerName={partner.user_id.slice(0, 8)}
        locale={locale}
      />

      {/* ── Dépenses communes ── */}
      <CoupleStatsCard
        totalExpenses={monthStats.totalExpenses}
        variation={monthStats.variation}
        locale={locale}
      />

      {/* ── Top 3 catégories ── */}
      {monthStats.topCategories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">category</span>
            <h2 className="font-bold text-text-main text-sm">Top catégories</h2>
          </div>
          <CoupleCategoriesPills categories={monthStats.topCategories} locale={locale} />
        </div>
      )}

      {/* ── 10 dernières transactions partagées ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px]">swap_horiz</span>
          <h2 className="font-bold text-text-main text-sm">Transactions partagées</h2>
          <span className="ml-auto text-xs text-text-muted bg-gray-100 rounded-full px-2 py-0.5">
            {monthStats.transactionCount}
          </span>
        </div>

        {monthStats.recentTransactions.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-2">
            Aucune transaction partagée ce mois
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {monthStats.recentTransactions.map((tx, i) => (
              <div
                key={`${tx.date}-${i}`}
                className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-main truncate max-w-[180px]">
                    {tx.description}
                  </span>
                  <span className="text-xs text-text-muted">
                    {tx.date} · {tx.paid_by.slice(0, 8)}
                  </span>
                </div>
                <span className="text-sm font-bold text-danger">
                  -{formatCurrency(Math.abs(tx.amount), "EUR", locale)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Objectifs communs ── */}
      {sharedGoals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">savings</span>
            <h2 className="font-bold text-text-main text-sm">Objectifs communs</h2>
          </div>
          <div className="flex flex-col gap-3">
            {sharedGoals.map((goal) => {
              const pct = goal.target_amount > 0
                ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
                : 0;
              return (
                <div key={goal.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-text-main">{goal.name}</span>
                    <span className="text-text-muted text-xs">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-text-muted mt-1">
                    <span>{formatCurrency(goal.current_amount, goal.currency, locale)}</span>
                    <span>{formatCurrency(goal.target_amount, goal.currency, locale)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Code invite (repliable) ── */}
      <details className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <summary className="flex items-center gap-2 cursor-pointer list-none">
          <span className="material-symbols-outlined text-text-muted text-[20px]">share</span>
          <span className="text-sm font-medium text-text-muted">Code d&apos;invitation</span>
          <span className="material-symbols-outlined text-text-muted text-[16px] ml-auto">expand_more</span>
        </summary>
        <div className="mt-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
                Code d&apos;invitation
              </p>
              <CopyInviteCodeButton inviteCode={couple.invite_code} />
            </div>
            <p className="text-2xl font-extrabold text-primary tracking-widest">
              {couple.invite_code}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Partagez ce code avec votre partenaire pour qu&apos;il rejoigne votre espace.
            </p>
          </div>
          <form action={leaveCoupleFormAction} className="mt-4">
            <button
              type="submit"
              className="w-full border border-danger/30 text-danger font-bold rounded-xl px-4 py-2.5 text-sm hover:bg-danger/5"
            >
              Quitter le couple
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}
