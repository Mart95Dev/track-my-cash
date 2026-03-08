import type { Client } from "@libsql/client";
import type { Goal } from "./types";
import { rowToGoal } from "./mappers";

export async function getGoals(db: Client, accountId?: number): Promise<Goal[]> {
  if (accountId) {
    const result = await db.execute({
      sql: "SELECT * FROM goals WHERE account_id = ? ORDER BY created_at DESC",
      args: [accountId],
    });
    return result.rows.map(rowToGoal);
  }
  const result = await db.execute({
    sql: "SELECT * FROM goals ORDER BY created_at DESC",
    args: [],
  });
  return result.rows.map(rowToGoal);
}

export async function createGoal(
  db: Client,
  name: string,
  targetAmount: number,
  currentAmount: number,
  currency: string,
  deadline?: string,
  accountId?: number,
  monthlyContribution?: number
): Promise<Goal> {
  const result = await db.execute({
    sql: "INSERT INTO goals (name, target_amount, current_amount, currency, deadline, account_id, monthly_contribution) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [name, targetAmount, currentAmount, currency, deadline ?? null, accountId ?? null, monthlyContribution ?? 0],
  });
  const row = await db.execute({
    sql: "SELECT * FROM goals WHERE id = ?",
    args: [Number(result.lastInsertRowid)],
  });
  return rowToGoal(row.rows[0]);
}

export async function updateGoal(
  db: Client,
  id: number,
  data: { name?: string; target_amount?: number; current_amount?: number; currency?: string; deadline?: string | null; account_id?: number | null; monthly_contribution?: number }
): Promise<void> {
  const sets: string[] = [];
  const args: (string | number | null)[] = [];
  if (data.name !== undefined) { sets.push("name = ?"); args.push(data.name); }
  if (data.target_amount !== undefined) { sets.push("target_amount = ?"); args.push(data.target_amount); }
  if (data.current_amount !== undefined) { sets.push("current_amount = ?"); args.push(data.current_amount); }
  if (data.currency !== undefined) { sets.push("currency = ?"); args.push(data.currency); }
  if (data.deadline !== undefined) { sets.push("deadline = ?"); args.push(data.deadline); }
  if (data.account_id !== undefined) { sets.push("account_id = ?"); args.push(data.account_id); }
  if (data.monthly_contribution !== undefined) { sets.push("monthly_contribution = ?"); args.push(data.monthly_contribution); }
  if (sets.length === 0) return;
  args.push(id);
  await db.execute({ sql: `UPDATE goals SET ${sets.join(", ")} WHERE id = ?`, args });
}

export async function deleteGoal(db: Client, id: number): Promise<void> {
  await db.execute({ sql: "DELETE FROM goals WHERE id = ?", args: [id] });
}
