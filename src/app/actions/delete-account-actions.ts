"use server";

import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth-utils";
import { getDb, getUserDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function deleteUserAccountAction(): Promise<void> {
  const session = await getRequiredSession();
  const userId = session.user.id;
  const mainDb = getDb();

  // 1. Annuler l'abonnement Stripe actif (best-effort)
  try {
    const subResult = await mainDb.execute({
      sql: "SELECT stripe_subscription_id FROM subscriptions WHERE user_id = ? AND status = 'active'",
      args: [userId],
    });
    const subId = subResult.rows[0]?.stripe_subscription_id;
    if (subId) {
      await getStripe().subscriptions.cancel(String(subId));
    }
  } catch (err) {
    console.error("[delete-account] Stripe cancel failed:", err);
  }

  // 2. Supprimer les données Turso per-user (best-effort)
  try {
    const userDb = await getUserDb(userId);
    await userDb.executeMultiple(`
      DELETE FROM transaction_tags;
      DELETE FROM tags;
      DELETE FROM categorization_rules;
      DELETE FROM recurring_payments;
      DELETE FROM transactions;
      DELETE FROM accounts;
      DELETE FROM settings;
    `);
  } catch (err) {
    console.error("[delete-account] User DB cleanup failed:", err);
  }

  // 3. Supprimer l'entrée users_databases de la DB principale
  try {
    await mainDb.execute({
      sql: "DELETE FROM users_databases WHERE user_id = ?",
      args: [userId],
    });
    await mainDb.execute({
      sql: "DELETE FROM subscriptions WHERE user_id = ?",
      args: [userId],
    });
  } catch (err) {
    console.error("[delete-account] Main DB cleanup failed:", err);
  }

  // 4. Supprimer l'utilisateur better-auth (sessions + user via DB directe)
  try {
    await mainDb.execute({ sql: 'DELETE FROM session WHERE "userId" = ?', args: [userId] });
    await mainDb.execute({ sql: 'DELETE FROM account WHERE "userId" = ?', args: [userId] });
    await mainDb.execute({ sql: 'DELETE FROM "user" WHERE id = ?', args: [userId] });
  } catch (err) {
    console.error("[delete-account] better-auth deleteUser failed:", err);
  }

  // 5. Rediriger vers l'accueil
  redirect("/");
}
