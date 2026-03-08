import type { Client } from "@libsql/client";
import type { RecurringPayment } from "./types";
import { rowToRecurring } from "./mappers";

export async function getRecurringPayments(db: Client, accountId?: number): Promise<RecurringPayment[]> {
  let query =
    "SELECT r.*, a.name as account_name FROM recurring_payments r LEFT JOIN accounts a ON r.account_id = a.id";
  const args: number[] = [];

  if (accountId) {
    query += " WHERE r.account_id = ?";
    args.push(accountId);
  }

  query += " ORDER BY r.next_date ASC";
  const result = await db.execute({ sql: query, args });
  return result.rows.map(rowToRecurring);
}

export async function createRecurringPayment(
  db: Client,
  accountId: number,
  name: string,
  type: "income" | "expense",
  amount: number,
  frequency: string,
  nextDate: string,
  category: string,
  endDate: string | null = null,
  subcategory: string | null = null
): Promise<RecurringPayment> {
  const result = await db.execute({
    sql: "INSERT INTO recurring_payments (account_id, name, type, amount, frequency, next_date, category, end_date, subcategory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [accountId, name, type, amount, frequency, nextDate, category, endDate, subcategory],
  });

  const recResult = await db.execute({
    sql: "SELECT r.*, a.name as account_name FROM recurring_payments r LEFT JOIN accounts a ON r.account_id = a.id WHERE r.id = ?",
    args: [Number(result.lastInsertRowid)],
  });
  return rowToRecurring(recResult.rows[0]);
}

export async function deleteRecurringPayment(db: Client, id: number): Promise<void> {
  await db.execute({ sql: "DELETE FROM recurring_payments WHERE id = ?", args: [id] });
}

export async function updateRecurringPayment(
  db: Client,
  id: number,
  accountId: number,
  name: string,
  type: "income" | "expense",
  amount: number,
  frequency: string,
  nextDate: string,
  category: string,
  endDate: string | null = null,
  subcategory: string | null = null
): Promise<void> {
  await db.execute({
    sql: "UPDATE recurring_payments SET account_id = ?, name = ?, type = ?, amount = ?, frequency = ?, next_date = ?, category = ?, end_date = ?, subcategory = ? WHERE id = ?",
    args: [accountId, name, type, amount, frequency, nextDate, category, endDate, subcategory, id],
  });
}
