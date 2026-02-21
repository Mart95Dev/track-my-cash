import type { Client, Row } from "@libsql/client";
import crypto from "crypto";

// ============ TYPES ============

export interface Account {
  id: number;
  name: string;
  initial_balance: number;
  balance_date: string;
  currency: string;
  created_at: string;
  calculated_balance?: number;
  alert_threshold?: number | null;
  last_alert_sent_at?: string | null;
}

export interface Transaction {
  id: number;
  account_id: number;
  type: "income" | "expense";
  amount: number;
  date: string;
  category: string;       // catégorie large (ex: "Abonnement", "Transport")
  subcategory: string | null; // pattern/sous-catégorie (ex: "netflix", "sncf")
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
  end_date: string | null;
  category: string;
  subcategory: string | null;
  created_at: string;
  account_name?: string;
}

export interface ForecastItem {
  name: string;
  amount: number;
  category: string;
  frequency: string;
  accountName: string;
  startsFrom: string;
  endsAt: string | null;
}

export interface AccountForecastBreakdown {
  accountId: number;
  accountName: string;
  currency: string;
  startBalance: number;
  income: number;
  expenses: number;
  endBalance: number;
}

export interface MonthDetail {
  month: string;
  monthKey: string;
  startBalance: number;
  income: number;
  expenses: number;
  netCashflow: number;
  endBalance: number;
  incomeItems: ForecastItem[];
  expenseItems: ForecastItem[];
  accountBreakdown: AccountForecastBreakdown[];
}

export interface DetailedForecastResult {
  monthDetails: MonthDetail[];
  currentBalance: number;
  projectedBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface Budget {
  id: number;
  account_id: number;
  category: string;
  amount_limit: number;
  period: "monthly" | "yearly";
  created_at: string;
  last_budget_alert_at?: string | null;
  last_budget_alert_type?: "warning" | "exceeded" | null;
}

export interface BudgetStatus {
  category: string;
  spent: number;
  limit: number;
  percentage: number;
  period: "monthly" | "yearly";
}

function rowToAccount(row: Row): Account {
  return {
    id: Number(row.id),
    name: String(row.name),
    initial_balance: Number(row.initial_balance),
    balance_date: String(row.balance_date),
    currency: String(row.currency),
    created_at: String(row.created_at),
    alert_threshold: row.alert_threshold != null ? Number(row.alert_threshold) : null,
    last_alert_sent_at: row.last_alert_sent_at != null ? String(row.last_alert_sent_at) : null,
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
    subcategory: row.subcategory ? String(row.subcategory) : null,
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
    end_date: row.end_date ? String(row.end_date) : null,
    category: String(row.category),
    subcategory: row.subcategory ? String(row.subcategory) : null,
    created_at: String(row.created_at),
    account_name: row.account_name ? String(row.account_name) : undefined,
  };
}

// ============ ACCOUNTS ============

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

// ============ TRANSACTIONS ============

export async function getTransactions(
  db: Client,
  accountId?: number,
  limit?: number,
  offset?: number
): Promise<Transaction[]> {
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

export async function searchTransactions(
  db: Client,
  opts: {
    accountId?: number;
    search?: string;
    sort?: string;
    page?: number;
    perPage?: number;
    tagId?: number;
  }
): Promise<{ transactions: Transaction[]; total: number }> {
  const perPage = opts.perPage ?? 20;
  const page = opts.page ?? 1;
  const conditions: string[] = [];
  const args: (number | string)[] = [];

  if (opts.accountId) {
    conditions.push("t.account_id = ?");
    args.push(opts.accountId);
  }

  if (opts.search) {
    conditions.push("(t.description LIKE ? OR t.category LIKE ?)");
    const q = `%${opts.search}%`;
    args.push(q, q);
  }

  if (opts.tagId) {
    conditions.push("EXISTS (SELECT 1 FROM transaction_tags tt WHERE tt.transaction_id = t.id AND tt.tag_id = ?)");
    args.push(opts.tagId);
  }

  const where = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

  let orderBy = "t.date DESC, t.id DESC";
  if (opts.sort === "date_asc") orderBy = "t.date ASC, t.id ASC";
  else if (opts.sort === "amount_desc") orderBy = "t.amount DESC";
  else if (opts.sort === "amount_asc") orderBy = "t.amount ASC";

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as cnt FROM transactions t${where}`,
    args,
  });
  const total = Number(countResult.rows[0].cnt);

  const offset = (page - 1) * perPage;
  const result = await db.execute({
    sql: `SELECT t.*, a.name as account_name FROM transactions t LEFT JOIN accounts a ON t.account_id = a.id${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    args: [...args, perPage, offset],
  });

  return { transactions: result.rows.map(rowToTransaction), total };
}

// ============ CHART DATA ============

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

  return result.rows.map((row) => ({
    month: String(row.month),
    income: Number(row.income),
    expenses: Number(row.expenses),
    net: Number(row.income) - Number(row.expenses),
  }));
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

  // Grouper par sous-catégorie (pattern), avec fallback sur category si subcategory vide
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

