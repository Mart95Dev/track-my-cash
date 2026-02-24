import { getGoals, deleteGoal, getAllAccounts } from "@/lib/queries";
import { getUserDb, getDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { GoalForm } from "@/components/goal-form";
import { GoalList } from "@/components/goal-list";
import {
  getCoupleByUserId,
  getCoupleMembers,
  getCoupleSharedGoals,
  type CoupleGoalItem,
} from "@/lib/couple-queries";
import { canUsePremiumCoupleFeature } from "@/lib/subscription-utils";

export const dynamic = "force-dynamic";

export { deleteGoal };

export default async function ObjectifsPage() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const [goals, accounts] = await Promise.all([getGoals(db), getAllAccounts(db)]);

  const totalSavings = goals.reduce((sum, g) => sum + g.current_amount, 0);

  // ─── Couple section ────────────────────────────────────────────────────────
  let hasCoupleActive = false;
  let isPremium = false;
  let coupleId: string | undefined;
  let coupleSharedGoals: CoupleGoalItem[] = [];

  try {
    const mainDb = getDb();
    const couple = await getCoupleByUserId(mainDb, userId);
    if (couple) {
      hasCoupleActive = true;
      coupleId = couple.id;
      const gate = await canUsePremiumCoupleFeature(userId);
      isPremium = gate.allowed;

      if (isPremium) {
        const members = await getCoupleMembers(mainDb, couple.id);
        const partner = members.find((m) => m.user_id !== userId);
        if (partner) {
          const partnerDb = await getUserDb(partner.user_id);
          coupleSharedGoals = await getCoupleSharedGoals(db, partnerDb, couple.id);
        }
      }
    }
  } catch {
    // Silently ignore — couple feature non critique
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[28px]">savings</span>
          <h1 className="text-2xl font-bold text-text-main">Objectifs d&apos;épargne</h1>
        </div>
        {goals.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-text-muted">Total épargné</p>
            <p className="text-sm font-bold text-success">
              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: goals[0]?.currency ?? "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(totalSavings)}
            </p>
          </div>
        )}
      </div>

      {/* Liste objectifs personnels */}
      {goals.length > 0 && (
        <div>
          <h2 className="font-bold text-text-main mb-3">Mes objectifs</h2>
          <GoalList goals={goals} />
        </div>
      )}

      {/* Objectifs communs couple */}
      {hasCoupleActive && isPremium && coupleSharedGoals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">favorite</span>
            <h2 className="font-bold text-text-main">Objectifs communs</h2>
          </div>
          <div className="flex flex-col gap-3">
            {coupleSharedGoals.map((g, i) => {
              const pct = g.target_amount > 0
                ? Math.min(100, Math.round((g.current_amount / g.target_amount) * 100))
                : 0;
              return (
                <div key={`${g.id}-${i}`} className="rounded-xl bg-background-light px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-text-main">{g.name}</span>
                    <span className="text-xs font-bold text-primary">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-200">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {g.current_amount.toLocaleString("fr-FR")} € sur {g.target_amount.toLocaleString("fr-FR")} €
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Banner upgrade couple si actif sans Premium */}
      {hasCoupleActive && !isPremium && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[24px]">favorite</span>
          <div>
            <p className="text-sm font-bold text-text-main">Objectifs couple disponibles avec Premium</p>
            <p className="text-xs text-text-muted">Créez des objectifs d&apos;épargne partagés avec votre partenaire.</p>
          </div>
        </div>
      )}

      {/* Formulaire ajout */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
          <h2 className="font-bold text-text-main">Nouvel objectif</h2>
        </div>
        <GoalForm
          accounts={accounts}
          hasCoupleActive={hasCoupleActive}
          isPremium={isPremium}
          coupleId={coupleId}
        />
      </div>

      {/* Empty state si aucun objectif */}
      {goals.length === 0 && coupleSharedGoals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="material-symbols-outlined text-text-muted text-[48px] mb-3">savings</span>
          <p className="text-text-muted text-sm">Créez votre premier objectif d&apos;épargne ci-dessus</p>
        </div>
      )}
    </div>
  );
}
