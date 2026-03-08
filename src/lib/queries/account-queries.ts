import type { Client } from "@libsql/client";
import type { Account } from "./types";
import { rowToAccount } from "./mappers";

export async function getAllAccounts(db: Client): Promise<Account[]> {
  const result = await db.execute("SELECT * FROM accounts ORDER BY created_at DESC");
  const accounts = result.rows.map(rowToAccount);

  for (const account of accounts) {
    account.calculated_balance = await getCalculatedBalance(db, account.id);
  }
  return accounts;
}

export async function getAccountById(db: Client, id: number): Promise<Account | undefined> {
  const result = await db.execute({ sql: "SELECT * FROM accounts WHERE id = ?", args: [id] });
  if (result.rows.length === 0) return undefined;
  const account = rowToAccount(result.rows[0]);
  account.calculated_balance = await getCalculatedBalance(db, account.id);
  return account;
}

export async function createAccount(
  db: Client,
  name: string,
  initialBalance: number,
  balanceDate: string,
  currency: string
): Promise<Account> {
  const result = await db.execute({
    sql: "INSERT INTO accounts (name, initial_balance, balance_date, currency) VALUES (?, ?, ?, ?)",
    args: [name, initialBalance, balanceDate, currency],
  });
  return (await getAccountById(db, Number(result.lastInsertRowid)))!;
}

export async function deleteAccount(db: Client, id: number): Promise<void> {
  await db.batch([
    { sql: "DELETE FROM transactions WHERE account_id = ?", args: [id] },
    { sql: "DELETE FROM recurring_payments WHERE account_id = ?", args: [id] },
    { sql: "DELETE FROM accounts WHERE id = ?", args: [id] },
  ], "write");
}

export async function getCalculatedBalance(db: Client, accountId: number): Promise<number> {
  const accResult = await db.execute({
    sql: "SELECT initial_balance, balance_date FROM accounts WHERE id = ?",
    args: [accountId],
  });
  if (accResult.rows.length === 0) return 0;
  const account = accResult.rows[0];

  const result = await db.execute({
    sql: `SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as net
      FROM transactions WHERE account_id = ? AND date >= ?`,
    args: [accountId, account.balance_date],
  });

  return Number(account.initial_balance) + Number(result.rows[0].net);
}

export async function updateAccountBalance(
  db: Client,
  accountId: number,
  newBalance: number,
  newBalanceDate: string
): Promise<void> {
  await db.execute({
    sql: "UPDATE accounts SET initial_balance = ?, balance_date = ? WHERE id = ?",
    args: [newBalance, newBalanceDate, accountId],
  });
}

export async function updateAccount(
  db: Client,
  id: number,
  name: string,
  initialBalance: number,
  balanceDate: string,
  currency: string,
  alertThreshold: number | null
): Promise<void> {
  await db.execute({
    sql: "UPDATE accounts SET name = ?, initial_balance = ?, balance_date = ?, currency = ?, alert_threshold = ? WHERE id = ?",
    args: [name, initialBalance, balanceDate, currency, alertThreshold, id],
  });
}
