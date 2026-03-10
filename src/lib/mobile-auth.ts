/**
 * Mobile Auth — JWT middleware + response helpers
 * STORY-057 — Sprint v10
 *
 * Gère l'authentification JWT pour les routes /api/mobile/*
 * Séparé de l'auth Better-Auth (cookies/session) utilisée par le web.
 */
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// ── JWT Config ──────────────────────────────────────────────────────────────

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET_MOBILE;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET_MOBILE is required in production");
  }
  return new TextEncoder().encode(secret ?? "dev-only-mobile-secret-not-for-prod");
}

const JWT_ISSUER = "track-my-cash-mobile";
const JWT_EXPIRY = "7d";

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
    .sign(getJwtSecret());
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
    const { payload } = await jwtVerify(token, getJwtSecret(), {
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

// ── CORS ────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.BETTER_AUTH_URL,
  "capacitor://localhost",
  "http://localhost",
  "http://localhost:8081",
  "http://localhost:19006",
].filter(Boolean) as string[];

function getCorsHeaders(origin?: string | null): Record<string, string> {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o))
      ? origin
      : ALLOWED_ORIGINS[0] ?? "";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Platform, X-App-Version",
    "Vary": "Origin",
  };
}

// ── Response Helpers ────────────────────────────────────────────────────────

export function jsonOk<T>(data: T, status = 200, origin?: string | null): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...getCorsHeaders(origin) },
  });
}

export function jsonCreated<T>(data: T, origin?: string | null): Response {
  return jsonOk(data, 201, origin);
}

export function jsonError(status: number, message: string, origin?: string | null): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...getCorsHeaders(origin) },
  });
}

export function jsonNoContent(origin?: string | null): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

/**
 * Handler OPTIONS pour le CORS preflight
 */
export function handleCors(origin?: string | null): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
