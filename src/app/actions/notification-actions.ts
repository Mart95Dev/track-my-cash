"use server";

import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/queries";
import { markAllRead } from "@/lib/notification-queries";
import { revalidatePath } from "next/cache";

/**
 * Marque une notification individuelle comme lue (ancien système INTEGER id).
 * Utilisé par NotificationsBell.
 */
export async function markNotificationReadAction(id: number): Promise<void> {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await markNotificationRead(db, id);
  revalidatePath("/");
}

/**
 * Marque toutes les notifications comme lues (les deux systèmes).
 * Utilisé par NotificationsBell et la page /notifications.
 */
export async function markAllNotificationsReadAction(): Promise<void> {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await Promise.all([
    markAllNotificationsRead(db),
    markAllRead(db),
  ]);
  revalidatePath("/");
}
