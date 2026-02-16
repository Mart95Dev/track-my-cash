import { getDb, ensureSchema } from "./db";
import crypto from "crypto";
import type { Row } from "@libsql/client";

// ============ TYPES ============

export interface Account {
  id: number;
  name: string;
  initial_balance: number;
  balance_date: string;
  currency: string;
  created_at: string;
  calculated_balance?: number;
}

export interface Transaction {
  id: number;
  account_id: number;
  type: "income" | "expense";
  amount: number;
  date: string;
  category: string;
  description: string;
  import_hash: string | null;
  created_at: string;
  account_name?: string;
}

export interface RecurringPayment {
  id: number;
  account_id: number;
  name: string;
  type: "income" | "expense";
  amount: number;
  frequency: string;
  next_date: string;
  category: string;
  created_at: string;
  account_name?: string;
}

function rowToAccount(row: Row): Account {
  return {
    id: Number(row.id),
    name: String(row.name),
    initial_balance: Number(row.initial_balance),
    balance_date: String(row.balance_date),
    currency: String(row.currency),
    created_at: String(row.created_at),
  };
}

function rowToTransaction(row: Row): Transaction {
  return {
    id: Number(row.id),
    account_id: Number(row.account_id),
    type: String(row.type) as "income" | "expense",
    amount: Number(row.amount),
    date: String(row.date),
    category: String(row.category),
    description: String(row.description),
    import_hash: row.import_hash ? String(row.import_hash) : null,
    created_at: String(row.created_at),
    account_name: row.account_name ? String(row.account_name) : undefined,
  };
}

function rowToRecurring(row: Row): RecurringPayment {
  return {
    id: Number(row.id),
    account_id: Number(row.account_id),
    name: String(row.name),
    type: String(row.type) as "income" | "expense",
    amount: Number(row.amount),
    frequency: String(row.frequency),
    next_date: String(row.next_date),
    category: String(row.category),
    created_at: String(row.created_at),
    account_name: row.account_name ? String(row.account_name) : undefined,
  };
}

// ============ ACCOUNTS ============

export async function getAllAccounts(): Promise<Account[]> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute("SELECT * FROM accounts ORDER BY created_at DESC");
  const accounts = result.rows.map(rowToAccount);

  for (const account of accounts) {
    account.calculated_balance = await getCalculatedBalance(account.id);
  }
  return accounts;
}

export async function getAccountById(id: number): Promise<Account | undefined> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({ sql: "SELECT * FROM accounts WHERE id = ?", args: [id] });
  if (result.rows.length === 0) return undefined;
  const account = rowToAccount(result.rows[0]);
  account.calculated_balance = await getCalculatedBalance(account.id);
  return account;
}

export async function createAccount(
  name: string,
  initialBalance: number,
  balanceDate: string,
  currency: string
): Promise<Account> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: "INSERT INTO accounts (name, initial_balance, balance_date, currency) VALUES (?, ?, ?, ?)",
    args: [name, initialBalance, balanceDate, currency],
  });
  return (await getAccountById(Number(result.lastInsertRowid)))!;
}

export async function deleteAccount(id: number): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.batch([
    { sql: "DELETE FROM transactions WHERE account_id = ?", args: [id] },
    { sql: "DELETE FROM recurring_payments WHERE account_id = ?", args: [id] },
    { sql: "DELETE FROM accounts WHERE id = ?", args: [id] },
  ], "write");
}

