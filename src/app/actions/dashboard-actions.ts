"use server";

import { getDashboardData, getDetailedForecast, exportAllData, importAllData } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getDashboardAction() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return getDashboardData(db);
}

export async function getForecastAction(months: number) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return getDetailedForecast(db, months);
}

export async function exportDataAction() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return exportAllData(db);
}

export async function importDataAction(jsonString: string) {
  const data = JSON.parse(jsonString);
  if (!data.accounts || !data.transactions) {
    return { error: "Format de données invalide" };
  }
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await importAllData(db, {
    accounts: data.accounts,
    transactions: data.transactions,
    recurring: data.recurring || [],
  });
  revalidatePath("/");
  return { success: true };
}
