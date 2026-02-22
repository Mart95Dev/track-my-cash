import type { BudgetStatus } from "@/lib/queries";
import { BudgetHistoryDialog } from "@/components/budget-history-dialog";

type Props = {
  budget: BudgetStatus;
  currency?: string;
  accountId?: number;
};

function formatAmount(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BudgetProgress({ budget, currency = "EUR", accountId }: Props) {
  const { category, spent, limit, percentage } = budget;
  const isOver = percentage > 100;
  const clampedPct = Math.min(percentage, 100);

  return (
    <div className="space-y-1" data-testid="budget-progress">
      <div className="flex justify-between items-baseline">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{category}</span>
          {accountId && (
            <BudgetHistoryDialog
              accountId={accountId}
              category={category}
              currency={currency}
            />
          )}
        </div>
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
