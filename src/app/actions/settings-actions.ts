"use server";

import { getSetting, setSetting } from "@/lib/queries";
import { revalidatePath } from "next/cache";

export async function getSettingAction(key: string) {
  return getSetting(key);
}

export async function saveOpenRouterKeyAction(key: string) {
  if (!key || !key.trim()) {
    return { error: "Clé API requise" };
  }
  await setSetting("openrouter_api_key", key.trim());
  revalidatePath("/conseiller");
  revalidatePath("/parametres");
  return { success: true };
}

export async function saveExchangeRateAction(rate: number) {
  if (!rate || rate <= 0) {
    return { error: "Taux invalide" };
  }
  await setSetting("exchange_rate_eur_mga", String(rate));
  revalidatePath("/");
  revalidatePath("/parametres");
  return { success: true };
}
