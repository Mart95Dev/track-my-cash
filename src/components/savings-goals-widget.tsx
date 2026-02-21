import type { Goal } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

type Props = {
  goals: Goal[];
};

function getProgressColor(pct: number): string {
  if (pct >= 100) return "bg-income";
  if (pct >= 50) return "bg-amber-500";
  return "bg-expense";
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SavingsGoalsWidget({ goals }: Props) {
  if (goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Objectifs d&apos;épargne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucun objectif défini.{" "}
            <a href="/objectifs" className="underline text-primary">
              Créer un objectif
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4" />
          Objectifs d&apos;épargne
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const pct = goal.target_amount > 0
            ? Math.round((goal.current_amount / goal.target_amount) * 100)
            : 0;
          const clampedPct = Math.min(pct, 100);

          return (
            <div key={goal.id} className="space-y-1" data-testid="goal-progress">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium">{goal.name}</span>
                <span className={`text-xs font-semibold ${pct >= 100 ? "text-income" : "text-muted-foreground"}`}>
                  {pct}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getProgressColor(pct)}`}
                  style={{ width: `${clampedPct}%` }}
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(goal.current_amount, goal.currency)}{" "}
                /{" "}
                {formatCurrency(goal.target_amount, goal.currency)}
                {goal.deadline && (
                  <span className="ml-2">· Échéance&nbsp;: {new Date(goal.deadline).toLocaleDateString("fr-FR")}</span>
                )}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
