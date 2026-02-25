import type { Client } from "@libsql/client";
import type { Transaction } from "@/lib/queries";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Couple {
  id: string;
  invite_code: string;
  name: string | null;
  created_by: string;
  created_at: number;
}

export interface CoupleMember {
  id: string;
  couple_id: string;
  user_id: string;
  role: "owner" | "member";
  status: string;
  joined_at: number;
}

export interface CoupleBalance {
  id: string;
  couple_id: string;
  user_id: string;
  period_month: string;
  total_paid: number;
  computed_at: number;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Retourne le couple auquel appartient un utilisateur, ou null s'il n'en a pas.
 */
export async function getCoupleByUserId(
  db: Client,
  userId: string
): Promise<Couple | null> {
  const result = await db.execute({
    sql: `SELECT c.id, c.invite_code, c.name, c.created_by, c.created_at
          FROM couples c
          INNER JOIN couple_members cm ON cm.couple_id = c.id
          WHERE cm.user_id = ? AND cm.status = 'active'
          LIMIT 1`,
    args: [userId],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: String(row.id),
    invite_code: String(row.invite_code),
    name: row.name != null ? String(row.name) : null,
    created_by: String(row.created_by),
    created_at: Number(row.created_at),
  };
}

/**
 * Retourne tous les membres actifs d'un couple.
 */
export async function getCoupleMembers(
  db: Client,
  coupleId: string
): Promise<CoupleMember[]> {
  const result = await db.execute({
    sql: `SELECT id, couple_id, user_id, role, status, joined_at
          FROM couple_members
          WHERE couple_id = ? AND status = 'active'`,
    args: [coupleId],
  });

  return result.rows.map((row) => ({
    id: String(row.id),
    couple_id: String(row.couple_id),
    user_id: String(row.user_id),
    role: (String(row.role) === "owner" ? "owner" : "member") as
      | "owner"
      | "member",
    status: String(row.status),
    joined_at: Number(row.joined_at),
  }));
}

/**
 * Crée un nouveau couple avec l'utilisateur comme propriétaire.
 */
export async function createCouple(
  db: Client,
  userId: string,
  name: string | null,
  inviteCode: string
): Promise<Couple> {
  const id = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const memberId = `cm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  await db.execute({
    sql: `INSERT INTO couples (id, invite_code, name, created_by) VALUES (?, ?, ?, ?)`,
    args: [id, inviteCode, name, userId],
  });

  await db.execute({
    sql: `INSERT INTO couple_members (id, couple_id, user_id, role, status) VALUES (?, ?, ?, 'owner', 'active')`,
    args: [memberId, id, userId],
  });

  return {
    id,
    invite_code: inviteCode,
    name,
    created_by: userId,
    created_at: Math.floor(Date.now() / 1000),
  };
}

/**
 * Rejoint un couple via son code d'invitation.
 * Retourne null si le code est invalide.
 */
export async function joinCouple(
  db: Client,
  userId: string,
  inviteCode: string
): Promise<Couple | null> {
  const result = await db.execute({
    sql: `SELECT id, invite_code, name, created_by, created_at
          FROM couples WHERE invite_code = ? LIMIT 1`,
    args: [inviteCode],
  });

  if (result.rows.length === 0) return null;

  const coupleRow = result.rows[0];
  const coupleId = String(coupleRow.id);

  // Vérifie si l'utilisateur est déjà membre
  const memberCheck = await db.execute({
    sql: `SELECT id FROM couple_members WHERE couple_id = ? AND user_id = ?`,
    args: [coupleId, userId],
  });

  if (memberCheck.rows.length > 0) {
    return {
      id: coupleId,
      invite_code: String(coupleRow.invite_code),
      name: coupleRow.name != null ? String(coupleRow.name) : null,
      created_by: String(coupleRow.created_by),
      created_at: Number(coupleRow.created_at),
    };
  }

  const memberId = `cm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  await db.execute({
    sql: `INSERT INTO couple_members (id, couple_id, user_id, role, status) VALUES (?, ?, ?, 'member', 'active')`,
    args: [memberId, coupleId, userId],
  });

  return {
    id: coupleId,
    invite_code: String(coupleRow.invite_code),
    name: coupleRow.name != null ? String(coupleRow.name) : null,
    created_by: String(coupleRow.created_by),
    created_at: Number(coupleRow.created_at),
  };
}

/**
 * Quitte le couple. Supprime le couple entier s'il devient orphelin (0 membres).
 */
export async function leaveCouple(db: Client, userId: string): Promise<void> {
  const coupleResult = await db.execute({
    sql: `SELECT c.id FROM couples c
          INNER JOIN couple_members cm ON cm.couple_id = c.id
          WHERE cm.user_id = ? AND cm.status = 'active'
          LIMIT 1`,
    args: [userId],
  });

  if (coupleResult.rows.length === 0) return;

  const coupleId = String(coupleResult.rows[0].id);

  await db.execute({
    sql: `DELETE FROM couple_members WHERE couple_id = ? AND user_id = ?`,
    args: [coupleId, userId],
  });

  const remainingResult = await db.execute({
    sql: `SELECT COUNT(*) as count FROM couple_members WHERE couple_id = ? AND status = 'active'`,
    args: [coupleId],
  });

  const remaining = Number(remainingResult.rows[0]?.count ?? 0);
  if (remaining === 0) {
    await db.execute({
      sql: `DELETE FROM couples WHERE id = ?`,
      args: [coupleId],
    });
  }
}

// ─── Types STORY-087 ──────────────────────────────────────────────────────────

export interface CoupleBalanceResult {
  user1Paid: number;
  user2Paid: number;
  diff: number;
  owes: string;
  amount: number;
}

// ─── STORY-087 Queries ────────────────────────────────────────────────────────

/**
 * Retourne les transactions partagées des deux utilisateurs fusionnées et triées par date DESC.
 */
export async function getSharedTransactionsForCouple(
  userDb1: Client,
  userDb2: Client,
  period?: string
): Promise<Transaction[]> {
  const periodFilter = period ? ` AND date LIKE ?` : "";
  const args1: (string | number)[] = period ? [period + "%"] : [];
  const args2: (string | number)[] = period ? [period + "%"] : [];

  const [result1, result2] = await Promise.all([
    userDb1.execute({
      sql: `SELECT id, account_id, type, amount, date, category, COALESCE(subcategory, '') as subcategory, description, import_hash, created_at, NULL as account_name, note, is_couple_shared, paid_by, split_type FROM transactions WHERE is_couple_shared = 1${periodFilter} ORDER BY date DESC`,
      args: args1,
    }),
    userDb2.execute({
      sql: `SELECT id, account_id, type, amount, date, category, COALESCE(subcategory, '') as subcategory, description, import_hash, created_at, NULL as account_name, note, is_couple_shared, paid_by, split_type FROM transactions WHERE is_couple_shared = 1${periodFilter} ORDER BY date DESC`,
      args: args2,
    }),
  ]);

  const mapRow = (row: (typeof result1.rows)[0]): Transaction => ({
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
    account_name: undefined,
    note: row.note != null ? String(row.note) : null,
  });

  const transactions = [
    ...result1.rows.map(mapRow),
    ...result2.rows.map(mapRow),
  ];

  transactions.sort((a, b) => b.date.localeCompare(a.date));

  return transactions;
}

/**
 * Calcule la balance couple pour une période donnée.
 * Prend les userDb des deux utilisateurs en paramètre.
 */
export async function computeCoupleBalanceForPeriod(
  userDb1: Client,
  userDb2: Client,
  userId1: string,
  userId2: string,
  period?: string
): Promise<CoupleBalanceResult> {
  const periodFilter = period ? ` AND date LIKE ?` : "";
  const args1: (string | number)[] = [userId1, ...(period ? [period + "%"] : [])];
  const args2: (string | number)[] = [userId2, ...(period ? [period + "%"] : [])];

  const [result1, result2] = await Promise.all([
    userDb1.execute({
      sql: `SELECT SUM(amount) as total FROM transactions WHERE is_couple_shared = 1 AND paid_by = ?${periodFilter}`,
      args: args1,
    }),
    userDb2.execute({
      sql: `SELECT SUM(amount) as total FROM transactions WHERE is_couple_shared = 1 AND paid_by = ?${periodFilter}`,
      args: args2,
    }),
  ]);

  const user1Paid = result1.rows[0]?.total != null ? Number(result1.rows[0].total) : 0;
  const user2Paid = result2.rows[0]?.total != null ? Number(result2.rows[0].total) : 0;
  const diff = user1Paid - user2Paid;

  return {
    user1Paid,
    user2Paid,
    diff,
    owes: diff >= 0 ? userId2 : userId1,
    amount: Math.abs(diff),
  };
}

/**
 * Retourne les balances couple pour une période donnée (format YYYY-MM).
 */
export async function computeCoupleBalance(
  db: Client,
  coupleId: string,
  period: string
): Promise<CoupleBalance[]> {
  const result = await db.execute({
    sql: `SELECT id, couple_id, user_id, period_month, total_paid, computed_at
          FROM couple_balances
          WHERE couple_id = ? AND period_month = ?`,
    args: [coupleId, period],
  });

  return result.rows.map((row) => ({
    id: String(row.id),
    couple_id: String(row.couple_id),
    user_id: String(row.user_id),
    period_month: String(row.period_month),
    total_paid: Number(row.total_paid),
    computed_at: Number(row.computed_at),
  }));
}

// ─── Types STORY-090 ──────────────────────────────────────────────────────────

export interface CoupleBudgetItem {
  id: number;
  account_id: number;
  category: string;
  amount_limit: number;
  period: "monthly" | "yearly";
  couple_id: string | null;
}

export interface CoupleGoalItem {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  deadline: string | null;
  couple_id: string | null;
}

// ─── STORY-090 Queries ────────────────────────────────────────────────────────

/**
 * Retourne les budgets couple (scope='couple') des deux utilisateurs fusionnés.
 */
export async function getCoupleSharedBudgets(
  userDb1: Client,
  userDb2: Client,
  coupleId: string
): Promise<CoupleBudgetItem[]> {
  const [result1, result2] = await Promise.all([
    userDb1.execute({
      sql: `SELECT id, account_id, category, amount_limit, period, couple_id
            FROM budgets WHERE scope = 'couple' AND couple_id = ?`,
      args: [coupleId],
    }),
    userDb2.execute({
      sql: `SELECT id, account_id, category, amount_limit, period, couple_id
            FROM budgets WHERE scope = 'couple' AND couple_id = ?`,
      args: [coupleId],
    }),
  ]);

  const mapRow = (row: (typeof result1.rows)[0]): CoupleBudgetItem => ({
    id: Number(row.id),
    account_id: Number(row.account_id),
    category: String(row.category),
    amount_limit: Number(row.amount_limit),
    period: String(row.period) as "monthly" | "yearly",
    couple_id: row.couple_id ? String(row.couple_id) : null,
  });

  return [...result1.rows.map(mapRow), ...result2.rows.map(mapRow)];
}

/**
 * Retourne les objectifs couple (scope='couple') des deux utilisateurs fusionnés.
 */
export async function getCoupleSharedGoals(
  userDb1: Client,
  userDb2: Client,
  coupleId: string
): Promise<CoupleGoalItem[]> {
  const [result1, result2] = await Promise.all([
    userDb1.execute({
      sql: `SELECT id, name, target_amount, current_amount, currency, deadline, couple_id
            FROM goals WHERE scope = 'couple' AND couple_id = ?`,
      args: [coupleId],
    }),
    userDb2.execute({
      sql: `SELECT id, name, target_amount, current_amount, currency, deadline, couple_id
            FROM goals WHERE scope = 'couple' AND couple_id = ?`,
      args: [coupleId],
    }),
  ]);

  const mapRow = (row: (typeof result1.rows)[0]): CoupleGoalItem => ({
    id: Number(row.id),
    name: String(row.name),
    target_amount: Number(row.target_amount),
    current_amount: Number(row.current_amount),
    currency: String(row.currency),
    deadline: row.deadline ? String(row.deadline) : null,
    couple_id: row.couple_id ? String(row.couple_id) : null,
  });

  return [...result1.rows.map(mapRow), ...result2.rows.map(mapRow)];
}

/**
 * Insère ou met à jour un budget couple (scope='couple') dans la DB de l'utilisateur.
 */
export async function upsertCoupleBudget(
  db: Client,
  accountId: number,
  category: string,
  amountLimit: number,
  period: "monthly" | "yearly",
  coupleId: string
): Promise<void> {
  await db.execute({
    sql: `INSERT INTO budgets (account_id, category, amount_limit, period, scope, couple_id)
          VALUES (?, ?, ?, ?, 'couple', ?)
          ON CONFLICT(account_id, category) DO UPDATE SET
            amount_limit = excluded.amount_limit,
            period = excluded.period,
            scope = 'couple',
            couple_id = excluded.couple_id`,
    args: [accountId, category, amountLimit, period, coupleId],
  });
}

/**
 * Crée un objectif couple (scope='couple') dans la DB de l'utilisateur.
 */
export async function createCoupleGoal(
  db: Client,
  name: string,
  targetAmount: number,
  currency: string,
  coupleId: string,
  deadline?: string
): Promise<void> {
  await db.execute({
    sql: `INSERT INTO goals (name, target_amount, current_amount, currency, deadline, scope, couple_id)
          VALUES (?, ?, 0, ?, ?, 'couple', ?)`,
    args: [name, targetAmount, currency, deadline ?? null, coupleId],
  });
}

// ─── STORY-093 : Onboarding couple ───────────────────────────────────────────

/**
 * Retourne true si l'utilisateur a complété l'onboarding couple.
 * Lit le setting `onboarding_couple_completed` dans la per-user DB.
 */
export async function getOnboardingStatus(db: Client): Promise<boolean> {
  const result = await db.execute({
    sql: "SELECT value FROM settings WHERE key = 'onboarding_couple_completed' LIMIT 1",
    args: [],
  });
  return result.rows.length > 0 && String(result.rows[0].value) === "true";
}

// ─── STORY-094 : Dashboard couple enrichi ────────────────────────────────────

export interface CoupleMonthStats {
  totalExpenses: number;
  transactionCount: number;
  variation: number | null;
  topCategories: Array<{ category: string; total: number }>;
  recentTransactions: Array<{
    amount: number;
    category: string;
    description: string;
    date: string;
    paid_by: string;
  }>;
}

/**
 * Calcule les statistiques financières communes d'un couple pour un mois donné.
 * Fusionne les transactions partagées des deux utilisateurs.
 */
export async function getCoupleMonthStats(
  userDb1: Client,
  userDb2: Client,
  month: string
): Promise<CoupleMonthStats> {
  const [year, mon] = month.split("-").map(Number);
  const prevDate = new Date(year, mon - 2, 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  const currentSql = `SELECT amount, category, description, date, COALESCE(paid_by, '') as paid_by
    FROM transactions WHERE is_couple_shared = 1 AND date LIKE ? ORDER BY date DESC`;
  const prevSql = `SELECT COALESCE(SUM(ABS(amount)), null) as total
    FROM transactions WHERE is_couple_shared = 1 AND date LIKE ? AND amount < 0`;

  const [result1, result2, prev1, prev2] = await Promise.all([
    userDb1.execute({ sql: currentSql, args: [month + "%"] }),
    userDb2.execute({ sql: currentSql, args: [month + "%"] }),
    userDb1.execute({ sql: prevSql, args: [prevMonth + "%"] }),
    userDb2.execute({ sql: prevSql, args: [prevMonth + "%"] }),
  ]);

  type TxRow = {
    amount: number;
    category: string;
    description: string;
    date: string;
    paid_by: string;
  };

  const mapTx = (row: (typeof result1.rows)[0]): TxRow => ({
    amount: Number(row.amount),
    category: String(row.category),
    description: String(row.description),
    date: String(row.date),
    paid_by: String(row.paid_by),
  });

  const txs = [...result1.rows.map(mapTx), ...result2.rows.map(mapTx)].sort(
    (a, b) => b.date.localeCompare(a.date)
  );

  const totalExpenses = txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const transactionCount = txs.length;

  // Variation vs mois précédent
  const rawPrev1 = prev1.rows[0]?.total;
  const rawPrev2 = prev2.rows[0]?.total;
  const prevTotal1 = rawPrev1 != null ? Number(rawPrev1) : null;
  const prevTotal2 = rawPrev2 != null ? Number(rawPrev2) : null;

  let variation: number | null = null;
  if (prevTotal1 !== null || prevTotal2 !== null) {
    const prevTotal = (prevTotal1 ?? 0) + (prevTotal2 ?? 0);
    if (prevTotal > 0) {
      variation = ((totalExpenses - prevTotal) / prevTotal) * 100;
    }
  }

  // Top 3 catégories par montant DESC
  const catMap = new Map<string, number>();
  for (const tx of txs) {
    if (tx.amount < 0) {
      catMap.set(tx.category, (catMap.get(tx.category) ?? 0) + Math.abs(tx.amount));
    }
  }
  const topCategories = Array.from(catMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  return {
    totalExpenses,
    transactionCount,
    variation,
    topCategories,
    recentTransactions: txs.slice(0, 10),
  };
}

// ─── Weekly stats couple ──────────────────────────────────────────────────────

export interface CoupleWeeklyData {
  sharedExpenses: number;
  balance: number;
  topSharedCategory: string;
  transactionCount: number;
  partnerName: string;
}

/**
 * Calcule les statistiques hebdomadaires couple en fusionnant les transactions
 * partagées des deux bases per-user.
 */
export async function getCoupleWeeklyStats(
  userDb1: Client,
  userDb2: Client,
  userId1: string,
  userId2: string,
  since: string
): Promise<Omit<CoupleWeeklyData, "partnerName">> {
  const sql =
    "SELECT amount, category, paid_by FROM transactions WHERE is_couple_shared = 1 AND date >= ?";

  const [r1, r2] = await Promise.all([
    userDb1.execute({ sql, args: [since] }),
    userDb2.execute({ sql, args: [since] }),
  ]);

  const allRows = [...r1.rows, ...r2.rows] as unknown as Array<{
    amount: number;
    category: string;
    paid_by: string;
  }>;

  if (allRows.length === 0) {
    return { sharedExpenses: 0, balance: 0, topSharedCategory: "", transactionCount: 0 };
  }

  let sharedExpenses = 0;
  let user1Total = 0;
  let user2Total = 0;
  const catMap = new Map<string, number>();

  for (const row of allRows) {
    const amt = Math.abs(Number(row.amount));
    sharedExpenses += amt;
    catMap.set(row.category, (catMap.get(row.category) ?? 0) + amt);
    if (row.paid_by === userId1) user1Total += amt;
    else if (row.paid_by === userId2) user2Total += amt;
  }

  const topSharedCategory =
    Array.from(catMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

  // balance positive = userId2 doit à userId1 (userId1 a payé davantage)
  const balance = user1Total - user2Total;

  return { sharedExpenses, balance, topSharedCategory, transactionCount: allRows.length };
}
