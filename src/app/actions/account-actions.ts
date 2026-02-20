"use server";

import {
  getAllAccounts,
  createAccount,
  deleteAccount,
  getAccountById,
  updateAccount,
} from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getAccountsAction() {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return getAllAccounts(db);
}

export async function getAccountAction(id: number) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return getAccountById(db, id);
}

export async function createAccountAction(_prev: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const initialBalance = parseFloat(formData.get("initialBalance") as string) || 0;
  const balanceDate = formData.get("balanceDate") as string;
  const currency = (formData.get("currency") as string) || "EUR";

  if (!name || !balanceDate) {
    return { error: "Nom et date du solde requis" };
  }

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const account = await createAccount(db, name, initialBalance, balanceDate, currency);
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

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await updateAccount(db, id, name, initialBalance, balanceDate, currency, alertThreshold);
  revalidatePath("/");
  revalidatePath("/comptes");
  return { success: true };
}

export async function deleteAccountAction(id: number) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await deleteAccount(db, id);
  revalidatePath("/");
  revalidatePath("/comptes");
  return { success: true };
}
