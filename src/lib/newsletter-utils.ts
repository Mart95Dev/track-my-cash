import { createHmac, timingSafeEqual } from "crypto";

const getSecret = () => process.env.NEWSLETTER_SECRET ?? "default-newsletter-secret";

/**
 * Génère un token HMAC-SHA256 pour un email donné.
 */
function computeToken(email: string): string {
  return createHmac("sha256", getSecret()).update(email).digest("hex");
}

/**
 * Génère une URL de désabonnement signée par HMAC.
 */
export function generateUnsubscribeUrl(email: string, baseUrl: string): string {
  const token = computeToken(email);
  const params = new URLSearchParams({ email, token });
  return `${baseUrl}/api/newsletter/unsubscribe?${params.toString()}`;
}

/**
 * Vérifie qu'un token HMAC correspond à l'email donné.
 * Utilise timingSafeEqual pour éviter les timing attacks.
 */
export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!token) return false;
  const expected = computeToken(email);
  if (expected.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}
