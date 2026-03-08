import type { Client } from "@libsql/client";
import crypto from "crypto";
import type { Transaction } from "./types";
import { rowToTransaction } from "./mappers";

// ============ QUERY BUILDER ============

const BASE_SELECT = "SELECT t.*, a.name as account_name FROM transactions t LEFT JOIN accounts a ON t.account_id = a.id";

interface TransactionQueryOpts {
  accountId?: number;
  search?: string;
  sort?: string;
  tagId?: number;
  limit?: number;
  offset?: number;
}

function buildTransactionQuery(opts: TransactionQueryOpts): { sql: string; args: (number | string)[] } {
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

  let sql = `${BASE_SELECT}${where} ORDER BY ${orderBy}`;

  if (opts.limit) {
    sql += " LIMIT ?";
    args.push(opts.limit);
    if (opts.offset) {
      sql += " OFFSET ?";
      args.push(opts.offset);
    }
  }

  return { sql, args };
}

function buildCountQuery(opts: TransactionQueryOpts): { sql: string; args: (number | string)[] } {
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
  return { sql: `SELECT COUNT(*) as cnt FROM transactions t${where}`, args };
}

// ============ PUBLIC API ============

export async function getTransactions(
  db: Client,
  accountId?: number,
  limit?: number,
  offset?: number
): Promise<Transaction[]> {
  const { sql, args } = buildTransactionQuery({ accountId, limit, offset });
  const result = await db.execute({ sql, args });
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
  const offset = (page - 1) * perPage;

  const filterOpts: TransactionQueryOpts = {
    accountId: opts.accountId,
    search: opts.search,
    sort: opts.sort,
    tagId: opts.tagId,
    limit: perPage,
    offset,
  };

  const countQuery = buildCountQuery(filterOpts);
  const countResult = await db.execute(countQuery);
  const total = Number(countResult.rows[0].cnt);

  const { sql, args } = buildTransactionQuery(filterOpts);
  const result = await db.execute({ sql, args });

  return { transactions: result.rows.map(rowToTransaction), total };
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

export async function updateTransactionNote(
  db: Client,
  id: number,
  note: string | null
): Promise<void> {
  await db.execute({
    sql: "UPDATE transactions SET note = ? WHERE id = ?",
    args: [note, id],
  });
}

export async function updateTransactionCategory(
  db: Client,
  txId: number,
  category: string
): Promise<void> {
  await db.execute({
    sql: "UPDATE transactions SET category = ? WHERE id = ?",
    args: [category, txId],
  });
}

export async function getUncategorizedTransactions(
  db: Client,
  limit = 50
): Promise<Transaction[]> {
  const result = await db.execute({
    sql: `SELECT t.*, a.name as account_name FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE (t.category = '' OR t.category = 'Autre' OR t.category IS NULL)
      ORDER BY t.date DESC LIMIT ?`,
    args: [limit],
  });
  return result.rows.map(rowToTransaction);
}

export async function batchUpdateCategories(
  db: Client,
  categorizations: { id: number; category: string; subcategory?: string }[]
): Promise<void> {
  for (const c of categorizations) {
    await db.execute({
      sql: "UPDATE transactions SET category = ?, subcategory = ? WHERE id = ?",
      args: [c.category, c.subcategory ?? null, c.id],
    });
  }
}
