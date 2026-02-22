"use server";

import { getBudgets } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { suggestBudgets } from "@/lib/budget-suggester";
import type { BudgetSuggestion, CategoryExpense } from "@/lib/budget-suggester";

export async function getBudgetSuggestionsAction(accountId: number): Promise<BudgetSuggestion[]> {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);

  // Dépenses des 3 derniers mois GROUP BY catégorie + mois
  const result = await db.execute({
    sql: `SELECT strftime('%Y-%m', date) as month, category, SUM(amount) as total
          FROM transactions
          WHERE type = 'expense'
            AND date >= date('now', '-3 months')
            AND account_id = ?
          GROUP BY month, category
          ORDER BY category, month ASC`,
    args: [accountId],
  });

  // Regrouper par catégorie → tableau de montants mensuels
  const byCategory = new Map<string, number[]>();
  for (const row of result.rows) {
    const cat = String(row.category);
    const total = Number(row.total);
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(total);
  }

  const expenses: CategoryExpense[] = [...byCategory.entries()].map(([category, monthlyAmounts]) => ({
    category,
    monthlyAmounts,
  }));

  const budgets = await getBudgets(db, accountId);
  const existingCategories = budgets.map((b) => b.category);

  return suggestBudgets(expenses, existingCategories);
}
