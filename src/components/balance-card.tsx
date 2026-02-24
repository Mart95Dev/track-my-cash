import { formatCurrency } from "@/lib/format";

type BalanceCardProps = {
  totalBalance: number;
  currency: string;
  locale: string;
  momVariation?: number;
};

export function BalanceCard({ totalBalance, currency, locale, momVariation }: BalanceCardProps) {
  const isPositive = (momVariation ?? 0) >= 0;
  return (
    <div className="mx-4 mb-4 p-6 rounded-2xl bg-white shadow-soft border border-gray-100">
      <p className="text-text-muted text-sm font-medium mb-1">Solde total</p>
      <div className="flex items-end gap-2 mb-1">
        <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
          {formatCurrency(totalBalance, currency, locale)}
        </h1>
        {momVariation !== undefined && (
          <span
            className={`mb-1 px-2 py-0.5 text-xs font-bold rounded-md ${
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
