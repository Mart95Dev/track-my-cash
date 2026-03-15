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
  valueColor,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl p-3.5 bg-white shadow-soft border border-gray-100">
      <div
        className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} shrink-0`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
          {icon}
        </span>
      </div>
      <p className="text-text-muted text-[11px] font-medium mt-0.5">{label}</p>
      <p className={`text-sm font-extrabold tracking-tight leading-none ${valueColor}`}>{value}</p>
    </div>
  );
}

export function KpiCards({ revenue, expenses, recurring, currency, locale }: KpiCardsProps) {
  const fmt = (n: number) => formatCurrency(n, currency, locale);
  return (
    <div className="grid grid-cols-3 gap-3 px-4 mb-4">
      <KpiCard
        icon="arrow_circle_down"
        iconBg="bg-success/10"
        iconColor="text-success"
        label="Entrées"
        value={fmt(revenue)}
        valueColor="text-success"
      />
      <KpiCard
        icon="arrow_circle_up"
        iconBg="bg-danger/10"
        iconColor="text-danger"
        label="Sorties"
        value={fmt(expenses)}
        valueColor="text-danger"
      />
      <KpiCard
        icon="autorenew"
        iconBg="bg-primary/10"
        iconColor="text-primary"
        label="Fixes"
        value={fmt(recurring)}
        valueColor="text-text-main"
      />
    </div>
  );
}
