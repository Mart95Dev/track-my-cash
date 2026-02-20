"use server";

import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export async function getTagsAction(): Promise<Tag[]> {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const result = await db.execute("SELECT * FROM tags ORDER BY name");
  return result.rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    color: String(row.color),
  }));
}

export async function createTagAction(_prev: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const color = (formData.get("color") as string) || "#6b7280";

  if (!name) return { error: "Nom requis" };

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  try {
    await db.execute({
      sql: "INSERT INTO tags (name, color) VALUES (?, ?)",
      args: [name, color],
    });
  } catch {
    return { error: "Ce tag existe déjà" };
  }

  revalidatePath("/parametres");
  return { success: true };
}

export async function deleteTagAction(id: number) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await db.batch([
    { sql: "DELETE FROM transaction_tags WHERE tag_id = ?", args: [id] },
    { sql: "DELETE FROM tags WHERE id = ?", args: [id] },
  ], "write");
  revalidatePath("/parametres");
  return { success: true };
}

export async function getTransactionTagsAction(transactionId: number): Promise<number[]> {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  const result = await db.execute({
    sql: "SELECT tag_id FROM transaction_tags WHERE transaction_id = ?",
    args: [transactionId],
  });
  return result.rows.map((row) => Number(row.tag_id));
}

export async function setTransactionTagsAction(transactionId: number, tagIds: number[]) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await db.execute({
    sql: "DELETE FROM transaction_tags WHERE transaction_id = ?",
    args: [transactionId],
  });

  if (tagIds.length > 0) {
    const stmts = tagIds.map((tagId) => ({
      sql: "INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)",
      args: [transactionId, tagId] as (number | string)[],
    }));
    await db.batch(stmts, "write");
  }

  revalidatePath("/transactions");
  return { success: true };
}
