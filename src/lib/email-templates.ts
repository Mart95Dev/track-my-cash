import { renderEmailBase } from "@/lib/email";

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
