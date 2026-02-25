import { formatCurrency } from "@/lib/format";

interface CoupleCategoriesPillsProps {
  categories: Array<{ category: string; total: number }>;
  locale?: string;
}

export function CoupleCategoriesPills({
  categories,
  locale = "fr",
}: CoupleCategoriesPillsProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <div
          key={cat.category}
          className="flex items-center gap-1.5 bg-primary/10 rounded-full px-3 py-1.5"
        >
          <span className="text-sm font-medium text-primary">{cat.category}</span>
          <span className="text-xs text-text-muted">
            {formatCurrency(cat.total, "EUR", locale)}
          </span>
        </div>
      ))}
    </div>
  );
}
