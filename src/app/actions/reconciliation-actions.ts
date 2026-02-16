"use server";

import { getDb, ensureSchema } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateStatementAction(
  accountId: number,
  statementBalance: number,
  statementDate: string
) {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: "UPDATE accounts SET statement_balance = ?, statement_date = ? WHERE id = ?",
    args: [statementBalance, statementDate, accountId],
  });
  revalidatePath("/comptes");
  return { success: true };
}

export async function toggleReconciledAction(transactionId: number, reconciled: boolean) {
  await ensureSchema();
  const db = getDb();
  await db.execute({
    sql: "UPDATE transactions SET reconciled = ? WHERE id = ?",
    args: [reconciled ? 1 : 0, transactionId],
  });
  revalidatePath("/comptes");
  revalidatePath("/transactions");
  return { success: true };
}

export async function getUnreconciledTransactions(accountId: number) {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT t.*, a.name as account_name FROM transactions t LEFT JOIN accounts a ON t.account_id = a.id WHERE t.account_id = ? AND (t.reconciled IS NULL OR t.reconciled = 0) ORDER BY t.date DESC LIMIT 50",
    args: [accountId],
  });
  return result.rows.map((row) => ({
    id: Number(row.id),
    date: String(row.date),
    description: String(row.description),
    amount: Number(row.amount),
    type: String(row.type) as "income" | "expense",
  }));
}
