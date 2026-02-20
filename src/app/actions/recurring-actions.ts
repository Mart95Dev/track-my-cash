"use server";

import {
  getRecurringPayments,
  createRecurringPayment,
  deleteRecurringPayment,
  updateRecurringPayment,
} from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getRecurringAction(accountId?: number) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return getRecurringPayments(db, accountId);
}

export async function createRecurringAction(_prev: unknown, formData: FormData) {
  const accountId = parseInt(formData.get("accountId") as string);
  const name = formData.get("name") as string;
  const type = formData.get("type") as "income" | "expense";
  const amount = parseFloat(formData.get("amount") as string);
  const frequency = formData.get("frequency") as string;
  const nextDate = formData.get("nextDate") as string;
  const category = (formData.get("category") as string) || "Autre";
  const subcategoryRaw = formData.get("subcategory") as string;
  const subcategory = subcategoryRaw && subcategoryRaw.trim() ? subcategoryRaw.trim() : null;
  const endDateRaw = formData.get("endDate") as string;
  const endDate = endDateRaw && endDateRaw.trim() ? endDateRaw.trim() : null;

  if (!accountId || !name || !amount || !nextDate) {
    return { error: "Champs obligatoires manquants" };
  }

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const payment = await createRecurringPayment(db, accountId, name, type, amount, frequency, nextDate, category, endDate, subcategory);
  revalidatePath("/");
  revalidatePath("/recurrents");
  revalidatePath("/previsions");
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
  const subcategoryRaw = formData.get("subcategory") as string;
  const subcategory = subcategoryRaw && subcategoryRaw.trim() ? subcategoryRaw.trim() : null;
  const endDateRaw = formData.get("endDate") as string;
  const endDate = endDateRaw && endDateRaw.trim() ? endDateRaw.trim() : null;

  if (!id || !accountId || !name || !amount || !nextDate) {
    return { error: "Champs obligatoires manquants" };
  }

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await updateRecurringPayment(db, id, accountId, name, type, amount, frequency, nextDate, category, endDate, subcategory);
  revalidatePath("/");
  revalidatePath("/recurrents");
  revalidatePath("/previsions");
  return { success: true };
}

export async function deleteRecurringAction(id: number) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await deleteRecurringPayment(db, id);
  revalidatePath("/");
  revalidatePath("/recurrents");
  return { success: true };
}
