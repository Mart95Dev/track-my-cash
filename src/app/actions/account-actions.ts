"use server";

import {
  getAllAccounts,
  createAccount,
  deleteAccount,
  getAccountById,
  updateAccount,
} from "@/lib/queries";
import { revalidatePath } from "next/cache";

export async function getAccountsAction() {
  return getAllAccounts();
}

export async function getAccountAction(id: number) {
  return getAccountById(id);
}

export async function createAccountAction(_prev: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const initialBalance = parseFloat(formData.get("initialBalance") as string) || 0;
  const balanceDate = formData.get("balanceDate") as string;
  const currency = (formData.get("currency") as string) || "EUR";

  if (!name || !balanceDate) {
    return { error: "Nom et date du solde requis" };
  }

  const account = await createAccount(name, initialBalance, balanceDate, currency);
  revalidatePath("/");
  revalidatePath("/comptes");
  return { success: true, account };
}

export async function updateAccountAction(_prev: unknown, formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const name = formData.get("name") as string;
  const initialBalance = parseFloat(formData.get("initialBalance") as string) || 0;
  const balanceDate = formData.get("balanceDate") as string;
  const currency = (formData.get("currency") as string) || "EUR";
  const alertThresholdStr = formData.get("alertThreshold") as string;
  const alertThreshold = alertThresholdStr ? parseFloat(alertThresholdStr) : null;

  if (!id || !name || !balanceDate) {
    return { error: "Champs obligatoires manquants" };
  }

  await updateAccount(id, name, initialBalance, balanceDate, currency, alertThreshold);
  revalidatePath("/");
  revalidatePath("/comptes");
  return { success: true };
}

export async function deleteAccountAction(id: number) {
  await deleteAccount(id);
  revalidatePath("/");
  revalidatePath("/comptes");
  return { success: true };
}
