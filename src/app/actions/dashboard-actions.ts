"use server";

import { getDashboardData, getForecast, exportAllData, importAllData } from "@/lib/queries";
import { revalidatePath } from "next/cache";

export async function getDashboardAction() {
  return getDashboardData();
}

export async function getForecastAction(months: number) {
  return getForecast(months);
}

export async function exportDataAction() {
  return exportAllData();
}

export async function importDataAction(jsonString: string) {
  const data = JSON.parse(jsonString);
  if (!data.accounts || !data.transactions) {
    return { error: "Format de données invalide" };
  }
  await importAllData({
    accounts: data.accounts,
    transactions: data.transactions,
    recurring: data.recurring || [],
  });
  revalidatePath("/");
  return { success: true };
}
