export interface CategoryExpense {
  category: string;
  monthlyAmounts: number[]; // montants des mois disponibles (max 3)
}

export interface BudgetSuggestion {
  category: string;
  suggestedLimit: number; // arrondi à la dizaine supérieure
  avgAmount: number;      // moyenne brute (non arrondie)
  confidence: "high" | "medium" | "low";
}

function roundUpToTen(n: number): number {
  return Math.ceil(n / 10) * 10;
}

function coefficientOfVariation(amounts: number[]): number {
  const avg = amounts.reduce((s, v) => s + v, 0) / amounts.length;
  if (avg === 0) return 0;
  const variance = amounts.reduce((s, v) => s + (v - avg) ** 2, 0) / amounts.length;
  return Math.sqrt(variance) / avg;
}

export function suggestBudgets(
  expenses: CategoryExpense[],
  existingBudgetCategories: string[],
  maxSuggestions = 8
): BudgetSuggestion[] {
  const excluded = new Set(existingBudgetCategories);
  const suggestions: BudgetSuggestion[] = [];

  for (const expense of expenses) {
    if (suggestions.length >= maxSuggestions) break;
    if (excluded.has(expense.category)) continue;
    if (expense.monthlyAmounts.length < 2) continue;

    const avg = expense.monthlyAmounts.reduce((s, v) => s + v, 0) / expense.monthlyAmounts.length;
    const cv = coefficientOfVariation(expense.monthlyAmounts);

    let confidence: "high" | "medium" | "low";
    if (expense.monthlyAmounts.length >= 3 && cv <= 0.15) {
      confidence = "high";
    } else if (cv <= 0.30) {
      confidence = "medium";
    } else {
      confidence = "low";
    }

    suggestions.push({
      category: expense.category,
      suggestedLimit: roundUpToTen(avg),
      avgAmount: avg,
      confidence,
    });
  }

  return suggestions;
}
