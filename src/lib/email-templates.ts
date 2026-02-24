import { renderEmailBase } from "@/lib/email";
import type { WeeklySummaryData } from "@/lib/queries";

export interface MonthlySummaryData {
  month: string;
  income: number;
  expenses: number;
  net: number;
  currency: string;
  topCategories: { category: string; total: number; percentage: number }[];
}

export function renderMonthlySummaryEmail(data: MonthlySummaryData): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: data.currency }).format(n);

  const monthLabel = new Date(data.month + "-02").toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const isPositive = data.net >= 0;
  const netColor = isPositive ? "#2e7d32" : "#d32f2f";
  const netPrefix = isPositive ? "+" : "";
  const cashflowLabel = isPositive ? "excédent" : "déficit";

  const categoriesHtml =
    data.topCategories.length === 0
      ? `<p style="color: #888; font-style: italic;">Aucune dépense ce mois</p>`
      : data.topCategories
          .slice(0, 3)
          .map(
            (c) => `
          <tr>
            <td style="padding: 8px 12px; color: #555; font-size: 14px;">${c.category}</td>
            <td style="padding: 8px 12px; color: #333; font-size: 14px; text-align: right;">${fmt(c.total)}</td>
            <td style="padding: 8px 12px; color: #888; font-size: 13px; text-align: right;">${Math.round(c.percentage)}%</td>
          </tr>`
          )
          .join("");

  const body = `
    <h2 style="margin: 0 0 4px; font-size: 22px; color: #1a1a1a;">Récapitulatif mensuel</h2>
    <p style="margin: 0 0 24px; color: #888; font-size: 14px;">${monthLabel}</p>

    <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
      <tr>
        <td style="padding: 10px 12px; background: #f5f5f5; border-radius: 4px 0 0 4px; color: #555; font-size: 14px;">Revenus</td>
        <td style="padding: 10px 12px; background: #f5f5f5; border-radius: 0 4px 4px 0; color: #2e7d32; font-weight: 700; font-size: 16px; text-align: right;">${fmt(data.income)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; color: #555; font-size: 14px;">Dépenses</td>
        <td style="padding: 10px 12px; color: #d32f2f; font-weight: 700; font-size: 16px; text-align: right;">${fmt(data.expenses)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; background: #f0f0f0; color: #333; font-size: 14px; font-weight: 600; border-radius: 4px 0 0 4px;">Cashflow net (${cashflowLabel})</td>
        <td style="padding: 10px 12px; background: #f0f0f0; color: ${netColor}; font-weight: 700; font-size: 16px; text-align: right; border-radius: 0 4px 4px 0;">${netPrefix}${fmt(data.net)}</td>
      </tr>
    </table>

    <h3 style="margin: 0 0 12px; font-size: 16px; color: #1a1a1a;">Top catégories de dépenses</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #888; text-transform: uppercase;">Catégorie</th>
        <th style="padding: 8px 12px; text-align: right; font-size: 12px; color: #888; text-transform: uppercase;">Montant</th>
        <th style="padding: 8px 12px; text-align: right; font-size: 12px; color: #888; text-transform: uppercase;">Part</th>
      </tr>
      ${categoriesHtml}
    </table>
  `;

  return renderEmailBase(`Récapitulatif mensuel — ${monthLabel}`, body);
}

