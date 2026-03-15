import { getRequiredUserId } from "@/lib/auth-utils";
import { getDb, getUserDb } from "@/lib/db";
import {
  getCoupleByUserId,
  getCoupleMembers,
  getCoupleMonthStats,
  getCoupleSharedGoals,
  computeCoupleBalanceForPeriod,
} from "@/lib/couple-queries";
import { getCoupleState, getActiveMemberCount } from "@/lib/couple-hub";
import { leaveCoupleFormAction } from "@/app/actions/couple-actions";
import { CopyInviteCodeButton } from "@/components/copy-invite-code-button";
import { CoupleCreateForm } from "@/components/couple-create-form";
import { CoupleJoinForm } from "@/components/couple-join-form";
import { CoupleBalanceCard } from "@/components/couple-balance-card";
import { CoupleStatsCard } from "@/components/couple-stats-card";
import { CoupleCategoriesPills } from "@/components/couple-categories-pills";
import { formatCurrency } from "@/lib/format";
import { getLocale } from "next-intl/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CouplePage() {
  const userId = await getRequiredUserId();
  const db = getDb();
  const locale = await getLocale();

  const couple = await getCoupleByUserId(db, userId);
  const members = couple ? await getCoupleMembers(db, couple.id) : [];
  const activeMemberCount = getActiveMemberCount(members);
  const coupleState = getCoupleState(couple, activeMemberCount);

  // ── État 1 : Pas de couple ──────────────────────────────────────────────────
  if (coupleState === "none") {
    return (
      <div className="min-h-[80vh] flex items-start justify-center bg-[#F8F7FC] px-4 pt-10 pb-6">
        <div className="w-full max-w-xl mx-auto flex flex-col gap-5">
          {/* Header centered */}
          <div className="flex flex-col items-center text-center gap-2 mb-2">
            <div className="w-14 h-14 rounded-[16px] bg-[#F0EEFF] flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[#6C5CE7] text-[28px]">favorite</span>
            </div>
            <h1 className="text-2xl font-bold text-[#212121]">Espace couple</h1>
            <p className="text-sm text-[#757575] max-w-sm">
              Partagez vos finances avec votre partenaire. Créez un espace ou rejoignez-en un avec un code.
            </p>
          </div>

          {/* Créer un espace couple */}
          <div className="bg-white rounded-[12px] border border-[#EEEEEE] p-5" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-[10px] bg-[#F0EEFF] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#6C5CE7] text-[20px]">add_circle</span>
              </div>
              <h2 className="font-bold text-[#212121]">Créer un espace couple</h2>
            </div>
            <CoupleCreateForm />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#EEEEEE]" />
            <span className="text-xs text-[#757575] font-medium">ou</span>
            <div className="flex-1 h-px bg-[#EEEEEE]" />
          </div>

          {/* Rejoindre avec un code */}
          <div className="bg-white rounded-[12px] border border-[#EEEEEE] p-5" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-[10px] bg-[#E8FAF5] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#6C5CE7] text-[20px]">group_add</span>
              </div>
              <h2 className="font-bold text-[#212121]">Rejoindre avec un code</h2>
            </div>
            <CoupleJoinForm />
          </div>

          {/* Info card */}
          <div className="bg-[#F0EEFF] rounded-[12px] p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#6C5CE7] text-[18px] mt-0.5">info</span>
              <p className="text-sm text-[#212121] leading-relaxed">
                Un espace couple vous permet de suivre vos dépenses communes, comparer vos contributions et définir des objectifs financiers à deux.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── État 2 : Couple en attente (partenaire pas encore rejoint) ──────────────
  if (coupleState === "pending" && couple) {
    return (
      <div className="min-h-[80vh] flex items-start justify-center bg-[#F8F7FC] px-4 pt-10 pb-6">
        <div className="w-full max-w-xl mx-auto flex flex-col gap-5">
          {/* Header centered */}
          <div className="flex flex-col items-center text-center gap-2 mb-2">
            <div className="w-14 h-14 rounded-[16px] bg-[#F0EEFF] flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[#6C5CE7] text-[28px]">favorite</span>
            </div>
            <h1 className="text-2xl font-bold text-[#212121]">Espace couple</h1>
          </div>

          {/* Pending card */}
          <div className="bg-white rounded-[12px] border border-[#EEEEEE] p-5" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-[10px] bg-amber-50 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">hourglass_top</span>
              </div>
              <h2 className="font-bold text-[#212121]">En attente de votre partenaire</h2>
            </div>

            {couple.name && (
              <p className="text-sm font-medium text-[#212121] mb-3 ml-12">{couple.name}</p>
            )}

            <p className="text-sm text-[#757575] mb-5">
              Votre espace couple est prêt. Partagez le code ci-dessous avec votre partenaire pour qu&apos;il rejoigne votre espace.
            </p>

            <div className="bg-[#F8F7FC] rounded-[12px] p-5 mb-5">
              <p className="text-xs text-[#757575] font-medium uppercase tracking-wide mb-2">
                Code d&apos;invitation
              </p>
              <p className="text-3xl font-extrabold text-[#6C5CE7] tracking-widest mb-3">
                {couple.invite_code}
              </p>
              <div className="flex gap-2">
                <CopyInviteCodeButton inviteCode={couple.invite_code} />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-[12px] p-4 mb-5">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[18px] mt-0.5">info</span>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Votre partenaire recevra un rappel par email s&apos;il n&apos;a pas rejoint sous 24h.
                </p>
              </div>
            </div>

            <form action={leaveCoupleFormAction}>
              <button
                type="submit"
                className="w-full border border-danger/30 text-danger font-bold rounded-[12px] px-4 py-2.5 text-sm hover:bg-danger/5"
              >
                Annuler et quitter
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── État 3 : Couple complet (2 membres actifs) ─────────────────────────────
  const partner = members.find((m) => m.user_id !== userId);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [userDb, partnerDb] = await Promise.all([
    getUserDb(userId),
    getUserDb(partner!.user_id),
  ]);

  const [balance, monthStats, sharedGoals] = await Promise.all([
    computeCoupleBalanceForPeriod(userDb, partnerDb, userId, partner!.user_id, currentMonth),
    getCoupleMonthStats(userDb, partnerDb, currentMonth),
    getCoupleSharedGoals(userDb, partnerDb, couple!.id),
  ]);

  return (
    <div className="flex flex-col gap-4 bg-[#F8F7FC] px-4 pt-6 pb-6">
      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[12px] bg-[#F0EEFF] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#6C5CE7] text-[24px]">favorite</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#212121]">
              {couple!.name ?? "Espace couple"}
            </h1>
            <p className="text-xs text-[#757575]">
              {activeMemberCount} membres actifs
            </p>
          </div>
        </div>
        <Link
          href="/dashboard?view=couple"
          className="flex items-center gap-1 text-xs font-semibold text-[#6C5CE7] bg-[#F0EEFF] rounded-[12px] px-3 py-2"
        >
          <span className="material-symbols-outlined text-[16px]">dashboard</span>
          Vue couple
        </Link>
      </div>

      {/* ── Partenaire ── */}
      <div className="bg-white rounded-[12px] border border-[#EEEEEE] p-4" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F0EEFF] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#6C5CE7] text-[20px]">person</span>
          </div>
          <div>
            <p className="text-xs text-[#757575]">Votre partenaire</p>
            <p className="text-sm font-bold text-[#212121]">
              {partner!.user_id.slice(0, 12)}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs text-success font-medium">Actif</span>
          </div>
        </div>
      </div>

      {/* ── Balance couple ── */}
      <CoupleBalanceCard
        user1Paid={balance.user1Paid}
        user2Paid={balance.user2Paid}
        diff={balance.diff}
        partnerName={partner!.user_id.slice(0, 8)}
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
        <div className="bg-white rounded-[12px] border border-[#EEEEEE] p-5" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[#6C5CE7] text-[20px]">category</span>
            <h2 className="font-bold text-[#212121] text-sm">Top catégories</h2>
          </div>
          <CoupleCategoriesPills categories={monthStats.topCategories} locale={locale} />
        </div>
      )}

      {/* ── 10 dernières transactions partagées ── */}
      <div className="bg-white rounded-[12px] border border-[#EEEEEE] p-5" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#6C5CE7] text-[20px]">swap_horiz</span>
          <h2 className="font-bold text-[#212121] text-sm">Transactions partagées</h2>
          <span className="ml-auto text-xs text-[#757575] bg-[#F8F7FC] rounded-full px-2 py-0.5">
            {monthStats.transactionCount}
          </span>
        </div>

        {monthStats.recentTransactions.length === 0 ? (
          <p className="text-[#757575] text-sm text-center py-2">
            Aucune transaction partagée ce mois
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {monthStats.recentTransactions.map((tx, i) => (
              <div
                key={`${tx.date}-${i}`}
                className="flex items-center justify-between py-1.5 border-b border-[#EEEEEE]/50 last:border-0"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#212121] truncate max-w-[180px]">
                    {tx.description}
                  </span>
                  <span className="text-xs text-[#757575]">
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
        <div className="bg-white rounded-[12px] border border-[#EEEEEE] p-5" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[#6C5CE7] text-[20px]">savings</span>
            <h2 className="font-bold text-[#212121] text-sm">Objectifs communs</h2>
          </div>
          <div className="flex flex-col gap-3">
            {sharedGoals.map((goal) => {
              const pct =
                goal.target_amount > 0
                  ? Math.min(
                      100,
                      Math.round((goal.current_amount / goal.target_amount) * 100)
                    )
                  : 0;
              return (
                <div key={goal.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#212121]">{goal.name}</span>
                    <span className="text-[#757575] text-xs">{pct}%</span>
                  </div>
                  <div className="h-2 bg-[#F0EEFF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6C5CE7] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[#757575] mt-1">
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
      <details className="bg-white rounded-[12px] border border-[#EEEEEE] p-5" style={{ boxShadow: "0 1px 3px rgba(108,92,231,0.06)" }}>
        <summary className="flex items-center gap-2 cursor-pointer list-none">
          <span className="material-symbols-outlined text-[#757575] text-[20px]">share</span>
          <span className="text-sm font-medium text-[#757575]">Code d&apos;invitation</span>
          <span className="material-symbols-outlined text-[#757575] text-[16px] ml-auto">
            expand_more
          </span>
        </summary>
        <div className="mt-4">
          <div className="bg-[#F8F7FC] rounded-[12px] p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-[#757575] font-medium uppercase tracking-wide">
                Code d&apos;invitation
              </p>
              <CopyInviteCodeButton inviteCode={couple!.invite_code} />
            </div>
            <p className="text-2xl font-extrabold text-[#6C5CE7] tracking-widest">
              {couple!.invite_code}
            </p>
            <p className="text-xs text-[#757575] mt-1">
              Partagez ce code avec votre partenaire pour qu&apos;il rejoigne votre espace.
            </p>
          </div>
          <form action={leaveCoupleFormAction} className="mt-4">
            <button
              type="submit"
              className="w-full border border-danger/30 text-danger font-bold rounded-[12px] px-4 py-2.5 text-sm hover:bg-danger/5"
            >
              Quitter le couple
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}
