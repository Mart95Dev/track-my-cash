import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

export function getDb(): Client {
  if (!client) {
    client = createClient({
      url: process.env.DATABASE_URL_TURSO!,
      authToken: process.env.API_KEY_TURSO!,
    });
  }
  return client;
}

export async function getUserDb(userId: string): Promise<Client> {
  const { getUserDbClient } = await import("./turso-manager");
  return getUserDbClient(userId);
}

export async function initSchema() {
  const db = getDb();
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users_databases (
      user_id TEXT PRIMARY KEY,
      db_hostname TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      initial_balance REAL NOT NULL DEFAULT 0,
      balance_date TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'EUR',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      category TEXT DEFAULT 'Autre',
      description TEXT DEFAULT '',
      import_hash TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS recurring_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'expense' CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL,
      frequency TEXT NOT NULL DEFAULT 'monthly',
      next_date TEXT NOT NULL,
      category TEXT DEFAULT 'Autre',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(import_hash);
    CREATE INDEX IF NOT EXISTS idx_recurring_account ON recurring_payments(account_id);

    CREATE TABLE IF NOT EXISTS categorization_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern TEXT NOT NULL,
      category TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#6b7280'
    );

    CREATE TABLE IF NOT EXISTS transaction_tags (
      transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (transaction_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      plan_id TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'active',
      current_period_end INTEGER,
      cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  // Add columns if they don't exist (safe ALTER TABLE)
  const migrations = [
    "ALTER TABLE accounts ADD COLUMN alert_threshold REAL",
    "ALTER TABLE accounts ADD COLUMN statement_balance REAL",
    "ALTER TABLE accounts ADD COLUMN statement_date TEXT",
    "ALTER TABLE transactions ADD COLUMN reconciled INTEGER DEFAULT 0",
    "ALTER TABLE recurring_payments ADD COLUMN end_date TEXT",
    "ALTER TABLE recurring_payments ADD COLUMN subcategory TEXT",
    "ALTER TABLE transactions ADD COLUMN subcategory TEXT",
    "ALTER TABLE accounts ADD COLUMN last_alert_sent_at TEXT",
    `CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      amount_limit REAL NOT NULL,
      period TEXT NOT NULL DEFAULT 'monthly',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_account_category ON budgets(account_id, category)",
    // Migre les anciennes lignes : l'ancien category (pattern) → subcategory,
    // et dérive la catégorie large depuis les règles → category.
    // WHERE subcategory IS NULL cible uniquement les lignes pré-migration.
    `UPDATE transactions SET subcategory = category, category = COALESCE((SELECT cr.category FROM categorization_rules cr WHERE cr.pattern = transactions.category ORDER BY cr.priority DESC LIMIT 1), category) WHERE subcategory IS NULL`,
    "ALTER TABLE budgets ADD COLUMN last_budget_alert_at TEXT",
    "ALTER TABLE budgets ADD COLUMN last_budget_alert_type TEXT",
    `CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'EUR',
      deadline TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    "CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read, created_at DESC)",
    "ALTER TABLE goals ADD COLUMN account_id INTEGER REFERENCES accounts(id)",
    "ALTER TABLE goals ADD COLUMN monthly_contribution REAL DEFAULT 0",
    `CREATE TABLE IF NOT EXISTS budget_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      period TEXT NOT NULL,
      limit_amount REAL NOT NULL,
      spent_amount REAL NOT NULL,
      month TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_budget_history_month ON budget_history(account_id, category, month)",
  ];
  for (const sql of migrations) {
    try {
      await db.execute(sql);
    } catch {
      // Column already exists, ignore
    }
  }
}

let schemaInitialized = false;

export async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

export async function getUserPlan(userId: string): Promise<string> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT plan_id, status FROM subscriptions WHERE user_id = ?",
    args: [userId],
  });

  if (result.rows.length === 0) return "free";

  const row = result.rows[0];
  const status = String(row.status ?? "active");
  if (status !== "active") return "free";

  return String(row.plan_id ?? "free");
}
