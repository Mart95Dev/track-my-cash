import { formatCurrency } from "@/lib/format";

type KpiCardsProps = {
  revenue: number;
  expenses: number;
  recurring: number;
  currency: string;
  locale: string;
};

function KpiCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl p-4 bg-white shadow-soft border border-gray-100">
      <div
        className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center ${iconColor} mb-1`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
          {icon}
        </span>
      </div>
      <p className="text-text-muted text-xs font-medium">{label}</p>
      <p className="text-text-main text-sm font-bold tracking-tight">{value}</p>
    </div>
  );
}

export function KpiCards({ revenue, expenses, recurring, currency, locale }: KpiCardsProps) {
  const fmt = (n: number) => formatCurrency(n, currency, locale);
  return (
    <div className="grid grid-cols-3 gap-3 px-4 mb-4">
      <KpiCard
        icon="arrow_downward"
        iconBg="bg-green-100"
        iconColor="text-success"
        label="Revenus"
        value={fmt(revenue)}
      />
      <KpiCard
        icon="arrow_upward"
        iconBg="bg-red-100"
        iconColor="text-danger"
        label="Dépenses"
        value={fmt(expenses)}
      />
      <KpiCard
        icon="autorenew"
        iconBg="bg-primary/10"
        iconColor="text-primary"
        label="Récurrents"
        value={fmt(recurring)}
      />
    </div>
  );
}
