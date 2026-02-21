import { renderEmailBase } from "@/lib/email";

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
