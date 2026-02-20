"use server";

import { getSetting, setSetting } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getSettingAction(key: string) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return getSetting(db, key);
}

export async function saveOpenRouterKeyAction(key: string) {
  if (!key || !key.trim()) {
    return { error: "Clé API requise" };
  }
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await setSetting(db, "openrouter_api_key", key.trim());
  revalidatePath("/conseiller");
  revalidatePath("/parametres");
  return { success: true };
}

export async function saveExchangeRateAction(rate: number) {
  if (!rate || rate <= 0) {
    return { error: "Taux invalide" };
  }
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await setSetting(db, "exchange_rate_eur_mga", String(rate));
  revalidatePath("/");
  revalidatePath("/parametres");
  return { success: true };
}
