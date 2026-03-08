import type { Client } from "@libsql/client";
import type { Account, SpendingTrendEntry, CategoryExpense, WeeklySummaryData } from "./types";
import { getAllAccounts } from "./account-queries";

export async function getDashboardData(db: Client, accountId?: number) {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthEnd = nextMonth.toISOString().split("T")[0];

  const accFilter = accountId ? " AND account_id = ?" : "";
  const filteredArgs: (string | number)[] = accountId ? [monthStart, monthEnd, accountId] : [monthStart, monthEnd];

  const monthlyIncome = await db.execute({
    sql: `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND date >= ? AND date < ?${accFilter}`,
    args: filteredArgs,
  });

  const monthlyExpenses = await db.execute({
    sql: `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date >= ? AND date < ?${accFilter}`,
    args: filteredArgs,
  });

  const recurringFilter = accountId ? " AND account_id = ?" : "";
  const recurringArgs: (string | number)[] = accountId ? [accountId] : [];

  const recurringTotal = await db.execute({
    sql: `SELECT COALESCE(SUM(
      CASE frequency
        WHEN 'monthly' THEN amount
        WHEN 'weekly' THEN amount * 4.33
        WHEN 'yearly' THEN amount / 12.0
        ELSE amount
      END
    ), 0) as total FROM recurring_payments WHERE type = 'expense'${recurringFilter}`,
    args: recurringArgs,
  });

  const accounts = await getAllAccounts(db);

  return {
    monthlyIncome: Number(monthlyIncome.rows[0].total),
    monthlyExpenses: Number(monthlyExpenses.rows[0].total),
    recurringMonthly: Number(recurringTotal.rows[0].total),
    accounts,
  };
}

export async function getMonthlyBalanceHistory(db: Client, months: number = 12, accountId?: number) {
  const allAccounts = await getAllAccounts(db);
  const accounts = accountId ? allAccounts.filter((a) => a.id === accountId) : allAccounts;
  const now = new Date();
  const data: { month: string; total: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const dateStr = endOfMonth.toISOString().split("T")[0];
    const label = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });

    let total = 0;
    for (const account of accounts) {
      const result = await db.execute({
        sql: `SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as net
          FROM transactions WHERE account_id = ? AND date >= ? AND date <= ?`,
        args: [account.id, account.balance_date, dateStr],
      });
      total += account.initial_balance + Number(result.rows[0].net);
    }
    data.push({ month: label, total: Math.round(total * 100) / 100 });
  }
  return data;
}

export async function getMonthlySummary(db: Client, accountId?: number) {
  const where = accountId ? "WHERE account_id = ?" : "";
  const args: number[] = accountId ? [accountId] : [];

  const result = await db.execute({
    sql: `SELECT
      strftime('%Y-%m', date) as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM transactions
    ${where}
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month DESC
    LIMIT 12`,
    args,
  });

  return result.rows.map((row) => {
    const income = Number(row.income);
    const expenses = Number(row.expenses);
    const net = income - expenses;
    const savingsRate = income > 0 ? (net / income) * 100 : null;
    return { month: String(row.month), income, expenses, net, savingsRate };
  });
}

export async function getExpensesByCategory(db: Client, accountId?: number) {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthEnd = nextMonth.toISOString().split("T")[0];

  const where = accountId
    ? "type = 'expense' AND date >= ? AND date < ? AND account_id = ?"
    : "type = 'expense' AND date >= ? AND date < ?";
  const args: (string | number)[] = accountId
    ? [monthStart, monthEnd, accountId]
    : [monthStart, monthEnd];

  const result = await db.execute({
    sql: `SELECT COALESCE(NULLIF(t.subcategory, ''), t.category) as pattern_cat, SUM(amount) as total
      FROM transactions t
      WHERE ${where}
      GROUP BY pattern_cat ORDER BY total DESC`,
    args,
  });

  return result.rows.map((row) => ({
    category: String(row.pattern_cat),
    total: Number(row.total),
  }));
}

export async function getExpensesByBroadCategory(db: Client, accountId?: number) {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthEnd = nextMonth.toISOString().split("T")[0];

  const where = accountId
    ? "type = 'expense' AND date >= ? AND date < ? AND account_id = ?"
    : "type = 'expense' AND date >= ? AND date < ?";
  const args: (string | number)[] = accountId
    ? [monthStart, monthEnd, accountId]
    : [monthStart, monthEnd];

  const result = await db.execute({
    sql: `SELECT t.category as broad_category, SUM(t.amount) as total
      FROM transactions t
      WHERE ${where}
      GROUP BY broad_category
      ORDER BY total DESC`,
    args,
  });

  return result.rows.map((row) => ({
    category: String(row.broad_category),
    total: Number(row.total),
  }));
}

