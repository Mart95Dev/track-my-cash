"use server";

import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/lib/queries";
import { revalidatePath } from "next/cache";

export async function getTransactionsAction(accountId?: number) {
  return getTransactions(accountId);
}

export async function createTransactionAction(_prev: unknown, formData: FormData) {
  const accountId = parseInt(formData.get("accountId") as string);
  const type = formData.get("type") as "income" | "expense";
  const amount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;
  const category = (formData.get("category") as string) || "Autre";
  const description = (formData.get("description") as string) || "";

  if (!accountId || !amount || !date || !type) {
    return { error: "Champs obligatoires manquants" };
  }

  const transaction = await createTransaction(accountId, type, amount, date, category, description);
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
  const description = (formData.get("description") as string) || "";

  if (!id || !accountId || !amount || !date || !type) {
    return { error: "Champs obligatoires manquants" };
  }

  await updateTransaction(id, accountId, type, amount, date, category, description);
  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true };
}

export async function deleteTransactionAction(id: number) {
  await deleteTransaction(id);
  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true };
}
