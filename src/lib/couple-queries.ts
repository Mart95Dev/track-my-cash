import type { Client } from "@libsql/client";

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
