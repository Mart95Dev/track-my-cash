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

export function getBudgetColor(percent: number): string {
  if (percent >= 100) return "bg-danger";
  if (percent >= 80) return "bg-warning";
  return "bg-primary";
}

export function getBudgetBadgeColor(percent: number): string {
  if (percent >= 100) return "bg-danger/10 text-danger";
  if (percent >= 80) return "bg-warning/10 text-warning";
  return "bg-primary/10 text-primary";
}

export function BudgetProgress({ budget, currency = "EUR", accountId }: Props) {
  const { category, spent, limit, percentage } = budget;
  const clampedPct = Math.min(Math.round(percentage), 100);
  const barColor = getBudgetColor(clampedPct);
  const badgeColor = getBudgetBadgeColor(clampedPct);
  const remaining = limit - spent;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4" data-testid="budget-progress">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-main">{category}</span>
          {accountId && (
            <BudgetHistoryDialog
              accountId={accountId}
              category={category}
              currency={currency}
            />
          )}
        </div>
        <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${badgeColor}`}>
          {clampedPct}%
        </span>
      </div>
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-text-muted text-xs">
          {formatAmount(spent, currency)} sur {formatAmount(limit, currency)}
        </p>
        <p className="text-text-muted text-xs">
          Reste&nbsp;: {formatAmount(Math.max(remaining, 0), currency)}
        </p>
      </div>
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${clampedPct}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