export function renderLowBalanceAlert(
  accountName: string,
  balance: number,
  threshold: number,
  currency: string
): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(n);

  const body = `
    <h2 style="margin: 0 0 16px; font-size: 22px; color: #1a1a1a;">⚠️ Alerte solde bas</h2>
    <p style="margin: 0 0 12px; color: #555; line-height: 1.6;">
      Le solde de votre compte <strong>${accountName}</strong> est passé en dessous de votre seuil d'alerte.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0 24px;">
      <tr>
        <td style="padding: 10px 12px; background: #f5f5f5; border-radius: 4px 0 0 4px; color: #555; font-size: 14px;">Solde actuel</td>
        <td style="padding: 10px 12px; background: #f5f5f5; border-radius: 0 4px 4px 0; color: #d32f2f; font-weight: 700; font-size: 16px;">${fmt(balance)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; color: #555; font-size: 14px;">Seuil configuré</td>
        <td style="padding: 10px 12px; color: #333; font-size: 14px;">${fmt(threshold)}</td>
      </tr>
    </table>
    <p style="margin: 0 0 24px; color: #888; font-size: 13px; line-height: 1.5;">
      Pensez à approvisionner votre compte pour éviter tout incident de paiement.
    </p>
    <p style="margin: 24px 0 0; color: #888; font-size: 13px; line-height: 1.5;">
      Pour modifier votre seuil d'alerte, rendez-vous dans les paramètres de votre compte.
    </p>
  `;

  return renderEmailBase(`⚠️ Alerte solde bas — ${accountName}`, body);
}

export function renderBudgetAlert(
  category: string,
  spent: number,
  limit: number,
  percentage: number,
  type: "warning" | "exceeded",
  currency: string
): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(n);

  const isExceeded = type === "exceeded";
  const icon = isExceeded ? "🚨" : "⚠️";
  const barColor = isExceeded ? "#d32f2f" : "#f57c00";
  const pct = Math.min(Math.round(percentage), 100);
  const title = isExceeded
    ? `🚨 Budget ${category} dépassé`
    : `⚠️ Budget ${category} bientôt épuisé`;

  const body = `
    <h2 style="margin: 0 0 16px; font-size: 22px; color: #1a1a1a;">${icon} ${isExceeded ? "Budget dépassé" : "Budget bientôt épuisé"}</h2>
    <p style="margin: 0 0 12px; color: #555; line-height: 1.6;">
      Votre budget pour la catégorie <strong>${category}</strong> ${isExceeded ? "a été dépassé" : "approche de sa limite"}.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0 24px;">
      <tr>
        <td style="padding: 10px 12px; background: #f5f5f5; border-radius: 4px 0 0 4px; color: #555; font-size: 14px;">Dépensé</td>
        <td style="padding: 10px 12px; background: #f5f5f5; border-radius: 0 4px 4px 0; color: ${barColor}; font-weight: 700; font-size: 16px;">${fmt(spent)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; color: #555; font-size: 14px;">Limite</td>
        <td style="padding: 10px 12px; color: #333; font-size: 14px;">${fmt(limit)}</td>
      </tr>
    </table>
    <p style="margin: 0 0 8px; color: #555; font-size: 14px;">Utilisation : <strong>${Math.round(percentage)}%</strong></p>
    <div style="background: #e0e0e0; border-radius: 4px; height: 8px; overflow: hidden; margin-bottom: 24px;">
      <div style="background: ${barColor}; width: ${pct}%; height: 100%; border-radius: 4px;"></div>
    </div>
    <p style="margin: 0 0 24px; color: #888; font-size: 13px; line-height: 1.5;">
      ${isExceeded ? "Vous avez dépassé votre limite mensuelle pour cette catégorie." : "Il vous reste peu de budget pour cette catégorie ce mois-ci."}
    </p>
    <p style="margin: 24px 0 0; color: #888; font-size: 13px; line-height: 1.5;">
      Pour ajuster votre budget, rendez-vous dans la section Budgets.
    </p>
  `;

  return renderEmailBase(title, body);
}