  // Après migration, category contient directement la catégorie large
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

export interface SpendingTrendEntry {
  month: string;
  category: string;
  amount: number;
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

export async function createTransaction(
  db: Client,
  accountId: number,
  type: "income" | "expense",
  amount: number,
  date: string,
  category: string,
  subcategory: string,
  description: string
): Promise<Transaction> {
  const hash = generateImportHash(date, description, amount);
  const result = await db.execute({
    sql: "INSERT INTO transactions (account_id, type, amount, date, category, subcategory, description, import_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [accountId, type, amount, date, category, subcategory, description, hash],
  });

  const txResult = await db.execute({
    sql: "SELECT t.*, a.name as account_name FROM transactions t LEFT JOIN accounts a ON t.account_id = a.id WHERE t.id = ?",
    args: [Number(result.lastInsertRowid)],
  });
  return rowToTransaction(txResult.rows[0]);
}

export async function deleteTransaction(db: Client, id: number): Promise<void> {
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

export async function checkDuplicates(db: Client, hashes: string[]): Promise<Set<string>> {
  if (hashes.length === 0) return new Set<string>();
  const placeholders = hashes.map(() => "?").join(", ");
  const result = await db.execute({
    sql: `SELECT import_hash FROM transactions WHERE import_hash IN (${placeholders})`,
    args: hashes,
  });
  return new Set(result.rows.map((r) => String(r.import_hash)));
}

export async function bulkInsertTransactions(
  db: Client,
  transactions: {
    account_id: number;
    type: "income" | "expense";
    amount: number;
    date: string;
    category: string;
    subcategory: string;
    description: string;
    import_hash: string;
  }[]
): Promise<number> {
  const stmts = transactions.map((tx) => ({
    sql: "INSERT INTO transactions (account_id, type, amount, date, category, subcategory, description, import_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [tx.account_id, tx.type, tx.amount, tx.date, tx.category, tx.subcategory, tx.description, tx.import_hash] as (string | number)[],
  }));

  await db.batch(stmts, "write");
  return transactions.length;
}

// ============ RECURRING ============

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

// ============ DASHBOARD ============

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

// ============ FORECAST ============

function getMonthlyContribution(r: RecurringPayment, forecastDate: Date): number {
  const nextDate = new Date(r.next_date);
  const monthsDiff =
    (forecastDate.getFullYear() - nextDate.getFullYear()) * 12 +
    (forecastDate.getMonth() - nextDate.getMonth());

  if (monthsDiff < 0) return 0; // pas encore démarré

  if (r.end_date) {
    const endDate = new Date(r.end_date);
    const afterEnd =
      (forecastDate.getFullYear() - endDate.getFullYear()) * 12 +
      (forecastDate.getMonth() - endDate.getMonth());
    if (afterEnd > 0) return 0; // terminé
  }

  switch (r.frequency) {
    case "monthly":
      return r.amount;
    case "weekly":
      return r.amount * 4;
    case "yearly":
      return forecastDate.getMonth() === nextDate.getMonth() ? r.amount : 0;
    default:
      return r.amount;
  }
}

export async function getDetailedForecast(db: Client, months: number, accountId?: number): Promise<DetailedForecastResult> {
  const allAccounts = await getAllAccounts(db);
  const accounts = accountId ? allAccounts.filter((a) => a.id === accountId) : allAccounts;
  const allRecurring = await getRecurringPayments(db);
  const recurringPayments = accountId ? allRecurring.filter((r) => r.account_id === accountId) : allRecurring;
  const now = new Date();

  const currentBalance = accounts.reduce(
    (sum, a) => sum + (a.calculated_balance ?? a.initial_balance),
    0
  );

  let runningBalance = currentBalance;
  const accountRunning: Record<number, number> = {};
  for (const a of accounts) {
    accountRunning[a.id] = a.calculated_balance ?? a.initial_balance;
  }

  const monthDetails: MonthDetail[] = [];
  let totalIncome = 0;
  let totalExpenses = 0;

  for (let i = 0; i < months; i++) {
    const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, "0")}`;
    const monthName = forecastDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });

    const startBalance = runningBalance;
    const incomeItems: ForecastItem[] = [];
    const expenseItems: ForecastItem[] = [];

    for (const r of recurringPayments) {
      const amount = getMonthlyContribution(r, forecastDate);
      if (amount === 0) continue;
      const account = accounts.find((a) => a.id === r.account_id);
      const item: ForecastItem = {
        name: r.name,
        amount,
        category: r.category,
        frequency: r.frequency,
        accountName: account?.name ?? "",
        startsFrom: r.next_date,
        endsAt: r.end_date,
      };
      if (r.type === "income") {
        incomeItems.push(item);
      } else {
        expenseItems.push(item);
      }
    }

    const income = incomeItems.reduce((s, item) => s + item.amount, 0);
    const expenses = expenseItems.reduce((s, item) => s + item.amount, 0);
    const netCashflow = income - expenses;
    const endBalance = startBalance + netCashflow;

    // Détail par compte
    const accountBreakdown: AccountForecastBreakdown[] = accounts.map((a) => {
      const accStart = accountRunning[a.id];
      const accRecurring = recurringPayments.filter((r) => r.account_id === a.id);
      const accIncome = accRecurring
        .filter((r) => r.type === "income")
        .reduce((s, r) => s + getMonthlyContribution(r, forecastDate), 0);
      const accExpenses = accRecurring
        .filter((r) => r.type === "expense")
        .reduce((s, r) => s + getMonthlyContribution(r, forecastDate), 0);
      const accEnd = accStart + accIncome - accExpenses;
      accountRunning[a.id] = accEnd;
      return {
        accountId: a.id,
        accountName: a.name,
        currency: a.currency,
        startBalance: accStart,
        income: accIncome,
        expenses: accExpenses,
        endBalance: accEnd,
      };
    });

    totalIncome += income;
    totalExpenses += expenses;
    runningBalance = endBalance;

    monthDetails.push({
      month: monthName,
      monthKey,
      startBalance,
      income,
      expenses,
      netCashflow,
      endBalance,
      incomeItems,
      expenseItems,
      accountBreakdown,
    });
  }

  return {
    monthDetails,
    currentBalance,
    projectedBalance: runningBalance,
    totalIncome,
    totalExpenses,
  };
}

// ============ EXPORT / IMPORT ============

export async function exportAllData(db: Client) {
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

export async function importAllData(
  db: Client,
  data: {
    accounts: Record<string, unknown>[];
    transactions: Record<string, unknown>[];
    recurring: Record<string, unknown>[];
  }
) {
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
    sql: "INSERT INTO transactions (id, account_id, type, amount, date, category, subcategory, description, import_hash, reconciled, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [
      Number(t.id),
      Number(t.account_id ?? t.accountId),
      String(t.type),
      Number(t.amount),
      String(t.date),
      String(t.category ?? "Autre"),
      t.subcategory ? String(t.subcategory) : null,
      String(t.description ?? ""),
      t.import_hash ? String(t.import_hash) : null,
      t.reconciled ? Number(t.reconciled) : 0,
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

// ============ UPDATE (EDIT) ============

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

export async function updateTransaction(
  db: Client,
  id: number,
  accountId: number,
  type: "income" | "expense",
  amount: number,
  date: string,
  category: string,
  subcategory: string,
  description: string
): Promise<void> {
  await db.execute({
    sql: "UPDATE transactions SET account_id = ?, type = ?, amount = ?, date = ?, category = ?, subcategory = ?, description = ? WHERE id = ?",
    args: [accountId, type, amount, date, category, subcategory, description, id],
  });
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

// ============ CATEGORIZATION RULES ============

export interface CategorizationRule {
  id: number;
  pattern: string;
  category: string;
  priority: number;
}

export async function getCategorizationRules(db: Client): Promise<CategorizationRule[]> {
  const result = await db.execute("SELECT * FROM categorization_rules ORDER BY priority DESC");
  return result.rows.map((row) => ({
    id: Number(row.id),
    pattern: String(row.pattern),
    category: String(row.category),
    priority: Number(row.priority),
  }));
}

export async function createCategorizationRule(
  db: Client,
  pattern: string,
  category: string,
  priority: number
): Promise<void> {
  await db.execute({
    sql: "INSERT INTO categorization_rules (pattern, category, priority) VALUES (?, ?, ?)",
    args: [pattern, category, priority],
  });
}

export async function deleteCategorizationRule(db: Client, id: number): Promise<void> {
  await db.execute({ sql: "DELETE FROM categorization_rules WHERE id = ?", args: [id] });
}

export async function autoCategorize(db: Client, description: string): Promise<string> {
  const rules = await getCategorizationRules(db);
  for (const rule of rules) {
    try {
      const regex = new RegExp(rule.pattern, "i");
      if (regex.test(description)) {
        return rule.category;
      }
    } catch {
      if (description.toLowerCase().includes(rule.pattern.toLowerCase())) {
        return rule.category;
      }
    }
  }
  return "Autre";
}

// ============ SETTINGS ============

export async function getSetting(db: Client, key: string): Promise<string | null> {
  const result = await db.execute({ sql: "SELECT value FROM settings WHERE key = ?", args: [key] });
  return result.rows.length > 0 ? String(result.rows[0].value) : null;
}

export async function setSetting(db: Client, key: string, value: string): Promise<void> {
  await db.execute({
    sql: "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    args: [key, value],
  });
}

// ============ BUDGETS ============

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
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  const result = await db.execute({
    sql: `
      SELECT b.category, b.amount_limit, b.period,
             COALESCE(SUM(t.amount), 0) as spent
      FROM budgets b
      LEFT JOIN transactions t ON t.account_id = b.account_id
        AND t.category = b.category
        AND t.type = 'expense'
        AND t.date >= ? AND t.date <= ?
      WHERE b.account_id = ?
      GROUP BY b.id
    `,
    args: [firstDay, lastDay, accountId],
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

export async function upsertBudget(
  db: Client,
  accountId: number,
  category: string,
  amountLimit: number,
  period: "monthly" | "yearly"
): Promise<void> {
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
