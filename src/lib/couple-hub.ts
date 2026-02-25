// ─── STORY-106 : Couple hub — fonctions pures d'état ─────────────────────────

export type CoupleState = "none" | "pending" | "complete";

/**
 * Retourne le nombre de membres actifs dans un tableau de membres.
 */
export function getActiveMemberCount(
  members: Array<{ status: string }>
): number {
  return members.filter((m) => m.status === "active").length;
}

/**
 * Retourne l'état du hub couple selon le couple et le nombre de membres actifs.
 * - 'none'     : couple === null (pas de couple)
 * - 'pending'  : couple existe mais < 2 membres actifs
 * - 'complete' : couple existe avec >= 2 membres actifs
 */
export function getCoupleState(
  couple: null | { id: string },
  memberCount: number
): CoupleState {
  if (couple === null) return "none";
  if (memberCount >= 2) return "complete";
  return "pending";
}