export function renderWelcomeEmail(userEmail: string, appUrl: string): string {
  const dashboardUrl = appUrl ? `${appUrl}/dashboard` : "/dashboard";

  const body = `
    <h2 style="margin: 0 0 16px; font-size: 22px; color: #1a1a1a;">Bienvenue sur TrackMyCash !</h2>
    <p style="margin: 0 0 12px; color: #555; line-height: 1.6;">
      Votre compte <strong>${userEmail || "—"}</strong> vient d'être créé avec succès.
    </p>
    <p style="margin: 0 0 16px; color: #555; line-height: 1.6;">
      TrackMyCash vous permet de&nbsp;:
    </p>
    <ul style="margin: 0 0 24px; padding-left: 20px; color: #555; line-height: 1.8;">
      <li>Centraliser et suivre tous vos comptes bancaires</li>
      <li>Automatiser le suivi de vos paiements récurrents</li>
      <li>Prévoir votre solde sur les 12 prochains mois</li>
    </ul>
    <div style="text-align: center; margin: 32px 0;">
      <a
        href="${dashboardUrl}"
        style="
          display: inline-block;
          background-color: #1a1a1a;
          color: #ffffff;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 15px;
        "
      >
        Accéder à mon espace →
      </a>
    </div>
    <p style="margin: 24px 0 0; color: #888; font-size: 13px; line-height: 1.5;">
      Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
    </p>
  `;

  return renderEmailBase("Bienvenue sur TrackMyCash", body);
}

