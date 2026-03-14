import type { Client } from "@libsql/client";

/**
 * Schéma de base per-user — tables principales.
 * Exécuté via executeMultiple (CREATE IF NOT EXISTS = idempotent).
 */
const BASE_SCHEMA = `
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
`;

/**
 * Migrations per-user DB — colonnes et tables additionnelles.
 * Chaque migration est exécutée individuellement avec try/catch (idempotent).
 */
const PER_USER_MIGRATIONS = [
  "ALTER TABLE accounts ADD COLUMN alert_threshold REAL",
  "ALTER TABLE accounts ADD COLUMN statement_balance REAL",
  "ALTER TABLE accounts ADD COLUMN statement_date TEXT",
  "ALTER TABLE accounts ADD COLUMN last_alert_sent_at TEXT",
  "ALTER TABLE accounts ADD COLUMN visibility TEXT DEFAULT 'personal'",
  "ALTER TABLE transactions ADD COLUMN reconciled INTEGER DEFAULT 0",
  "ALTER TABLE transactions ADD COLUMN subcategory TEXT",
  "ALTER TABLE transactions ADD COLUMN note TEXT",
  "ALTER TABLE transactions ADD COLUMN is_couple_shared INTEGER DEFAULT 0",
  "ALTER TABLE transactions ADD COLUMN paid_by TEXT",
  "ALTER TABLE transactions ADD COLUMN split_type TEXT DEFAULT '50/50'",
  "ALTER TABLE recurring_payments ADD COLUMN end_date TEXT",
  "ALTER TABLE recurring_payments ADD COLUMN subcategory TEXT",
  `CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount_limit REAL NOT NULL,
    period TEXT NOT NULL DEFAULT 'monthly',
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_account_category ON budgets(account_id, category)",
  "ALTER TABLE budgets ADD COLUMN last_budget_alert_at TEXT",
  "ALTER TABLE budgets ADD COLUMN last_budget_alert_type TEXT",
  "ALTER TABLE budgets ADD COLUMN scope TEXT DEFAULT 'personal'",
  "ALTER TABLE budgets ADD COLUMN couple_id TEXT",
  `CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    target_amount REAL NOT NULL,
    current_amount REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'EUR',
    deadline TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  "ALTER TABLE goals ADD COLUMN account_id INTEGER REFERENCES accounts(id)",
  "ALTER TABLE goals ADD COLUMN monthly_contribution REAL DEFAULT 0",
  "ALTER TABLE goals ADD COLUMN scope TEXT DEFAULT 'personal'",
  "ALTER TABLE goals ADD COLUMN couple_id TEXT",
  `CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    metadata TEXT
  )`,
  "CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read, created_at DESC)",
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
  `CREATE TABLE IF NOT EXISTS ai_usage (
    user_id TEXT NOT NULL,
    month TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, month)
  )`,
];

/**
 * Initialise le schéma de la DB per-user.
 * À appeler après `getUserDb()`. Idempotent.
 */
export async function initUserSchema(db: Client): Promise<void> {
  // Créer les tables de base
  await db.executeMultiple(BASE_SCHEMA);

  // Appliquer les migrations
  for (const sql of PER_USER_MIGRATIONS) {
    try {
      await db.execute(sql);
    } catch {
      // Colonne ou table déjà existante — ignoré
    }
  }
}