export async function getSpendingTrend(
  db: Client,
  months: number,
  accountId?: number
): Promise<SpendingTrendEntry[]> {
  const where = accountId
    ? "type = 'expense' AND date >= date('now', ?) AND account_id = ?"
    : "type = 'expense' AND date >= date('now', ?)";
  const args: (string | number)[] = accountId
    ? [`-${months} months`, accountId]
    : [`-${months} months`];

  const result = await db.execute({
    sql: `SELECT strftime('%Y-%m', date) as month, category, SUM(amount) as total
      FROM transactions
      WHERE ${where}
      GROUP BY month, category
      ORDER BY month ASC, total DESC`,
    args,
  });

  return result.rows.map((row) => ({
    month: String(row.month),
    category: String(row.category),
    amount: Number(row.total),
  }));
}

export async function getWeeklySummaryData(
  db: Client,
  weekStart: string,
  weekEnd: string,
  accountId?: number
): Promise<Omit<WeeklySummaryData, "currency">> {
  const accountFilter = accountId ? "AND t.account_id = ?" : "";
  const accountArgs: number[] = accountId ? [accountId] : [];

  const totalsResult = await db.execute({
    sql: `SELECT
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
          FROM transactions t
          WHERE t.date >= ? AND t.date <= ? ${accountFilter}`,
    args: [weekStart, weekEnd, ...accountArgs],
  });

  const totalsRow = totalsResult.rows[0];
  const totalIncome = totalsRow ? Number(totalsRow.total_income) : 0;
  const totalExpenses = totalsRow ? Number(totalsRow.total_expenses) : 0;

  const categoriesResult = await db.execute({
    sql: `SELECT t.category, COALESCE(SUM(t.amount), 0) as amount
          FROM transactions t
          WHERE t.date >= ? AND t.date <= ? AND t.type = 'expense' ${accountFilter}
          GROUP BY t.category
          ORDER BY amount DESC
          LIMIT 3`,
    args: [weekStart, weekEnd, ...accountArgs],
  });

  const topCategories = categoriesResult.rows.map((row) => ({
    category: String(row.category),
    amount: Number(row.amount),
  }));

  const budgetsOverResult = await db.execute({
    sql: `SELECT b.category, b.amount_limit,
                 COALESCE(SUM(t.amount), 0) as spent
          FROM budgets b
          LEFT JOIN transactions t ON t.account_id = b.account_id
            AND t.category = b.category
            AND t.type = 'expense'
            AND t.date >= date('now', 'start of month')
          GROUP BY b.id
          HAVING spent > b.amount_limit`,
    args: [],
  });

  const budgetsOver = budgetsOverResult.rows.map((row) => ({
    category: String(row.category),
    spent: Number(row.spent),
    limit: Number(row.amount_limit),
  }));

  const goalsResult = await db.execute({
    sql: `SELECT name, target_amount, current_amount
          FROM goals
          ORDER BY created_at DESC
          LIMIT 3`,
    args: [],
  });

  const goalsProgress = goalsResult.rows.map((row) => ({
    name: String(row.name),
    percent:
      Number(row.target_amount) > 0
        ? Math.min(100, Math.round((Number(row.current_amount) / Number(row.target_amount)) * 100))
        : 0,
  }));

  return {
    weekStart,
    weekEnd,
    totalExpenses,
    totalIncome,
    topCategories,
    budgetsOver,
    goalsProgress,
  };
}

export async function getMonthlyExpensesByCategory(
  db: Client,
  accountId: number | undefined,
  year: number,
  month: number
): Promise<CategoryExpense[]> {
  const yearStr = String(year);
  const monthStr = String(month).padStart(2, "0");

  const where = accountId
    ? "type = 'expense' AND strftime('%Y', date) = ? AND strftime('%m', date) = ? AND account_id = ?"
    : "type = 'expense' AND strftime('%Y', date) = ? AND strftime('%m', date) = ?";

  const args: (string | number)[] = accountId
    ? [yearStr, monthStr, accountId]
    : [yearStr, monthStr];

  const result = await db.execute({
    sql: `SELECT category, SUM(amount) as total
      FROM transactions
      WHERE ${where}
      GROUP BY category
      ORDER BY total DESC`,
    args,
  });

  return result.rows.map((row) => ({
    category: String(row.category),
    total: Number(row.total),
  }));
}
