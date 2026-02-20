"use server";

import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getTransactionsAction(accountId?: number) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return getTransactions(db, accountId);
}

export async function createTransactionAction(_prev: unknown, formData: FormData) {
  const accountId = parseInt(formData.get("accountId") as string);
  const type = formData.get("type") as "income" | "expense";
  const amount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;
  const category = (formData.get("category") as string) || "Autre";
  const subcategory = (formData.get("subcategory") as string) || "";
  const description = (formData.get("description") as string) || "";

  if (!accountId || !amount || !date || !type) {
    return { error: "Champs obligatoires manquants" };
  }

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const transaction = await createTransaction(db, accountId, type, amount, date, category, subcategory, description);
  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true, transaction };
}

export async function updateTransactionAction(_prev: unknown, formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const accountId = parseInt(formData.get("accountId") as string);
  const type = formData.get("type") as "income" | "expense";
  const amount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;
  const category = (formData.get("category") as string) || "Autre";
  const subcategory = (formData.get("subcategory") as string) || "";
  const description = (formData.get("description") as string) || "";

  if (!id || !accountId || !amount || !date || !type) {
    return { error: "Champs obligatoires manquants" };
  }

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await updateTransaction(db, id, accountId, type, amount, date, category, subcategory, description);
  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true };
}

export async function deleteTransactionAction(id: number) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await deleteTransaction(db, id);
  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true };
}
