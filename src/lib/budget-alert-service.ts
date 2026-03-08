import type { Client } from "@libsql/client";
import { getBudgets, getBudgetStatus, getAccountById } from "@/lib/queries";
import { sendEmail } from "@/lib/email";
import { renderBudgetAlert } from "@/lib/email-templates";
import { sendPushNotification } from "@/lib/push-notifications";

const BUDGET_WARNING_THRESHOLD = 80;

export async function checkAndSendBudgetAlerts(
  db: Client,
  accountId: number,
  userEmail: string,
  userId?: string
): Promise<void> {
  try {
    const account = await getAccountById(db, accountId);
    const currency = account?.currency ?? "EUR";

    const [budgets, budgetStatuses] = await Promise.all([
      getBudgets(db, accountId),
      getBudgetStatus(db, accountId),
    ]);

    for (const status of budgetStatuses) {
      if (status.percentage < BUDGET_WARNING_THRESHOLD) continue;

      const alertType: "warning" | "exceeded" =
        status.percentage >= 100 ? "exceeded" : "warning";

      const budget = budgets.find((b) => b.category === status.category);
      if (!budget) continue;

      // Anti-spam : pas de double envoi pour le même type d'alerte dans la période
      if (budget.last_budget_alert_type === alertType) continue;

      const subject =
        alertType === "exceeded"
          ? `🚨 Budget ${status.category} dépassé`
          : `⚠️ Budget ${status.category} bientôt épuisé`;

      const result = await sendEmail({
        to: userEmail,
        subject,
        html: renderBudgetAlert(
          status.category,
          status.spent,
          status.limit,
          status.percentage,
          alertType,
          currency
        ),
        replyTo: "support@track-my-cash.fr",
      });

      // Notification push en parallèle
      if (userId) {
        const pushTitle = alertType === "exceeded"
          ? `Budget ${status.category} dépassé`
          : `Budget ${status.category} bientôt épuisé`;
        sendPushNotification(userId, {
          title: pushTitle,
          body: `${Math.round(status.percentage)}% utilisé`,
          tag: `budget-${status.category}`,
          url: "/budgets",
        }).catch(() => {});
      }

      if (result.success) {
        await db.execute({
          sql: "UPDATE budgets SET last_budget_alert_at = ?, last_budget_alert_type = ? WHERE id = ?",
          args: [new Date().toISOString(), alertType, budget.id],
        });
      }
    }
  } catch {
    // Erreur silencieuse — l'alerte ne bloque jamais l'action principale
    console.error("[budget-alert-service] Erreur silencieuse lors de l'envoi des alertes budget");
  }
}
