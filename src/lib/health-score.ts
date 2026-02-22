export interface HealthScoreInput {
  monthlySummaries: { income: number; expenses: number }[];
  budgets: { category: string; amount_limit: number; spent: number }[];
  goals: { target_amount: number; current_amount: number }[];
}

export interface HealthScore {
  total: number;           // 0-100 (arrondi)
  savingsScore: number;    // 0-25
  budgetsScore: number;    // 0-25
  goalsScore: number;      // 0-25
  stabilityScore: number;  // 0-25
  label: "Excellent" | "Bon" | "À améliorer" | "Attention";
}

export function computeHealthScore(data: HealthScoreInput): HealthScore {
  // --- 1. Taux d'épargne (0-25) ---
  // Moyenne du taux d'épargne mensuel ; plafonné à 25 si ≥ 20%
  const validMonths = data.monthlySummaries.filter((m) => m.income > 0);
  let savingsScore: number;
  if (validMonths.length === 0) {
    savingsScore = 0;
  } else {
    const avgRate =
      validMonths.reduce((sum, m) => sum + (m.income - m.expenses) / m.income, 0) /
      validMonths.length;
    // avgRate × 100 donne le pourcentage d'épargne
    // score = pourcentage × 25/20 (plafonné à 25)
    savingsScore = Math.min(25, Math.max(0, avgRate * 100 * 25 / 20));
  }

  // --- 2. Respect des budgets (0-25) ---
  let budgetsScore: number;
  if (data.budgets.length === 0) {
    budgetsScore = 12.5;
  } else {
    const okCount = data.budgets.filter((b) => b.spent <= b.amount_limit).length;
    budgetsScore = (okCount / data.budgets.length) * 25;
  }

  // --- 3. Progression des objectifs (0-25) ---
  let goalsScore: number;
  if (data.goals.length === 0) {
    goalsScore = 12.5;
  } else {
    const avgProgress =
      data.goals.reduce((sum, g) => {
        const pct = g.target_amount > 0 ? g.current_amount / g.target_amount : 0;
        return sum + Math.min(1, pct); // plafonné à 1 (100%)
      }, 0) / data.goals.length;
    goalsScore = avgProgress * 25;
  }

  // --- 4. Stabilité des revenus (0-25) ---
  // Coefficient de variation (CV = écart-type / moyenne) des revenus mensuels
  const incomes = data.monthlySummaries.map((m) => m.income);
  let stabilityScore: number;
  if (incomes.length < 2) {
    stabilityScore = 25; // données insuffisantes → stable par défaut
  } else {
    const mean = incomes.reduce((s, v) => s + v, 0) / incomes.length;
    if (mean === 0) {
      stabilityScore = 0;
    } else {
      const variance = incomes.reduce((s, v) => s + (v - mean) ** 2, 0) / incomes.length;
      const cv = Math.sqrt(variance) / mean;
      // cv ≤ 0.1 → 25 pts, cv ≥ 0.5 → 0 pts (linéaire inverse)
      if (cv <= 0.1) {
        stabilityScore = 25;
      } else if (cv >= 0.5) {
        stabilityScore = 0;
      } else {
        stabilityScore = 25 * (1 - (cv - 0.1) / (0.5 - 0.1));
      }
    }
  }

  const rawTotal = savingsScore + budgetsScore + goalsScore + stabilityScore;
  const total = Math.min(100, Math.max(0, Math.round(rawTotal)));

  let label: HealthScore["label"];
  if (total >= 80) label = "Excellent";
  else if (total >= 60) label = "Bon";
  else if (total >= 40) label = "À améliorer";
  else label = "Attention";

  return {
    total,
    savingsScore: Math.round(savingsScore * 10) / 10,
    budgetsScore: Math.round(budgetsScore * 10) / 10,
    goalsScore: Math.round(goalsScore * 10) / 10,
    stabilityScore: Math.round(stabilityScore * 10) / 10,
    label,
  };
}
