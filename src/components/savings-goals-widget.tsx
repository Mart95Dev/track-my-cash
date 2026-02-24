import type { Goal } from "@/lib/queries";

type Props = {
  goals: Goal[];
};

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
    return null;
  }

  return (
    <div className="space-y-3">
      {goals.map((goal) => {
        const pct = goal.target_amount > 0
          ? Math.round((goal.current_amount / goal.target_amount) * 100)
          : 0;
        const clampedPct = Math.min(pct, 100);

        return (
          <div
            key={goal.id}
            className="bg-primary rounded-2xl p-4 text-white"
            data-testid="goal-progress"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-0.5">Objectif</p>
                <p className="text-white font-bold text-base leading-tight">{goal.name}</p>
              </div>
              <span className="text-xl font-extrabold text-white">
                {formatCurrency(goal.current_amount, goal.currency)}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${clampedPct}%` }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-xs">
                Objectif : {formatCurrency(goal.target_amount, goal.currency)}
              </span>
              <span className="text-white text-xs font-bold">{clampedPct}%</span>
            </div>
            {goal.deadline && (
              <p className="text-white/60 text-xs mt-1">
                Échéance : {new Date(goal.deadline).toLocaleDateString("fr-FR")}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
