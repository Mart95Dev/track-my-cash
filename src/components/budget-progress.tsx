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
  if (percent >= 90) return "bg-danger";
  if (percent >= 60) return "bg-warning";
  return "bg-success";
}

export function getBudgetBadgeColor(percent: number): string {
  if (percent >= 90) return "bg-danger/10 text-danger";
  if (percent >= 60) return "bg-warning/10 text-warning";
  return "bg-success/10 text-success";
}

export function BudgetProgress({ budget, currency = "EUR", accountId }: Props) {
  const { category, spent, limit, percentage } = budget;
  const clampedPct = Math.min(Math.round(percentage), 100);
  const barColor = getBudgetColor(clampedPct);
  const badgeColor = getBudgetBadgeColor(clampedPct);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-4" data-testid="budget-progress">
      <div className="flex items-center justify-between mb-3">
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
        <span className={`text-xs font-bold rounded-md px-2 py-1 ${badgeColor}`}>
          {clampedPct}%
        </span>
      </div>
      <p className="text-text-muted text-xs mb-2">
        {formatAmount(spent, currency)} sur {formatAmount(limit, currency)}
      </p>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
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