export function renderDeletionReminderEmail(
  userEmail: string,
  deleteAt: string,
  cancelUrl: string
): string {
  const deleteDate = new Date(deleteAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const body = `
    <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600;">Rappel : suppression de votre compte</p>
    <p style="margin: 0 0 16px; color: #555; line-height: 1.6;">
      Bonjour,<br/><br/>
      Vous avez demandé la suppression de votre compte TrackMyCash associé à <strong>${userEmail}</strong>.
    </p>
    <p style="margin: 0 0 24px; color: #555; line-height: 1.6;">
      La suppression définitive de toutes vos données aura lieu le <strong>${deleteDate}</strong> (dans 5 jours).
      Si vous avez changé d'avis, vous pouvez annuler votre demande en cliquant ci-dessous.
    </p>
    <div style="text-align: center; margin: 0 0 24px;">
      <a href="${cancelUrl}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Annuler la suppression
      </a>
    </div>
    <p style="margin: 0; color: #888; font-size: 13px; line-height: 1.5;">
      Si vous n'avez pas fait cette demande, contactez-nous à contact@trackmycash.fr.
    </p>
  `;

  return renderEmailBase("Rappel : suppression de votre compte", body);
}

export function renderTrialReminderEmail(
  daysLeft: 3 | 1,
  userName: string,
  baseUrl: string
): string {
  const isUrgent = daysLeft === 1;
  const title = isUrgent
    ? "⚠️ Dernière chance — votre essai Pro expire demain"
    : "⏳ Votre essai Pro expire dans 3 jours";

  const headline = isUrgent
    ? "Votre essai Pro expire demain"
    : `Encore ${daysLeft} jours d'essai Pro`;

  const intro = isUrgent
    ? "C'est votre dernière chance de conserver toutes vos fonctionnalités Pro."
    : "Votre période d'essai gratuite se termine bientôt. Continuez à profiter de toutes les fonctionnalités Pro.";

  const features = [
    "5 comptes bancaires",
    "Import PDF & Excel",
    "Conseiller IA (10 requêtes/mois)",
    "Multi-devises",
    "Export CSV & rapports",
  ];

  const featuresHtml = features
    .map((f) => `<li style="padding: 4px 0; color: #555;">${f}</li>`)
    .join("");

  const body = `
    <h2 style="margin: 0 0 16px; font-size: 22px; color: #1a1a1a;">${headline}</h2>
    <p style="margin: 0 0 12px; color: #555; line-height: 1.6;">Bonjour ${userName},</p>
    <p style="margin: 0 0 16px; color: #555; line-height: 1.6;">${intro}</p>
    <p style="margin: 0 0 8px; color: #1a1a1a; font-weight: 600;">Ce que vous conservez avec Pro :</p>
    <ul style="margin: 0 0 24px; padding-left: 20px;">
      ${featuresHtml}
    </ul>
    <div style="text-align: center; margin: 0 0 24px;">
      <a
        href="${baseUrl}/tarifs"
        style="display: inline-block; background-color: #4848e5; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px;"
      >
        Continuer avec Pro
      </a>
    </div>
    <p style="margin: 0; color: #888; font-size: 13px; line-height: 1.5;">
      Si vous ne souhaitez pas souscrire, votre compte passera automatiquement en plan Gratuit.
    </p>
  `;

  return renderEmailBase(title, body);
}

export type { WeeklySummaryData };

export function renderWeeklyEmail(
  data: WeeklySummaryData,
  userName: string,
  appUrl: string
): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: data.currency }).format(n);

  const weekLabel = `${new Date(data.weekStart + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} – ${new Date(data.weekEnd + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;

  const categoriesHtml =
    data.topCategories.length === 0
      ? `<p style="color: #888; font-style: italic;">Aucune dépense cette semaine</p>`
      : data.topCategories
          .map(
            (c) => `
          <tr>
            <td style="padding: 8px 12px; color: #555; font-size: 14px;">${c.category}</td>
            <td style="padding: 8px 12px; color: #333; font-size: 14px; text-align: right;">${fmt(c.amount)}</td>
          </tr>`
          )
          .join("");

  const budgetsHtml =
    data.budgetsOver.length === 0
      ? ""
      : `
    <h3 style="margin: 0 0 12px; font-size: 16px; color: #d32f2f;">Budgets dépassés</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
      ${data.budgetsOver
        .map(
          (b) => `
        <tr>
          <td style="padding: 8px 12px; color: #555; font-size: 14px;">${b.category}</td>
          <td style="padding: 8px 12px; color: #d32f2f; font-size: 14px; text-align: right;">${fmt(b.spent)} / ${fmt(b.limit)}</td>
        </tr>`
        )
        .join("")}
    </table>`;

  const goalsHtml =
    data.goalsProgress.length === 0
      ? ""
      : `
    <h3 style="margin: 0 0 12px; font-size: 16px; color: #1a1a1a;">Vos objectifs</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
      ${data.goalsProgress
        .map(
          (g) => `
        <tr>
          <td style="padding: 8px 12px; color: #555; font-size: 14px;">${g.name}</td>
          <td style="padding: 8px 12px; color: #1a1a1a; font-size: 14px; text-align: right;">${g.percent}%</td>
        </tr>`
        )
        .join("")}
    </table>`;

  const greeting = userName ? `Bonjour ${userName},` : "Bonjour,";

  const body = `
    <h2 style="margin: 0 0 4px; font-size: 22px; color: #1a1a1a;">Récapitulatif hebdomadaire</h2>
    <p style="margin: 0 0 24px; color: #888; font-size: 14px;">${weekLabel}</p>
    <p style="margin: 0 0 20px; color: #555; font-size: 14px;">${greeting}</p>

    <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
      <tr>
        <td style="padding: 10px 12px; background: #f5f5f5; border-radius: 4px 0 0 4px; color: #555; font-size: 14px;">Revenus</td>
        <td style="padding: 10px 12px; background: #f5f5f5; border-radius: 0 4px 4px 0; color: #2e7d32; font-weight: 700; font-size: 16px; text-align: right;">${fmt(data.totalIncome)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; color: #555; font-size: 14px;">Dépenses</td>
        <td style="padding: 10px 12px; color: #d32f2f; font-weight: 700; font-size: 16px; text-align: right;">${fmt(data.totalExpenses)}</td>
      </tr>
    </table>

    <h3 style="margin: 0 0 12px; font-size: 16px; color: #1a1a1a;">Top catégories</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #888; text-transform: uppercase;">Catégorie</th>
        <th style="padding: 8px 12px; text-align: right; font-size: 12px; color: #888; text-transform: uppercase;">Montant</th>
      </tr>
      ${categoriesHtml}
    </table>

    ${budgetsHtml}
    ${goalsHtml}

    <div style="text-align: center; margin: 0 0 24px;">
      <a href="${appUrl}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Voir mon tableau de bord
      </a>
    </div>
    <p style="margin: 0; color: #888; font-size: 13px; line-height: 1.5;">
      Pour ne plus recevoir ces emails, rendez-vous dans vos <a href="${appUrl}/parametres" style="color: #555;">paramètres</a>.
    </p>
  `;

  return renderEmailBase(`Récapitulatif hebdomadaire — ${weekLabel}`, body);
}
