"use server";

import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { renderNewsletterWelcomeEmail } from "@/lib/email-templates";
import { generateUnsubscribeUrl } from "@/lib/newsletter-utils";

type ActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeNewsletterAction(
  formData: FormData
): Promise<ActionResult> {
  // Honeypot check — bots fill hidden fields
  const honeypot = formData.get("website");
  if (honeypot && String(honeypot).trim() !== "") {
    return { success: true, message: "Merci pour votre inscription !" };
  }

  const rawEmail = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
    return { success: false, error: "Veuillez entrer une adresse email valide." };
  }

  const db = getDb();

  // Check for existing subscriber
  const existing = await db.execute({
    sql: "SELECT id, status FROM newsletter_subscribers WHERE email = ?",
    args: [rawEmail],
  });

  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    if (row.status === "unsubscribed") {
      // Re-subscribe
      await db.execute({
        sql: "UPDATE newsletter_subscribers SET status = 'active', unsubscribed_at = NULL WHERE id = ?",
        args: [row.id],
      });
      return { success: true, message: "Vous êtes de nouveau inscrit(e) à la newsletter !" };
    }
    return { success: true, message: "Vous êtes déjà inscrit(e) à la newsletter !" };
  }

  // Insert new subscriber
  await db.execute({
    sql: "INSERT INTO newsletter_subscribers (email, status) VALUES (?, 'active')",
    args: [rawEmail],
  });

  // Send welcome email (non-blocking — don't fail if email fails)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trackmycash.com";
  const unsubscribeUrl = generateUnsubscribeUrl(rawEmail, baseUrl);
  const html = renderNewsletterWelcomeEmail(rawEmail, unsubscribeUrl);

  await sendEmail({
    to: rawEmail,
    subject: "Bienvenue dans la newsletter TrackMyCash !",
    html,
  });

  return { success: true, message: "Merci pour votre inscription !" };
}
