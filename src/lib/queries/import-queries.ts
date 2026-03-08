import type { Client } from "@libsql/client";

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
  await db.batch([
    "DELETE FROM transactions",
    "DELETE FROM recurring_payments",
    "DELETE FROM accounts",
  ], "write");

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