export async function getCalculatedBalance(accountId: number): Promise<number> {
  const db = getDb();
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

// ============ TRANSACTIONS ============

export async function getTransactions(
  accountId?: number,
  limit?: number,
  offset?: number
): Promise<Transaction[]> {
  await ensureSchema();
  const db = getDb();
  let query =
    "SELECT t.*, a.name as account_name FROM transactions t LEFT JOIN accounts a ON t.account_id = a.id";
  const args: (number | string)[] = [];

  if (accountId) {
    query += " WHERE t.account_id = ?";
    args.push(accountId);
  }

  query += " ORDER BY t.date DESC, t.id DESC";

  if (limit) {
    query += " LIMIT ?";
    args.push(limit);
    if (offset) {
      query += " OFFSET ?";
      args.push(offset);
    }
  }

  const result = await db.execute({ sql: query, args });
  return result.rows.map(rowToTransaction);
}

export async function createTransaction(
  accountId: number,
  type: "income" | "expense",
  amount: number,
  date: string,
  category: string,
  description: string
): Promise<Transaction> {
  await ensureSchema();
  const db = getDb();
  const hash = generateImportHash(date, description, amount);
  const result = await db.execute({
    sql: "INSERT INTO transactions (account_id, type, amount, date, category, description, import_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [accountId, type, amount, date, category, description, hash],
  });

  const txResult = await db.execute({
    sql: "SELECT t.*, a.name as account_name FROM transactions t LEFT JOIN accounts a ON t.account_id = a.id WHERE t.id = ?",
    args: [Number(result.lastInsertRowid)],
  });
  return rowToTransaction(txResult.rows[0]);
}

export async function deleteTransaction(id: number): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({ sql: "DELETE FROM transactions WHERE id = ?", args: [id] });
}

export function generateImportHash(
  date: string,
  description: string,
  amount: number
): string {
  const raw = `${date}|${description.trim().toLowerCase()}|${amount.toFixed(2)}`;
  return crypto.createHash("md5").update(raw).digest("hex");
}

export async function checkDuplicates(hashes: string[]): Promise<Set<string>> {
  await ensureSchema();
  const db = getDb();
  const existing = new Set<string>();
  for (const hash of hashes) {
    const result = await db.execute({
      sql: "SELECT import_hash FROM transactions WHERE import_hash = ?",
      args: [hash],
    });
    if (result.rows.length > 0) existing.add(hash);
  }
  return existing;
}

export async function bulkInsertTransactions(
  transactions: {
    account_id: number;
    type: "income" | "expense";
    amount: number;
    date: string;
    category: string;
    description: string;
    import_hash: string;
  }[]
): Promise<number> {
  await ensureSchema();
  const db = getDb();
  const stmts = transactions.map((tx) => ({
    sql: "INSERT INTO transactions (account_id, type, amount, date, category, description, import_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [tx.account_id, tx.type, tx.amount, tx.date, tx.category, tx.description, tx.import_hash] as (string | number)[],
  }));

  await db.batch(stmts, "write");
  return transactions.length;
}

// ============ RECURRING ============

export async function getRecurringPayments(accountId?: number): Promise<RecurringPayment[]> {
  await ensureSchema();
  const db = getDb();
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
  accountId: number,
  name: string,
  type: "income" | "expense",
  amount: number,
  frequency: string,
  nextDate: string,
  category: string
): Promise<RecurringPayment> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: "INSERT INTO recurring_payments (account_id, name, type, amount, frequency, next_date, category) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [accountId, name, type, amount, frequency, nextDate, category],
  });

  const recResult = await db.execute({
    sql: "SELECT r.*, a.name as account_name FROM recurring_payments r LEFT JOIN accounts a ON r.account_id = a.id WHERE r.id = ?",
    args: [Number(result.lastInsertRowid)],
  });
  return rowToRecurring(recResult.rows[0]);
}

export async function deleteRecurringPayment(id: number): Promise<void> {
  await ensureSchema();
  const db = getDb();
  await db.execute({ sql: "DELETE FROM recurring_payments WHERE id = ?", args: [id] });
}

// ============ DASHBOARD ============

export async function getDashboardData() {
  await ensureSchema();
  const db = getDb();
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthEnd = nextMonth.toISOString().split("T")[0];

  const monthlyIncome = await db.execute({
    sql: "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND date >= ? AND date < ?",
    args: [monthStart, monthEnd],
  });

  const monthlyExpenses = await db.execute({
    sql: "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date >= ? AND date < ?",
    args: [monthStart, monthEnd],
  });

  const recurringTotal = await db.execute(
    `SELECT COALESCE(SUM(
      CASE frequency
        WHEN 'monthly' THEN amount
        WHEN 'weekly' THEN amount * 4.33
        WHEN 'yearly' THEN amount / 12.0
        ELSE amount
      END
    ), 0) as total FROM recurring_payments WHERE type = 'expense'`
  );

  const accounts = await getAllAccounts();

  return {
    monthlyIncome: Number(monthlyIncome.rows[0].total),
    monthlyExpenses: Number(monthlyExpenses.rows[0].total),
    recurringMonthly: Number(recurringTotal.rows[0].total),
    accounts,
  };
}

