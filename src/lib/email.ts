import nodemailer from "nodemailer";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

type SendEmailResult = {
  success: boolean;
  error?: string;
};

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT ?? 465),
    secure: Number(process.env.EMAIL_PORT ?? 465) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: SendEmailParams): Promise<SendEmailResult> {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.warn("[email] Variables EMAIL_* manquantes — email non envoyé");
    return { success: false, error: "Email non configuré" };
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    return { success: true };
  } catch (err) {
    console.error("[email] Erreur envoi :", err);
    return { success: false, error: String(err) };
  }
}

export function renderEmailBase(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #1a1a1a; padding: 24px 32px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px; }
    .footer { background-color: #f5f5f5; padding: 16px 32px; text-align: center; border-top: 1px solid #e0e0e0; }
    .footer p { margin: 0; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TrackMyCash</h1>
    </div>
    <div class="content">
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} TrackMyCash. Tous droits réservés.</p>
      <p style="margin-top: 4px;">Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
    </div>
  </div>
</body>
</html>`;
}
