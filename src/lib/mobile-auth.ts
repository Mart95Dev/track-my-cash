/**
 * Mobile Auth — JWT middleware + response helpers
 * STORY-057 — Sprint v10
 *
 * Gère l'authentification JWT pour les routes /api/mobile/*
 * Séparé de l'auth Better-Auth (cookies/session) utilisée par le web.
 */
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// ── JWT Config ──────────────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-in-production-32c"
);
const JWT_ISSUER = "track-my-cash";
const JWT_EXPIRY = "30d";

interface MobileJwtPayload extends JWTPayload {
  sub: string; // userId
  email: string;
}

// ── JWT Signing ─────────────────────────────────────────────────────────────

export async function signMobileToken(
  userId: string,
  email: string
): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

// ── JWT Validation ──────────────────────────────────────────────────────────

/**
 * Extrait et valide le JWT du header Authorization: Bearer <token>
 * @returns userId (string)
 * @throws Response 401 si le token est absent, invalide ou expiré
 */
export async function getMobileUserId(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw jsonError(401, "Non autorisé");
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    });

    const typedPayload = payload as MobileJwtPayload;

    if (!typedPayload.sub) {
      throw jsonError(401, "Token invalide");
    }

    return typedPayload.sub;
  } catch (err) {
    if (err instanceof Response) throw err;
    throw jsonError(401, "Token invalide ou expiré");
  }
}

// ── Response Helpers ────────────────────────────────────────────────────────

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export function jsonOk<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export function jsonCreated<T>(data: T): Response {
  return jsonOk(data, 201);
}

export function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export function jsonNoContent(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Handler OPTIONS pour le CORS preflight
 */
export function handleCors(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
