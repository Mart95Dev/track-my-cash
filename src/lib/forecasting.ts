import type { SpendingTrendEntry, Budget } from "@/lib/queries";

export interface CategoryForecast {
  category: string;
  avgAmount: number;
  lastMonthAmount: number;
  budgetLimit: number | null;
  trend: "up" | "down" | "stable";
  status: "on_track" | "at_risk" | "exceeded" | "no_budget";
}

export function computeForecast(
  trendData: SpendingTrendEntry[],
  budgets: Budget[]
): CategoryForecast[] {
  if (trendData.length === 0) return [];

  // Grouper par catégorie
  const byCategory = new Map<string, { month: string; amount: number }[]>();
  for (const entry of trendData) {
    const existing = byCategory.get(entry.category) ?? [];
    existing.push({ month: entry.month, amount: entry.amount });
    byCategory.set(entry.category, existing);
  }

  const results: CategoryForecast[] = [];

  for (const [category, entries] of byCategory) {
    // Trier par mois ASC
    const sorted = [...entries].sort((a, b) => a.month.localeCompare(b.month));
    const avgAmount = sorted.reduce((sum, e) => sum + e.amount, 0) / sorted.length;
    const lastMonthAmount = sorted[sorted.length - 1]?.amount ?? 0;

    // Tendance : dernier mois vs moyenne
    const STABLE_THRESHOLD = 0.05; // 5%
    let trend: CategoryForecast["trend"];
    if (sorted.length < 2) {
      trend = "stable";
    } else {
      const ratio = (lastMonthAmount - avgAmount) / (avgAmount || 1);
      if (ratio > STABLE_THRESHOLD) trend = "up";
      else if (ratio < -STABLE_THRESHOLD) trend = "down";
      else trend = "stable";
    }

    // Budget et statut
    const budget = budgets.find((b) => b.category === category);
    const budgetLimit = budget ? budget.amount_limit : null;

    let status: CategoryForecast["status"];
    if (budgetLimit === null) {
      status = "no_budget";
    } else if (avgAmount > budgetLimit) {
      status = "exceeded";
    } else if (avgAmount >= budgetLimit * 0.8) {
      status = "at_risk";
    } else {
      status = "on_track";
    }

    results.push({ category, avgAmount, lastMonthAmount, budgetLimit, trend, status });
  }

  // Trier par avgAmount décroissant
  return results.sort((a, b) => b.avgAmount - a.avgAmount);
}
