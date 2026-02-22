export interface MoMVariation {
  current: number;
  previous: number | null;
  percentChange: number | null;
  direction: "up" | "down" | "stable" | "no_previous";
}

export function computeMoMVariation(current: number, previous: number | null): MoMVariation {
  if (previous === null || previous === 0) {
    return { current, previous, percentChange: null, direction: "no_previous" };
  }
  const percentChange = ((current - previous) / previous) * 100;
  const direction = percentChange > 0.5 ? "up" : percentChange < -0.5 ? "down" : "stable";
  return { current, previous, percentChange, direction };
}

export interface CategoryExpense {
  category: string;
  total: number;
}

export interface YoYResult {
  category: string;
  currentAmount: number;
  previousAmount: number;
  delta: number;
  deltaPercent: number;
  trend: "up" | "down" | "stable";
}

/**
 * Compare les dépenses par catégorie entre l'année en cours (N) et l'année précédente (N-1).
 * Seules les catégories présentes dans `current` sont incluses dans le résultat.
 * Seuil de significativité : ±10%.
 */
export function computeYoYComparison(
  current: CategoryExpense[],
  previous: CategoryExpense[]
): YoYResult[] {
  const previousMap = new Map(previous.map((p) => [p.category, p.total]));

  return current.map((c) => {
    const previousAmount = previousMap.get(c.category) ?? 0;
    const delta = c.total - previousAmount;

    let deltaPercent: number;
    let trend: "up" | "down" | "stable";

    if (previousAmount === 0) {
      deltaPercent = 100;
      trend = "up";
    } else {
      deltaPercent = (delta / previousAmount) * 100;
      trend = deltaPercent > 10 ? "up" : deltaPercent < -10 ? "down" : "stable";
    }

    return {
      category: c.category,
      currentAmount: c.total,
      previousAmount,
      delta,
      deltaPercent,
      trend,
    };
  });
}
