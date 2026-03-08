import type { Client } from "@libsql/client";
import type { Budget, BudgetStatus, BudgetHistoryEntry } from "./types";

export async function getBudgets(db: Client, accountId: number): Promise<Budget[]> {
  const result = await db.execute({
    sql: "SELECT * FROM budgets WHERE account_id = ? ORDER BY category",
    args: [accountId],
  });
  return result.rows.map((row) => ({
    id: Number(row.id),
    account_id: Number(row.account_id),
    category: String(row.category),
    amount_limit: Number(row.amount_limit),
    period: String(row.period) as "monthly" | "yearly",
    created_at: String(row.created_at),
    last_budget_alert_at: row.last_budget_alert_at != null ? String(row.last_budget_alert_at) : null,
    last_budget_alert_type: row.last_budget_alert_type != null
      ? String(row.last_budget_alert_type) as "warning" | "exceeded"
      : null,
  }));
}

export async function getBudgetStatus(
  db: Client,
  accountId: number
): Promise<BudgetStatus[]> {
  const result = await db.execute({
    sql: `
      SELECT b.category, b.amount_limit, b.period,
             COALESCE(SUM(t.amount), 0) as spent
      FROM budgets b
      LEFT JOIN transactions t ON t.account_id = b.account_id
        AND t.category = b.category
        AND t.type = 'expense'
        AND t.date >= CASE b.period
          WHEN 'yearly' THEN strftime('%Y-01-01', 'now')
          ELSE date('now', 'start of month')
        END
        AND t.date <= CASE b.period
          WHEN 'yearly' THEN strftime('%Y-12-31', 'now')
          ELSE date('now', 'start of month', '+1 month', '-1 day')
        END
      WHERE b.account_id = ?
      GROUP BY b.id
    `,
    args: [accountId],
  });

  return result.rows.map((row) => ({
    category: String(row.category),
    spent: Number(row.spent),
    limit: Number(row.amount_limit),
    percentage: Number(row.amount_limit) > 0
      ? (Number(row.spent) / Number(row.amount_limit)) * 100
      : 0,
    period: String(row.period) as "monthly" | "yearly",
  }));
}

export async function snapshotBudgetHistory(db: Client, accountId: number): Promise<void> {
  const month = new Date().toISOString().slice(0, 7);
  const statuses = await getBudgetStatus(db, accountId);
  for (const s of statuses) {
    try {
      await db.execute({
        sql: `INSERT INTO budget_history (account_id, category, period, limit_amount, spent_amount, month)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [accountId, s.category, s.period, s.limit, s.spent, month],
      });
    } catch {
      // Unique constraint: snapshot already exists for this month, skip
    }
  }
}

export async function getBudgetHistory(
  db: Client,
  accountId: number,
  category?: string,
  limit = 12
): Promise<BudgetHistoryEntry[]> {
  const result = category
    ? await db.execute({
        sql: "SELECT * FROM budget_history WHERE account_id = ? AND category = ? ORDER BY month DESC LIMIT ?",
        args: [accountId, category, limit],
      })
    : await db.execute({
        sql: "SELECT * FROM budget_history WHERE account_id = ? ORDER BY month DESC LIMIT ?",
        args: [accountId, limit],
      });
  return result.rows.map((row) => ({
    id: Number(row.id),
    account_id: Number(row.account_id),
    category: String(row.category),
    period: String(row.period),
    limit_amount: Number(row.limit_amount),
    spent_amount: Number(row.spent_amount),
    month: String(row.month),
    created_at: String(row.created_at),
  }));
}

export async function upsertBudget(
  db: Client,
  accountId: number,
  category: string,
  amountLimit: number,
  period: "monthly" | "yearly"
): Promise<void> {
  await snapshotBudgetHistory(db, accountId);

  await db.execute({
    sql: `INSERT INTO budgets (account_id, category, amount_limit, period)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(account_id, category) DO UPDATE SET amount_limit = excluded.amount_limit, period = excluded.period`,
    args: [accountId, category, amountLimit, period],
  });
}

export async function deleteBudget(db: Client, id: number): Promise<void> {
  await db.execute({ sql: "DELETE FROM budgets WHERE id = ?", args: [id] });
}

export async function getAllBudgets(db: Client): Promise<Budget[]> {
  const result = await db.execute("SELECT * FROM budgets ORDER BY account_id, category");
  return result.rows.map((row) => ({
    id: Number(row.id),
    account_id: Number(row.account_id),
    category: String(row.category),
    amount_limit: Number(row.amount_limit),
    period: String(row.period) as "monthly" | "yearly",
    created_at: String(row.created_at),
    last_budget_alert_at: row.last_budget_alert_at != null ? String(row.last_budget_alert_at) : null,
    last_budget_alert_type: row.last_budget_alert_type != null
      ? String(row.last_budget_alert_type) as "warning" | "exceeded"
      : null,
  }));
}
