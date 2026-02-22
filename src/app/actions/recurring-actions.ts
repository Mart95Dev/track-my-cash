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
import { detectRecurringPatterns } from "@/lib/recurring-detector";
import type { RecurringSuggestion } from "@/lib/recurring-detector";

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

export async function detectRecurringSuggestionsAction(accountId: number): Promise<RecurringSuggestion[]> {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sinceDate = sixMonthsAgo.toISOString().split("T")[0]!;

  const [txResult, recurringPayments] = await Promise.all([
    db.execute({
      sql: `SELECT id, description, amount, type, date, category FROM transactions WHERE account_id = ? AND date >= ? ORDER BY date DESC`,
      args: [accountId, sinceDate],
    }),
    getRecurringPayments(db, accountId),
  ]);

  const transactions = txResult.rows.map((r) => ({
    id: Number(r.id),
    description: String(r.description),
    amount: Number(r.amount),
    type: r.type as "income" | "expense",
    date: String(r.date),
    category: String(r.category ?? "Autre"),
  }));

  const existingRecurrings = recurringPayments.map((r) => ({
    name: r.name,
    amount: r.amount,
    frequency: r.frequency,
  }));

  return detectRecurringPatterns({ transactions, existingRecurrings });
}

export async function createRecurringFromSuggestionAction(
  accountId: number,
  suggestion: Pick<RecurringSuggestion, "displayName" | "type" | "avgAmount" | "frequency" | "nextDate" | "category">
) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);

  await createRecurringPayment(
    db,
    accountId,
    suggestion.displayName,
    suggestion.type,
    suggestion.avgAmount,
    suggestion.frequency,
    suggestion.nextDate,
    suggestion.category,
    null,
    null
  );
  revalidatePath("/");
  revalidatePath("/recurrents");
  revalidatePath("/previsions");
  return { success: true };
}
