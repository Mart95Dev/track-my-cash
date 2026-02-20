import { getPlan } from "./stripe-plans";
import { getDb } from "./db";

export async function getUserPlanId(userId: string): Promise<string> {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT plan_id, status FROM subscriptions WHERE user_id = ?",
      args: [userId],
    });
    if (result.rows.length === 0) return "free";
    const row = result.rows[0];
    // Si l'abonnement n'est pas actif, retourner free
    if (row.status !== "active") return "free";
    return String(row.plan_id ?? "free");
  } catch {
    return "free";
  }
}

export async function canCreateAccount(
  userId: string,
  currentAccountCount: number
): Promise<{ allowed: boolean; reason?: string }> {
  const planId = await getUserPlanId(userId);
  const plan = getPlan(planId);

  if (plan.limits.maxAccounts === -1) return { allowed: true };
  if (currentAccountCount >= plan.limits.maxAccounts) {
    return {
      allowed: false,
      reason: `Limite atteinte : votre plan ${plan.name} autorise ${plan.limits.maxAccounts} compte(s). Passez à un plan supérieur pour en créer plus.`,
    };
  }
  return { allowed: true };
}

export async function canUseAI(
  userId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const planId = await getUserPlanId(userId);
  const plan = getPlan(planId);

  if (!plan.limits.ai) {
    return {
      allowed: false,
      reason: "Le conseiller IA est disponible à partir du plan Pro (4,90€/mois).",
    };
  }
  return { allowed: true };
}

export async function canImportFormat(
  userId: string,
  filename: string
): Promise<{ allowed: boolean; reason?: string }> {
  const lowerFilename = filename.toLowerCase();
  const isPdf = lowerFilename.endsWith(".pdf");
  const isXlsx = lowerFilename.endsWith(".xlsx");

  // CSV toujours autorisé
  if (!isPdf && !isXlsx) return { allowed: true };

  const planId = await getUserPlanId(userId);
  const plan = getPlan(planId);

  // PDF et XLSX nécessitent Pro ou Premium
  if (plan.id === "free") {
    return {
      allowed: false,
      reason: `L'import ${isPdf ? "PDF" : "Excel"} est disponible à partir du plan Pro (4,90€/mois). Seul l'import CSV est inclus dans le plan Gratuit.`,
    };
  }
  return { allowed: true };
}