// ============ FORECAST ============

export async function getForecast(months: number) {
  const accounts = await getAllAccounts();
  const recurringPayments = await getRecurringPayments();
  const now = new Date();
  const forecasts = [];

  for (let i = 0; i < months; i++) {
    const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthName = forecastDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });

    const accountForecasts = accounts.map((account) => {
      let balance = account.calculated_balance ?? account.initial_balance;

      recurringPayments
        .filter((r) => r.account_id === account.id)
        .forEach((r) => {
          const nextDate = new Date(r.next_date);
          const monthsBetween =
            (forecastDate.getFullYear() - nextDate.getFullYear()) * 12 +
            (forecastDate.getMonth() - nextDate.getMonth());

          if (monthsBetween >= 0) {
            let timesToApply = 0;
            if (r.frequency === "monthly") timesToApply = monthsBetween + 1;
            else if (r.frequency === "weekly")
              timesToApply = (monthsBetween + 1) * 4;
            else if (r.frequency === "yearly")
              timesToApply = Math.floor((monthsBetween + 1) / 12);

            const sign = r.type === "income" ? 1 : -1;
            balance += sign * r.amount * timesToApply;
          }
        });

      return {
        accountName: account.name,
        currency: account.currency,
        balance,
      };
    });

    forecasts.push({ month: monthName, accounts: accountForecasts });
  }

  return forecasts;
}

// ============ EXPORT / IMPORT ============

export async function exportAllData() {
  await ensureSchema();
  const db = getDb();
  const [accounts, transactions, recurring] = await Promise.all([
    db.execute("SELECT * FROM accounts"),
    db.execute("SELECT * FROM transactions"),
    db.execute("SELECT * FROM recurring_payments"),
  ]);

  return {
    version: "2.0",
    exportDate: new Date().toISOString(),
    accounts: accounts.rows,
    transactions: transactions.rows,
    recurring: recurring.rows,
  };
}

export async function importAllData(data: {
  accounts: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
  recurring: Record<string, unknown>[];
}) {
  await ensureSchema();
  const db = getDb();

  // Clear all tables
  await db.batch([
    "DELETE FROM transactions",
    "DELETE FROM recurring_payments",
    "DELETE FROM accounts",
  ], "write");

  // Insert accounts
  const accountStmts = data.accounts.map((a) => ({
    sql: "INSERT INTO accounts (id, name, initial_balance, balance_date, currency, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [
      Number(a.id),
      String(a.name),
      Number(a.initial_balance ?? a.balance ?? 0),
      String(a.balance_date ?? a.date ?? new Date().toISOString().split("T")[0]),
      String(a.currency ?? "EUR"),
      String(a.created_at ?? new Date().toISOString()),
    ] as (string | number)[],
  }));

  if (accountStmts.length > 0) {
    await db.batch(accountStmts, "write");
  }

  // Insert transactions
  const txStmts = data.transactions.map((t) => ({
    sql: "INSERT INTO transactions (id, account_id, type, amount, date, category, description, import_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [
      Number(t.id),
      Number(t.account_id ?? t.accountId),
      String(t.type),
      Number(t.amount),
      String(t.date),
      String(t.category ?? "Autre"),
      String(t.description ?? ""),
      t.import_hash ? String(t.import_hash) : null,
      String(t.created_at ?? new Date().toISOString()),
    ] as (string | number | null)[],
  }));

  if (txStmts.length > 0) {
    await db.batch(txStmts, "write");
  }

  // Insert recurring
  const recStmts = data.recurring.map((r) => ({
    sql: "INSERT INTO recurring_payments (id, account_id, name, type, amount, frequency, next_date, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [
      Number(r.id),
      Number(r.account_id ?? r.accountId),
      String(r.name),
      String(r.type ?? "expense"),
      Number(r.amount),
      String(r.frequency ?? "monthly"),
      String(r.next_date ?? r.nextDate ?? r.date),
      String(r.category ?? "Autre"),
      String(r.created_at ?? new Date().toISOString()),
    ] as (string | number)[],
  }));

  if (recStmts.length > 0) {
    await db.batch(recStmts, "write");
  }
}
