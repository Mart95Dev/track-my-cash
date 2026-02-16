"use server";

import {
  getRecurringPayments,
  createRecurringPayment,
  deleteRecurringPayment,
  updateRecurringPayment,
} from "@/lib/queries";
import { revalidatePath } from "next/cache";

export async function getRecurringAction(accountId?: number) {
  return getRecurringPayments(accountId);
}

export async function createRecurringAction(_prev: unknown, formData: FormData) {
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

  const payment = await createRecurringPayment(accountId, name, type, amount, frequency, nextDate, category);
  revalidatePath("/");
  revalidatePath("/recurrents");
  return { success: true, payment };
}

export async function updateRecurringAction(_prev: unknown, formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const accountId = parseInt(formData.get("accountId") as string);
  const name = formData.get("name") as string;
  const type = formData.get("type") as "income" | "expense";
  const amount = parseFloat(formData.get("amount") as string);
  const frequency = formData.get("frequency") as string;
  const nextDate = formData.get("nextDate") as string;
  const category = (formData.get("category") as string) || "Autre";

  if (!id || !accountId || !name || !amount || !nextDate) {
    return { error: "Champs obligatoires manquants" };
  }

  await updateRecurringPayment(id, accountId, name, type, amount, frequency, nextDate, category);
  revalidatePath("/");
  revalidatePath("/recurrents");
  return { success: true };
}

export async function deleteRecurringAction(id: number) {
  await deleteRecurringPayment(id);
  revalidatePath("/");
  revalidatePath("/recurrents");
  return { success: true };
}
