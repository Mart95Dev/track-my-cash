import { formatCurrency } from "@/lib/format";

interface CoupleStatsCardProps {
  totalExpenses: number;
  variation: number | null;
  locale: string;
}

export function CoupleStatsCard({ totalExpenses, variation, locale }: CoupleStatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
        <h2 className="font-bold text-text-main text-sm">Dépenses communes du mois</h2>
      </div>
      <p className="text-2xl font-extrabold text-text-main mb-2">
        {formatCurrency(totalExpenses, "EUR", locale)}
      </p>
      {variation !== null && (
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            variation >= 0 ? "text-success" : "text-danger"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {variation >= 0 ? "trending_up" : "trending_down"}
          </span>
          <span>{Math.abs(variation).toFixed(1)}% vs mois précédent</span>
        </div>
      )}
    </div>
  );
}
