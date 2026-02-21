"use server";

import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/queries";
import { revalidatePath } from "next/cache";

export async function markNotificationReadAction(id: number): Promise<void> {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await markNotificationRead(db, id);
  revalidatePath("/");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await markAllNotificationsRead(db);
  revalidatePath("/");
}
