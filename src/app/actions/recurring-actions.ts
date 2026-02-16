"use server";

import {
  getRecurringPayments,
  createRecurringPayment,
  deleteRecurringPayment,
} from "@/lib/queries";
import { revalidatePath } from "next/cache";

export async function getRecurringAction(accountId?: number) {
  return getRecurringPayments(accountId);
}

export async function createRecurringAction(formData: FormData) {
  const accountId = parseInt(formData.get("accountId") as string);
  const name = formData.get("name") as string;
  const type = formData.get("type") as "income" | "expense";
  const amount = parseFloat(formData.get("amount") as string);
  const frequency = formData.get("frequency") as string;
  const nextDate = formData.get("nextDate") as string;
  const category = (formData.get("category") as string) || "Autre";

  if (!accountId || !name || !amount || !nextDate) {
    return { error: "Champs obligatoires manquants" };
  }

  const payment = createRecurringPayment(accountId, name, type, amount, frequency, nextDate, category);
  revalidatePath("/");
  revalidatePath("/recurrents");
  return { success: true, payment };
}

export async function deleteRecurringAction(id: number) {
  deleteRecurringPayment(id);
  revalidatePath("/");
  revalidatePath("/recurrents");
  return { success: true };
}
