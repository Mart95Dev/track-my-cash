import { getGoals, deleteGoal, getAllAccounts } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { GoalForm } from "@/components/goal-form";
import { GoalList } from "@/components/goal-list";

export const dynamic = "force-dynamic";

export { deleteGoal };

export default async function ObjectifsPage() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const [goals, accounts] = await Promise.all([getGoals(db), getAllAccounts(db)]);

  const totalSavings = goals.reduce((sum, g) => sum + g.current_amount, 0);

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

      {/* Liste objectifs */}
      {goals.length > 0 && (
        <div>
          <h2 className="font-bold text-text-main mb-3">Mes objectifs</h2>
          <GoalList goals={goals} />
        </div>
      )}

      {/* Formulaire ajout */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
          <h2 className="font-bold text-text-main">Nouvel objectif</h2>
        </div>
        <GoalForm accounts={accounts} />
      </div>

      {/* Empty state si aucun objectif */}
      {goals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="material-symbols-outlined text-text-muted text-[48px] mb-3">savings</span>
          <p className="text-text-muted text-sm">Créez votre premier objectif d&apos;épargne ci-dessus</p>
        </div>
      )}
    </div>
  );
}
