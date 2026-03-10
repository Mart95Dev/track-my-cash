import { renderEmailBase } from "@/lib/email";
import type { WeeklySummaryData } from "@/lib/queries";
import type { CoupleWeeklyData } from "@/lib/couple-queries";
import { EMAIL_COLORS } from "@/lib/email/styles";
import {
  renderHeading,
  renderSubtitle,
  renderParagraph,
  renderNote,
  renderCTA,
  renderSummaryTable,
  renderDataTable,
  renderProgressBar,
} from "@/lib/email/components";

export interface MonthlySummaryData {
  month: string;
  income: number;
  expenses: number;
  net: number;
  currency: string;
  topCategories: { category: string; total: number; percentage: number }[];
}

function currencyFormatter(currency: string) {
  return (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(n);
}

export function renderMonthlySummaryEmail(data: MonthlySummaryData): string {
  const fmt = currencyFormatter(data.currency);

  const monthLabel = new Date(data.month + "-02").toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const isPositive = data.net >= 0;
  const netColor = isPositive ? EMAIL_COLORS.income : EMAIL_COLORS.expense;
  const netPrefix = isPositive ? "+" : "";
  const cashflowLabel = isPositive ? "excédent" : "déficit";

  const categoriesHtml =
    data.topCategories.length === 0
      ? `<p style="color: ${EMAIL_COLORS.textMuted}; font-style: italic;">Aucune dépense ce mois</p>`
      : renderDataTable(
          [
            { header: "Catégorie" },
            { header: "Montant", align: "right" },
            { header: "Part", align: "right" },
          ],
          data.topCategories.slice(0, 3).map((c) => [
            c.category,
            fmt(c.total),
            `${Math.round(c.percentage)}%`,
          ]),
        );

  const body = `
    ${renderHeading("Récapitulatif mensuel")}
    ${renderSubtitle(monthLabel)}

    ${renderSummaryTable([
      { label: "Revenus", value: fmt(data.income), valueColor: EMAIL_COLORS.income, highlight: true },
      { label: "Dépenses", value: fmt(data.expenses), valueColor: EMAIL_COLORS.expense },
      { label: `Cashflow net (${cashflowLabel})`, value: `${netPrefix}${fmt(data.net)}`, valueColor: netColor, highlight: true },
    ])}

    ${renderHeading("Top catégories de dépenses", 3)}
    ${categoriesHtml}
  `;

  return renderEmailBase(`Récapitulatif mensuel — ${monthLabel}`, body);
}

export function renderLowBalanceAlert(
  accountName: string,
  balance: number,
  threshold: number,
  currency: string
): string {
  const fmt = currencyFormatter(currency);

  const body = `
    ${renderHeading("⚠️ Alerte solde bas")}
    ${renderParagraph(`Le solde de votre compte <strong>${accountName}</strong> est passé en dessous de votre seuil d'alerte.`)}
    ${renderSummaryTable([
      { label: "Solde actuel", value: fmt(balance), valueColor: EMAIL_COLORS.expense, highlight: true },
      { label: "Seuil configuré", value: fmt(threshold) },
    ])}
    ${renderNote("Pensez à approvisionner votre compte pour éviter tout incident de paiement.")}
    ${renderNote("Pour modifier votre seuil d'alerte, rendez-vous dans les paramètres de votre compte.")}
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
  const fmt = currencyFormatter(currency);

  const isExceeded = type === "exceeded";
  const icon = isExceeded ? "🚨" : "⚠️";
  const barColor = isExceeded ? EMAIL_COLORS.expense : EMAIL_COLORS.warning;
  const title = isExceeded
    ? `🚨 Budget ${category} dépassé`
    : `⚠️ Budget ${category} bientôt épuisé`;

  const body = `
    ${renderHeading(`${icon} ${isExceeded ? "Budget dépassé" : "Budget bientôt épuisé"}`)}
    ${renderParagraph(`Votre budget pour la catégorie <strong>${category}</strong> ${isExceeded ? "a été dépassé" : "approche de sa limite"}.`)}
    ${renderSummaryTable([
      { label: "Dépensé", value: fmt(spent), valueColor: barColor, highlight: true },
      { label: "Limite", value: fmt(limit) },
    ])}
    <p style="margin: 0 0 8px; color: ${EMAIL_COLORS.textSecondary}; font-size: 14px;">Utilisation : <strong>${Math.round(percentage)}%</strong></p>
    ${renderProgressBar(percentage, barColor)}
    ${renderNote(isExceeded ? "Vous avez dépassé votre limite mensuelle pour cette catégorie." : "Il vous reste peu de budget pour cette catégorie ce mois-ci.")}
    ${renderNote("Pour ajuster votre budget, rendez-vous dans la section Budgets.")}
  `;

  return renderEmailBase(title, body);
}

export function renderWelcomeEmail(userEmail: string, appUrl: string): string {
  const dashboardUrl = appUrl ? `${appUrl}/dashboard` : "/dashboard";

  const body = `
    ${renderHeading("Bienvenue sur TrackMyCash !")}
    ${renderParagraph(`Votre compte <strong>${userEmail || "—"}</strong> vient d'être créé avec succès.`)}
    <p style="margin: 0 0 16px; color: ${EMAIL_COLORS.textSecondary}; line-height: 1.6;">
      TrackMyCash vous permet de&nbsp;:
    </p>
    <ul style="margin: 0 0 24px; padding-left: 20px; color: ${EMAIL_COLORS.textSecondary}; line-height: 1.8;">
      <li>Centraliser et suivre tous vos comptes bancaires</li>
      <li>Automatiser le suivi de vos paiements récurrents</li>
      <li>Prévoir votre solde sur les 12 prochains mois</li>
    </ul>
    ${renderCTA("Accéder à mon espace →", dashboardUrl)}
    ${renderNote("Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.")}
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
    ${renderParagraph(`Bonjour,<br/><br/>Vous avez demandé la suppression de votre compte TrackMyCash associé à <strong>${userEmail}</strong>.`)}
    <p style="margin: 0 0 24px; color: ${EMAIL_COLORS.textSecondary}; line-height: 1.6;">
      La suppression définitive de toutes vos données aura lieu le <strong>${deleteDate}</strong> (dans 5 jours).
      Si vous avez changé d'avis, vous pouvez annuler votre demande en cliquant ci-dessous.
    </p>
    ${renderCTA("Annuler la suppression", cancelUrl)}
    ${renderNote("Si vous n'avez pas fait cette demande, contactez-nous à contact@trackmycash.fr.")}
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
    .map((f) => `<li style="padding: 4px 0; color: ${EMAIL_COLORS.textSecondary};">${f}</li>`)
    .join("");

  const body = `
    ${renderHeading(headline)}
    ${renderParagraph(`Bonjour ${userName},`)}
    ${renderParagraph(intro)}
    <p style="margin: 0 0 8px; color: ${EMAIL_COLORS.dark}; font-weight: 600;">Ce que vous conservez avec Pro :</p>
    <ul style="margin: 0 0 24px; padding-left: 20px;">
      ${featuresHtml}
    </ul>
    ${renderCTA("Continuer avec Pro", `${baseUrl}/tarifs`, "primary")}
    ${renderNote("Si vous ne souhaitez pas souscrire, votre compte passera automatiquement en plan Gratuit.")}
  `;

  return renderEmailBase(title, body);
}

// ─── STORY-155 : Newsletter welcome email ───────────────────────────────────

export function renderNewsletterWelcomeEmail(
  email: string,
  unsubscribeUrl: string
): string {
  const body = `
    ${renderHeading("Bienvenue dans la newsletter TrackMyCash !")}
    ${renderParagraph(`Merci de vous être inscrit(e) avec l'adresse <strong>${email}</strong>.`)}
    ${renderParagraph("Chaque semaine, vous recevrez nos meilleurs conseils pour gérer vos finances en couple : astuces budget, partage de dépenses, objectifs d'épargne et nouveautés produit.")}
    ${renderNote("Zéro spam, promis. Un seul email par semaine, que du contenu utile.")}
    <p style="margin: 24px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted};">
      Si vous souhaitez vous désabonner, <a href="${unsubscribeUrl}" style="color: ${EMAIL_COLORS.textSecondary};">cliquez ici pour le desabonnement</a>.
    </p>
  `;

  return renderEmailBase("Bienvenue dans la newsletter TrackMyCash", body);
}

export type { WeeklySummaryData };

export function renderWeeklyEmail(
  data: WeeklySummaryData & { coupleWeekly?: CoupleWeeklyData },
  userName: string,
  appUrl: string
): string {
  const fmt = currencyFormatter(data.currency);

  const weekLabel = `${new Date(data.weekStart + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} – ${new Date(data.weekEnd + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;

  const categoriesHtml =
    data.topCategories.length === 0
      ? `<p style="color: ${EMAIL_COLORS.textMuted}; font-style: italic;">Aucune dépense cette semaine</p>`
      : renderDataTable(
          [
            { header: "Catégorie" },
            { header: "Montant", align: "right" },
          ],
          data.topCategories.map((c) => [c.category, fmt(c.amount)]),
        );

  const budgetsHtml =
    data.budgetsOver.length === 0
      ? ""
      : `
    ${renderHeading("Budgets dépassés", 3)}
    ${renderDataTable(
      [{ header: "Catégorie" }, { header: "Dépensé / Limite", align: "right" }],
      data.budgetsOver.map((b) => [b.category, `${fmt(b.spent)} / ${fmt(b.limit)}`]),
    )}`;

  const goalsHtml =
    data.goalsProgress.length === 0
      ? ""
      : `
    ${renderHeading("Vos objectifs", 3)}
    ${renderDataTable(
      [{ header: "Objectif" }, { header: "Progrès", align: "right" }],
      data.goalsProgress.map((g) => [g.name, `${g.percent}%`]),
    )}`;

  const coupleHtml = data.coupleWeekly
    ? (() => {
        const cw = data.coupleWeekly!;
        const absBalance = Math.abs(cw.balance);
        const balanceLabel =
          cw.balance > 0
            ? `${cw.partnerName} partenaire vous doit ${fmt(absBalance)}`
            : cw.balance < 0
              ? `vous devez ${fmt(absBalance)} à ${cw.partnerName}`
              : "Balance à l'équilibre";
        return `
    <h3 style="margin: 0 0 12px; font-size: 16px; color: ${EMAIL_COLORS.couple};">Cette semaine en couple</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px; border: 1px solid #ede9fe; border-radius: 6px; overflow: hidden;">
      <tr>
        <td style="padding: 10px 12px; background: #f5f3ff; color: ${EMAIL_COLORS.textSecondary}; font-size: 14px;">${cw.transactionCount} transactions partagées</td>
        <td style="padding: 10px 12px; background: #f5f3ff; color: ${EMAIL_COLORS.couple}; font-weight: 700; font-size: 16px; text-align: right;">${fmt(cw.sharedExpenses)}</td>
      </tr>
      <tr>
        <td style="padding: 10px 12px; color: ${EMAIL_COLORS.textSecondary}; font-size: 14px;">Catégorie principale</td>
        <td style="padding: 10px 12px; color: ${EMAIL_COLORS.text}; font-size: 14px; text-align: right;">${cw.topSharedCategory}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 10px 12px; color: ${EMAIL_COLORS.textSecondary}; font-size: 14px;">${balanceLabel}</td>
      </tr>
    </table>`;
      })()
    : "";

  const greeting = userName ? `Bonjour ${userName},` : "Bonjour,";

  const body = `
    ${renderHeading("Récapitulatif hebdomadaire")}
    ${renderSubtitle(weekLabel)}
    <p style="margin: 0 0 20px; color: ${EMAIL_COLORS.textSecondary}; font-size: 14px;">${greeting}</p>

    ${renderSummaryTable([
      { label: "Revenus", value: fmt(data.totalIncome), valueColor: EMAIL_COLORS.income, highlight: true },
      { label: "Dépenses", value: fmt(data.totalExpenses), valueColor: EMAIL_COLORS.expense },
    ])}

    ${renderHeading("Top catégories", 3)}
    ${categoriesHtml}

    ${budgetsHtml}
    ${goalsHtml}
    ${coupleHtml}

    ${renderCTA("Voir mon tableau de bord", appUrl)}
    <p style="margin: 0; color: ${EMAIL_COLORS.textMuted}; font-size: 13px; line-height: 1.5;">
      Pour ne plus recevoir ces emails, rendez-vous dans vos <a href="${appUrl}/parametres" style="color: ${EMAIL_COLORS.textSecondary};">paramètres</a>.
    </p>
  `;

  return renderEmailBase(`Récapitulatif hebdomadaire — ${weekLabel}`, body);
}

// ─── STORY-104 : Emails de relance couple ─────────────────────────────────────

export function renderCoupleReminderEmail(
  inviteCode: string,
  days: 1 | 3 | 7
): string {
  const isUrgent = days === 1;
  const isWeek = days === 7;

  const headline = isUrgent
    ? "Votre partenaire n'a pas encore rejoint"
    : isWeek
      ? "Une semaine déjà — votre espace couple vous attend"
      : "Rappel — votre espace couple est prêt";

  const intro = isUrgent
    ? "Votre partenaire vous attend depuis hier sur TrackMyCash. Partagez le code ci-dessous pour commencer à gérer vos finances ensemble."
    : isWeek
      ? "Il y a une semaine, vous avez créé votre espace couple sur TrackMyCash. Votre partenaire n'a pas encore rejoint — c'est le bon moment pour lui envoyer le code."
      : "Votre espace couple est prêt sur TrackMyCash. Partagez le code d'invitation avec votre partenaire pour commencer à gérer vos finances en commun.";

  const body = `
    ${renderHeading(headline)}
    ${renderParagraph(intro)}

    <div style="background: ${EMAIL_COLORS.bgLight}; border-radius: 8px; padding: 24px; text-align: center; margin: 0 0 24px;">
      <p style="margin: 0 0 8px; font-size: 12px; color: ${EMAIL_COLORS.textMuted}; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Code d'invitation</p>
      <p style="margin: 0; font-size: 32px; font-weight: 800; color: ${EMAIL_COLORS.dark}; letter-spacing: 6px;">${inviteCode}</p>
      <p style="margin: 8px 0 0; font-size: 12px; color: ${EMAIL_COLORS.textMuted};">Partagez ce code avec votre partenaire</p>
    </div>

    ${renderParagraph("TrackMyCash vous permet de&nbsp;:")}
    <ul style="margin: 0 0 24px; padding-left: 20px; color: ${EMAIL_COLORS.textSecondary}; line-height: 1.8;">
      <li>Suivre les dépenses partagées du couple</li>
      <li>Calculer automatiquement qui doit quoi</li>
      <li>Définir des budgets et objectifs communs</li>
    </ul>

    ${renderNote("Si votre partenaire n'a pas encore de compte, il peut s'inscrire gratuitement sur TrackMyCash.")}
  `;

  return renderEmailBase("Votre partenaire vous attend sur TrackMyCash", body);
}
