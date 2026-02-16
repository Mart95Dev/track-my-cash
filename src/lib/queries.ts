import { getDb } from "./db";
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

// ============ ACCOUNTS ============

export function getAllAccounts(): Account[] {
  const db = getDb();
  const accounts = db
    .prepare("SELECT * FROM accounts ORDER BY created_at DESC")
    .all() as Account[];

  for (const account of accounts) {
    account.calculated_balance = getCalculatedBalance(account.id);
  }
  return accounts;
}

export function getAccountById(id: number): Account | undefined {
  const db = getDb();
  const account = db
    .prepare("SELECT * FROM accounts WHERE id = ?")
    .get(id) as Account | undefined;
  if (account) {
    account.calculated_balance = getCalculatedBalance(account.id);
  }
  return account;
}

export function createAccount(
  name: string,
  initialBalance: number,
  balanceDate: string,
  currency: string
): Account {
  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO accounts (name, initial_balance, balance_date, currency) VALUES (?, ?, ?, ?)"
    )
    .run(name, initialBalance, balanceDate, currency);
  return getAccountById(result.lastInsertRowid as number)!;
}

export function deleteAccount(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM accounts WHERE id = ?").run(id);
}

export function getCalculatedBalance(accountId: number): number {
  const db = getDb();
  const account = db
    .prepare("SELECT initial_balance, balance_date FROM accounts WHERE id = ?")
    .get(accountId) as { initial_balance: number; balance_date: string } | undefined;

  if (!account) return 0;

  const result = db
    .prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as net
      FROM transactions
      WHERE account_id = ? AND date >= ?`
    )
    .get(accountId, account.balance_date) as { net: number };

  return account.initial_balance + result.net;
}

// ============ TRANSACTIONS ============

export function getTransactions(
  accountId?: number,
  limit?: number,
  offset?: number
): Transaction[] {
  const db = getDb();
  let query =
    "SELECT t.*, a.name as account_name FROM transactions t LEFT JOIN accounts a ON t.account_id = a.id";
  const params: (number | string)[] = [];

  if (accountId) {
    query += " WHERE t.account_id = ?";
    params.push(accountId);
  }

  query += " ORDER BY t.date DESC, t.id DESC";

  if (limit) {
    query += " LIMIT ?";
    params.push(limit);
    if (offset) {
      query += " OFFSET ?";
      params.push(offset);
    }
  }

  return db.prepare(query).all(...params) as Transaction[];
}

export function createTransaction(
  accountId: number,
  type: "income" | "expense",
  amount: number,
  date: string,
  category: string,
  description: string
): Transaction {
  const db = getDb();
  const hash = generateImportHash(date, description, amount);
  const result = db
    .prepare(
      "INSERT INTO transactions (account_id, type, amount, date, category, description, import_hash) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(accountId, type, amount, date, category, description, hash);

  return db
    .prepare("SELECT t.*, a.name as account_name FROM transactions t LEFT JOIN accounts a ON t.account_id = a.id WHERE t.id = ?")
    .get(result.lastInsertRowid) as Transaction;
}

export function deleteTransaction(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
}

export function generateImportHash(
  date: string,
  description: string,
  amount: number
): string {
  const raw = `${date}|${description.trim().toLowerCase()}|${amount.toFixed(2)}`;
  return crypto.createHash("md5").update(raw).digest("hex");
}

export function checkDuplicates(hashes: string[]): Set<string> {
  const db = getDb();
  const existing = new Set<string>();
  const stmt = db.prepare(
    "SELECT import_hash FROM transactions WHERE import_hash = ?"
  );
  for (const hash of hashes) {
    const row = stmt.get(hash) as { import_hash: string } | undefined;
    if (row) existing.add(hash);
  }
  return existing;
}

export function bulkInsertTransactions(
  transactions: {
    account_id: number;
    type: "income" | "expense";
    amount: number;
    date: string;
    category: string;
    description: string;
    import_hash: string;
  }[]
): number {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO transactions (account_id, type, amount, date, category, description, import_hash) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  const insertMany = db.transaction(
    (
      txs: {
        account_id: number;
        type: string;
        amount: number;
        date: string;
        category: string;
        description: string;
        import_hash: string;
      }[]
    ) => {
      let count = 0;
      for (const tx of txs) {
        stmt.run(
          tx.account_id,
          tx.type,
          tx.amount,
          tx.date,
          tx.category,
          tx.description,
          tx.import_hash
        );
        count++;
      }
      return count;
    }
  );

  return insertMany(transactions);
}

// ============ RECURRING ============

export function getRecurringPayments(accountId?: number): RecurringPayment[] {
  const db = getDb();
  let query =
    "SELECT r.*, a.name as account_name FROM recurring_payments r LEFT JOIN accounts a ON r.account_id = a.id";
  const params: number[] = [];

  if (accountId) {
    query += " WHERE r.account_id = ?";
    params.push(accountId);
  }

  query += " ORDER BY r.next_date ASC";
  return db.prepare(query).all(...params) as RecurringPayment[];
}

export function createRecurringPayment(
  accountId: number,
  name: string,
  type: "income" | "expense",
  amount: number,
  frequency: string,
  nextDate: string,
  category: string
): RecurringPayment {
  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO recurring_payments (account_id, name, type, amount, frequency, next_date, category) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(accountId, name, type, amount, frequency, nextDate, category);

  return db
    .prepare("SELECT r.*, a.name as account_name FROM recurring_payments r LEFT JOIN accounts a ON r.account_id = a.id WHERE r.id = ?")
    .get(result.lastInsertRowid) as RecurringPayment;
}

export function deleteRecurringPayment(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM recurring_payments WHERE id = ?").run(id);
}

// ============ DASHBOARD ============

export function getDashboardData() {
  const db = getDb();
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthEnd = nextMonth.toISOString().split("T")[0];

  const monthlyIncome = db
    .prepare(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND date >= ? AND date < ?"
    )
    .get(monthStart, monthEnd) as { total: number };

  const monthlyExpenses = db
    .prepare(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND date >= ? AND date < ?"
    )
    .get(monthStart, monthEnd) as { total: number };

  const recurringTotal = db
    .prepare(
      `SELECT COALESCE(SUM(
        CASE frequency
          WHEN 'monthly' THEN amount
          WHEN 'weekly' THEN amount * 4.33
          WHEN 'yearly' THEN amount / 12.0
          ELSE amount
        END
      ), 0) as total FROM recurring_payments WHERE type = 'expense'`
    )
    .get() as { total: number };

  const accounts = getAllAccounts();

  return {
    monthlyIncome: monthlyIncome.total,
    monthlyExpenses: monthlyExpenses.total,
    recurringMonthly: recurringTotal.total,
    accounts,
  };
}

// ============ FORECAST ============

export function getForecast(months: number) {
  const accounts = getAllAccounts();
  const recurringPayments = getRecurringPayments();
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

export function exportAllData() {
  const db = getDb();
  return {
    version: "2.0",
    exportDate: new Date().toISOString(),
    accounts: db.prepare("SELECT * FROM accounts").all(),
    transactions: db.prepare("SELECT * FROM transactions").all(),
    recurring: db.prepare("SELECT * FROM recurring_payments").all(),
  };
}

export function importAllData(data: {
  accounts: Record<string, unknown>[];
  transactions: Record<string, unknown>[];
  recurring: Record<string, unknown>[];
}) {
  const db = getDb();

  const doImport = db.transaction(() => {
    db.prepare("DELETE FROM transactions").run();
    db.prepare("DELETE FROM recurring_payments").run();
    db.prepare("DELETE FROM accounts").run();

    const insertAccount = db.prepare(
      "INSERT INTO accounts (id, name, initial_balance, balance_date, currency, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    );
    for (const a of data.accounts) {
      insertAccount.run(
        a.id,
        a.name,
        a.initial_balance ?? a.balance ?? 0,
        a.balance_date ?? a.date ?? new Date().toISOString().split("T")[0],
        a.currency ?? "EUR",
        a.created_at ?? new Date().toISOString()
      );
    }

    const insertTx = db.prepare(
      "INSERT INTO transactions (id, account_id, type, amount, date, category, description, import_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const t of data.transactions) {
      insertTx.run(
        t.id,
        t.account_id ?? t.accountId,
        t.type,
        t.amount,
        t.date,
        t.category ?? "Autre",
        t.description ?? "",
        t.import_hash ?? null,
        t.created_at ?? new Date().toISOString()
      );
    }

    const insertRec = db.prepare(
      "INSERT INTO recurring_payments (id, account_id, name, type, amount, frequency, next_date, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const r of data.recurring) {
      insertRec.run(
        r.id,
        r.account_id ?? r.accountId,
        r.name,
        r.type ?? "expense",
        r.amount,
        r.frequency ?? "monthly",
        r.next_date ?? r.nextDate ?? r.date,
        r.category ?? "Autre",
        r.created_at ?? new Date().toISOString()
      );
    }
  });

  doImport();
}
