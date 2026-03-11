import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/newsletter-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  if (!email || !token) {
    return new NextResponse("Paramètres manquants.", { status: 400 });
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return new NextResponse("Token invalide.", { status: 403 });
  }

  const db = getDb();

  const existing = await db.execute({
    sql: "SELECT id, status FROM newsletter_subscribers WHERE email = ?",
    args: [email],
  });

  if (existing.rows.length === 0) {
    return new NextResponse("Email non trouvé.", { status: 404 });
  }

  const row = existing.rows[0];

  // Idempotent: already unsubscribed → still show confirmation
  if (row.status !== "unsubscribed") {
    await db.execute({
      sql: "UPDATE newsletter_subscribers SET status = 'unsubscribed', unsubscribed_at = datetime('now') WHERE id = ?",
      args: [row.id],
    });
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Désinscription confirmée</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8f9fa; color: #333; }
    .card { background: white; border-radius: 12px; padding: 40px; max-width: 400px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    h1 { font-size: 20px; margin: 0 0 12px; }
    p { color: #666; line-height: 1.5; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Désinscription confirmée</h1>
    <p>Vous ne recevrez plus d'emails de la newsletter Koupli.</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
