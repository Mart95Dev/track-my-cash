export interface FinancialSummary {
  exceededBudgets: { category: string }[];
  lateGoals: { name: string }[];
  savingsRate: number; // pourcentage (ex: 15 pour 15%)
}

const ALWAYS_SUGGESTIONS = [
  "Résume ma situation financière",
  "Où puis-je réduire mes dépenses ?",
  "Quelles sont mes charges fixes ?",
  "Comment optimiser mon budget ?",
] as const;

export function generateChatSuggestions(context: FinancialSummary): string[] {
  const suggestions: string[] = [];

  // Priorité 1 : budgets dépassés
  for (const budget of context.exceededBudgets) {
    if (suggestions.length >= 6) break;
    suggestions.push(`Pourquoi mon budget ${budget.category} est-il dépassé ?`);
  }

  // Priorité 2 : objectifs en retard
  for (const goal of context.lateGoals) {
    if (suggestions.length >= 6) break;
    suggestions.push(`Comment atteindre mon objectif ${goal.name} ?`);
  }

  // Priorité 3 : faible taux d'épargne (< 10%)
  if (context.savingsRate < 10 && suggestions.length < 6) {
    suggestions.push("Comment améliorer mon taux d'épargne ?");
  }

  // Toujours présentes : compléter jusqu'à 6
  for (const s of ALWAYS_SUGGESTIONS) {
    if (suggestions.length >= 6) break;
    suggestions.push(s);
  }

  return suggestions;
}
