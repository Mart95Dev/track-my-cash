import { getGoals, deleteGoal, getAllAccounts } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalForm } from "@/components/goal-form";
import { GoalList } from "@/components/goal-list";
import { Target } from "lucide-react";

export const dynamic = "force-dynamic";

// Exporte pour que GoalList puisse l'utiliser côté serveur
export { deleteGoal };

export default async function ObjectifsPage() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const [goals, accounts] = await Promise.all([getGoals(db), getAllAccounts(db)]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Target className="h-6 w-6" />
        Objectifs d&apos;épargne
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Nouvel objectif</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalForm accounts={accounts} />
        </CardContent>
      </Card>

      <GoalList goals={goals} />
    </div>
  );
}
