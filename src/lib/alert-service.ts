import type { Client } from "@libsql/client";
import { getAccountById } from "@/lib/queries";
import { sendEmail } from "@/lib/email";
import { renderLowBalanceAlert } from "@/lib/email-templates";
import { sendPushNotification } from "@/lib/push-notifications";
import { formatCurrency } from "@/lib/format";

export async function checkAndSendLowBalanceAlert(
  db: Client,
  accountId: number,
  userEmail: string,
  userId?: string
): Promise<void> {
  try {
    const account = await getAccountById(db, accountId);
    if (!account) return;
    if (!account.alert_threshold) return;

    const balance = account.calculated_balance ?? account.initial_balance;
    if (balance >= account.alert_threshold) return;

    // Anti-spam : max 1 alerte par compte par 24h
    if (account.last_alert_sent_at) {
      const lastSent = new Date(account.last_alert_sent_at);
      const hoursSince = (Date.now() - lastSent.getTime()) / (1000 * 3600);
      if (hoursSince < 24) return;
    }

    const result = await sendEmail({
      to: userEmail,
      subject: `⚠️ Solde bas — ${account.name}`,
      html: renderLowBalanceAlert(
        account.name,
        balance,
        account.alert_threshold,
        account.currency
      ),
      replyTo: "support@track-my-cash.fr",
    });

    // Notification push en parallèle
    if (userId) {
      sendPushNotification(userId, {
        title: `Solde bas — ${account.name}`,
        body: `Votre solde est de ${formatCurrency(balance, account.currency, "fr")}`,
        tag: `low-balance-${accountId}`,
        url: "/comptes",
      }).catch(() => {});
    }

    if (result.success) {
      await db.execute({
        sql: "UPDATE accounts SET last_alert_sent_at = ? WHERE id = ?",
        args: [new Date().toISOString(), accountId],
      });
    }
  } catch {
    // Erreur silencieuse — l'alerte ne bloque jamais l'action principale
    console.error("[alert-service] Erreur silencieuse lors de l'envoi de l'alerte solde bas");
  }
}
