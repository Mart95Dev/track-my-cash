import type { BudgetStatus } from "@/lib/queries";

type Props = {
  budget: BudgetStatus;
  currency?: string;
};

function formatAmount(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BudgetProgress({ budget, currency = "EUR" }: Props) {
  const { category, spent, limit, percentage } = budget;
  const isOver = percentage > 100;
  const clampedPct = Math.min(percentage, 100);

  return (
    <div className="space-y-1" data-testid="budget-progress">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium">{category}</span>
        <span className={`text-xs ${isOver ? "text-expense font-semibold" : "text-muted-foreground"}`}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOver ? "bg-expense" : "bg-primary"}`}
          style={{ width: `${clampedPct}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Dépensé&nbsp;: {formatAmount(spent, currency)} / Budget&nbsp;: {formatAmount(limit, currency)}
      </p>
    </div>
  );
}
