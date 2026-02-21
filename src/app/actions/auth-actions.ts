"use server";

import { sendEmail } from "@/lib/email";
import { renderWelcomeEmail } from "@/lib/email-templates";

export async function sendWelcomeEmailAction(userEmail: string): Promise<void> {
  // Fire-and-forget : l'échec de l'email ne bloque pas l'inscription
  const appUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

  try {
    await sendEmail({
      to: userEmail,
      subject: "Bienvenue sur TrackMyCash !",
      html: renderWelcomeEmail(userEmail, appUrl),
      replyTo: process.env.EMAIL_REPLY_TO ?? process.env.EMAIL_USER,
    });
  } catch {
    console.error("[welcome-email] Erreur silencieuse lors de l'envoi de l'email de bienvenue");
  }
}
