"use server";

import { getSetting, setSetting } from "@/lib/queries";
import { revalidatePath } from "next/cache";

export async function getSettingAction(key: string) {
  return getSetting(key);
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
