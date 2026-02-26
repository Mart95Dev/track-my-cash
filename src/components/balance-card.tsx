import { formatCurrency } from "@/lib/format";

type BalanceCardProps = {
  totalBalance: number;
  currency: string;
  locale: string;
  momVariation?: number;
};

export function BalanceCard({ totalBalance, currency, locale, momVariation }: BalanceCardProps) {
  const isPositive = (momVariation ?? 0) >= 0;
  const now = new Date();
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="mx-4 mb-4 p-5 rounded-2xl bg-white dark:bg-card-dark shadow-soft border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-1">
        <p className="text-text-muted text-xs font-medium uppercase tracking-wider">Solde total</p>
        <span className="text-text-muted text-xs capitalize">{monthLabel}</span>
      </div>
      <div className="flex items-end gap-2 mt-1">
        <h1 className="text-4xl font-bold text-text-main tracking-tighter leading-none">
          {formatCurrency(totalBalance, currency, locale)}
        </h1>
        {momVariation !== undefined && (
          <span
            className={`mb-0.5 px-2 py-0.5 text-xs font-bold rounded-full ${
              isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}
          >
            {isPositive ? "+" : ""}
            {momVariation.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
