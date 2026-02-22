"use server";

import { getSetting, setSetting, getMonthlySummary, getExpensesByBroadCategory } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId, getRequiredSession } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { renderMonthlySummaryEmail } from "@/lib/email-templates";

export async function getSettingAction(key: string) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  return getSetting(db, key);
}

export async function saveOpenRouterKeyAction(key: string) {
  if (!key || !key.trim()) {
    return { error: "Clé API requise" };
  }
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await setSetting(db, "openrouter_api_key", key.trim());
  revalidatePath("/conseiller");
  revalidatePath("/parametres");
  return { success: true };
}

export async function sendMonthlySummaryAction() {
  const session = await getRequiredSession();
  const userEmail = session.user.email;
  const userId = session.user.id;
  const db = await getUserDb(userId);

  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [summaries, broadCategories, currencyStr] = await Promise.all([
    getMonthlySummary(db),
    getExpensesByBroadCategory(db),
    getSetting(db, "reference_currency"),
  ]);

  const currency = currencyStr ?? "EUR";
  const current = summaries.find((s) => s.month === currentMonth) ?? {
    month: currentMonth,
    income: 0,
    expenses: 0,
    net: 0,
  };

  const totalExpenses = broadCategories.reduce((sum, c) => sum + c.total, 0);
  const topCategories = broadCategories.slice(0, 3).map((c) => ({
    category: c.category,
    total: c.total,
    percentage: totalExpenses > 0 ? (c.total / totalExpenses) * 100 : 0,
  }));

  const html = renderMonthlySummaryEmail({
    month: current.month,
    income: current.income,
    expenses: current.expenses,
    net: current.net,
    currency,
    topCategories,
  });

  const result = await sendEmail({
    to: userEmail,
    subject: `Récapitulatif mensuel TrackMyCash — ${new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`,
    html,
  });

  if (!result.success) {
    return { error: result.error ?? "Erreur lors de l'envoi" };
  }

  return { success: true };
}

export async function toggleAutoCategorizationAction(enabled: boolean) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await setSetting(db, "auto_categorize_on_import", enabled ? "true" : "false");
  revalidatePath("/parametres");
  return { success: true };
}

export async function saveExchangeRateAction(rate: number) {
  if (!rate || rate <= 0) {
    return { error: "Taux invalide" };
  }
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);
  await setSetting(db, "exchange_rate_eur_mga", String(rate));
  revalidatePath("/");
  revalidatePath("/parametres");
  return { success: true };
}
