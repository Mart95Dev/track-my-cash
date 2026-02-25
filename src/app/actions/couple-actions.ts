"use server";

import { getRequiredUserId } from "@/lib/auth-utils";
import { getDb, getUserDb } from "@/lib/db";
import {
  getCoupleByUserId,
  createCouple,
  joinCouple,
  leaveCouple,
} from "@/lib/couple-queries";
import { canUseCoupleFeature } from "@/lib/subscription-utils";
import { updateTransactionCategory } from "@/lib/queries";
import { revalidatePath } from "next/cache";

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createCoupleAction(
  _prev: unknown,
  formData: FormData
): Promise<{ success: true; inviteCode: string } | { error: string }> {
  const userId = await getRequiredUserId();

  const guard = await canUseCoupleFeature(userId);
  if (!guard.allowed) {
    return { error: guard.reason ?? "couple_pro" };
  }

  const existing = await getCoupleByUserId(getDb(), userId);
  if (existing) {
    return { error: "Vous êtes déjà dans un couple" };
  }

  const name = formData.get("name") as string | null;
  const inviteCode = generateInviteCode();

  await createCouple(getDb(), userId, name || null, inviteCode);

  revalidatePath("/couple");
  return { success: true, inviteCode };
}

export async function joinCoupleAction(
  _prev: unknown,
  formData: FormData
): Promise<{ success: true } | { error: string }> {
  const userId = await getRequiredUserId();

  const guard = await canUseCoupleFeature(userId);
  if (!guard.allowed) {
    return { error: guard.reason ?? "couple_pro" };
  }

  const existing = await getCoupleByUserId(getDb(), userId);
  if (existing) {
    return { error: "Vous êtes déjà dans un couple" };
  }

  const rawCode = formData.get("inviteCode") as string | null;
  const inviteCode = rawCode?.trim().toUpperCase() ?? "";

  if (!inviteCode) {
    return { error: "Code requis" };
  }

  const couple = await joinCouple(getDb(), userId, inviteCode);
  if (!couple) {
    return { error: "Code invalide" };
  }

  revalidatePath("/couple");
  return { success: true };
}

export async function leaveCoupleAction(): Promise<{ success: true }> {
  const userId = await getRequiredUserId();
  await leaveCouple(getDb(), userId);
  revalidatePath("/couple");
  return { success: true };
}

/**
 * Marque ou démarque une transaction comme partagée avec le partenaire.
 */
export async function updateTransactionCoupleAction(
  txId: number,
  isShared: boolean,
  paidBy?: string,
  splitType?: string
): Promise<{ success: true } | { error: string }> {
  const userId = await getRequiredUserId();

  const guard = await canUseCoupleFeature(userId);
  if (!guard.allowed) {
    return { error: guard.reason ?? "couple_pro" };
  }

  const db = await getUserDb(userId);
  await db.execute({
    sql: "UPDATE transactions SET is_couple_shared=?, paid_by=?, split_type=? WHERE id=?",
    args: [isShared ? 1 : 0, paidBy ?? null, splitType ?? "50/50", txId],
  });

  revalidatePath("/transactions");
  return { success: true };
}

/**
 * Wrapper form-safe pour utilisation directe dans <form action={...}>.
 * Appelle leaveCoupleAction sans retourner de valeur (void).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function leaveCoupleFormAction(_formData: FormData): Promise<void> {
  await leaveCoupleAction();
}

/**
 * Marque l'onboarding couple comme complété dans la per-user DB.
 * Idempotente : INSERT OR REPLACE ne cause aucune erreur si déjà présent.
 */
export async function markOnboardingCompleteAction(): Promise<void> {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await db.execute({
    sql: "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    args: ["onboarding_couple_completed", "true"],
  });
  revalidatePath("/dashboard");
}

/**
 * Met à jour la catégorie d'une transaction partagée (AC-5 STORY-099).
 */
export async function updateTransactionCategoryAction(
  txId: number,
  category: string
): Promise<void> {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await updateTransactionCategory(db, txId, category);
  revalidatePath("/transactions");
}

/**
 * Persiste le choix d'onboarding couple/solo de l'utilisateur.
 * Stocké dans la per-user DB (settings table, clé `onboarding_choice`).
 */
export async function setOnboardingChoiceAction(
  choice: "couple" | "solo"
): Promise<void> {
  const userId = await getRequiredUserId();

  // Per-user DB → lecture UI via getOnboardingChoice (layout, dashboard)
  const userDb = await getUserDb(userId);
  await userDb.execute({
    sql: "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    args: ["onboarding_choice", choice],
  });

  // Main DB → cron /api/cron/couple-reminders (WHERE user.onboarding_choice = 'couple')
  const mainDb = getDb();
  await mainDb.execute({
    sql: "UPDATE user SET onboarding_choice = ? WHERE id = ?",
    args: [choice, userId],
  });

  revalidatePath("/dashboard");
}
