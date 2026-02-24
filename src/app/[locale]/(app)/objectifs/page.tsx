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

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="material-symbols-outlined text-primary text-[28px]">flag</span>
        <h1 className="text-2xl font-bold text-text-main">Objectifs d&apos;épargne</h1>
      </div>

      {/* Formulaire ajout */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
          <h2 className="font-bold text-text-main">Nouvel objectif</h2>
        </div>
        <GoalForm accounts={accounts} />
      </div>

      {/* Liste objectifs */}
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="material-symbols-outlined text-text-muted text-[48px] mb-3">flag</span>
          <p className="text-text-muted text-sm">Aucun objectif défini</p>
        </div>
      ) : (
        <GoalList goals={goals} />
      )}
    </div>
  );
}
