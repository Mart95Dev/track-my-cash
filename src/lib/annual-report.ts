import type { Client } from "@libsql/client";

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface AnnualReportData {
  year: number;
  accountId: number;
  totalIncome: number;
  totalExpenses: number;
  totalNet: number;
  annualSavingsRate: number;
  monthlyData: MonthlyData[];
  topExpenseCategories: {
    category: string;
    total: number;
    percentage: number;
  }[];
  bestMonth: { month: string; net: number } | null;
  worstMonth: { month: string; expenses: number } | null;
}

export async function computeAnnualReport(
  db: Client,
  accountId: number,
  year: number
): Promise<AnnualReportData> {
  const monthly = await db.execute({
    sql: `SELECT strftime('%Y-%m', date) as month,
                 SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
                 SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expenses
          FROM transactions
          WHERE account_id = ? AND strftime('%Y', date) = ?
          GROUP BY month ORDER BY month`,
    args: [accountId, String(year)],
  });

  const categories = await db.execute({
    sql: `SELECT category, SUM(amount) as total
          FROM transactions
          WHERE account_id = ? AND type = 'expense' AND strftime('%Y', date) = ?
          GROUP BY category ORDER BY total DESC LIMIT 5`,
    args: [accountId, String(year)],
  });

  if (monthly.rows.length === 0) {
    return {
      year,
      accountId,
      totalIncome: 0,
      totalExpenses: 0,
      totalNet: 0,
      annualSavingsRate: 0,
      monthlyData: [],
      topExpenseCategories: [],
      bestMonth: null,
      worstMonth: null,
    };
  }

  const monthlyData: MonthlyData[] = monthly.rows.map((r) => {
    const income = Number(r.income);
    const expenses = Number(r.expenses);
    return {
      month: String(r.month),
      income,
      expenses,
      net: income - expenses,
    };
  });

  const totalIncome = monthlyData.reduce((s, m) => s + m.income, 0);
  const totalExpenses = monthlyData.reduce((s, m) => s + m.expenses, 0);
  const totalNet = totalIncome - totalExpenses;
  const annualSavingsRate = totalIncome > 0 ? (totalNet / totalIncome) * 100 : 0;

  const topExpenseCategories = categories.rows.map((r) => ({
    category: String(r.category ?? "Autre"),
    total: Number(r.total),
    percentage: totalExpenses > 0 ? (Number(r.total) / totalExpenses) * 100 : 0,
  }));

  const bestMonth = monthlyData.reduce<MonthlyData | null>((best, m) => {
    if (!best || m.net > best.net) return m;
    return best;
  }, null);

  const worstMonth = monthlyData.reduce<MonthlyData | null>((worst, m) => {
    if (!worst || m.expenses > worst.expenses) return m;
    return worst;
  }, null);

  return {
    year,
    accountId,
    totalIncome,
    totalExpenses,
    totalNet,
    annualSavingsRate,
    monthlyData,
    topExpenseCategories,
    bestMonth: bestMonth ? { month: bestMonth.month, net: bestMonth.net } : null,
    worstMonth: worstMonth ? { month: worstMonth.month, expenses: worstMonth.expenses } : null,
  };
}
