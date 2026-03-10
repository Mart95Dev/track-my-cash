/**
 * Mobile 2FA — TOTP helpers (STORY-141)
 * Gère le 2FA pour les routes mobile sans dépendre des cookies Better-Auth.
 * Utilise directement la DB + crypto de Better-Auth.
 */
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { createOTP } from "@better-auth/utils/otp";
import { randomBytes } from "node:crypto";
import { getDb } from "./db";

// ── Constantes ──────────────────────────────────────────────────────────────

const AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-in-production-32c";
const JWT_SECRET = new TextEncoder().encode(AUTH_SECRET);
const JWT_ISSUER = "track-my-cash";
const TEMP_TOKEN_EXPIRY = "5m";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

// ── Types ───────────────────────────────────────────────────────────────────

interface TempTokenPayload extends JWTPayload {
  sub: string;
  email: string;
  purpose: "2fa-verify";
}

interface TwoFactorRecord {
  id: string;
  userId: string;
  secret: string;
  backupCodes: string;
  enabled: number | boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function randomBase32(length: number): string {
  const bytes = randomBytes(length);
  return Array.from(bytes)
    .map((b) => BASE32_ALPHABET[b % BASE32_ALPHABET.length])
    .join("");
}

function randomAlphanumeric(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = randomBytes(length);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

function randomId(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(length);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

// ── Temp Token (JWT court 5min pour le flux 2FA) ────────────────────────────

export async function signTempToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ email, purpose: "2fa-verify" as const })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(JWT_ISSUER)
    .setIssuedAt()
    .setExpirationTime(TEMP_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyTempToken(token: string): Promise<{ userId: string; email: string }> {
  const { payload } = await jwtVerify(token, JWT_SECRET, { issuer: JWT_ISSUER });
  const typed = payload as TempTokenPayload;

  if (!typed.sub || typed.purpose !== "2fa-verify") {
    throw new Error("Invalid temp token");
  }

  return { userId: typed.sub, email: typed.email };
}

// ── DB queries ──────────────────────────────────────────────────────────────

export async function has2FAEnabled(userId: string): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT twoFactorEnabled FROM user WHERE id = ?",
    args: [userId],
  });
  if (result.rows.length === 0) return false;
  const val = result.rows[0].twoFactorEnabled;
  return val === 1 || val === "1" || val === "true";
}

export async function get2FARecord(userId: string): Promise<TwoFactorRecord | null> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, userId, secret, backupCodes, enabled FROM twoFactor WHERE userId = ?",
    args: [userId],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: String(row.id),
    userId: String(row.userId),
    secret: String(row.secret),
    backupCodes: String(row.backupCodes),
    enabled: row.enabled as number | boolean,
  };
}

// ── Crypto ───────────────────────────────────────────────────────────────────

/**
 * Déchiffre le secret TOTP stocké en DB (chiffré par Better-Auth avec BETTER_AUTH_SECRET)
 */
async function decryptSecret(encryptedSecret: string): Promise<string> {
  const { symmetricDecrypt } = await import("better-auth/crypto");
  return symmetricDecrypt({ key: AUTH_SECRET, data: encryptedSecret });
}

/**
 * Vérifie un code TOTP contre le secret stocké en DB
 */
export async function verifyTOTPCode(encryptedSecret: string, code: string): Promise<boolean> {
  const secret = await decryptSecret(encryptedSecret);
  const otp = createOTP(secret, { digits: 6, period: 30 });
  return otp.verify(code, { window: 1 });
}

// ── Backup codes ────────────────────────────────────────────────────────────

/**
 * Vérifie un backup code et le marque comme utilisé
 */
export async function verifyAndConsumeBackupCode(
  userId: string,
  backupCode: string
): Promise<boolean> {
  const record = await get2FARecord(userId);
  if (!record) return false;

  let codes: string[];
  try {
    const decrypted = await decryptSecret(record.backupCodes);
    codes = JSON.parse(decrypted) as string[];
  } catch {
    return false;
  }

  const normalizedInput = backupCode.trim().toUpperCase();
  const index = codes.findIndex(
    (c) => c.trim().toUpperCase() === normalizedInput
  );

  if (index === -1) return false;

  // Supprimer le code utilisé
  codes.splice(index, 1);

  // Re-chiffrer et sauvegarder
  const { symmetricEncrypt } = await import("better-auth/crypto");
  const encrypted = await symmetricEncrypt({ key: AUTH_SECRET, data: JSON.stringify(codes) });

  const db = getDb();
  await db.execute({
    sql: "UPDATE twoFactor SET backupCodes = ? WHERE userId = ?",
    args: [encrypted, userId],
  });

  return true;
}

// ── Enable 2FA ──────────────────────────────────────────────────────────────

/**
 * Génère un nouveau secret TOTP et des backup codes pour un utilisateur.
 * Ne l'active PAS encore — il faut confirmer avec verifyTOTPCode.
 */
export async function initiate2FASetup(
  userId: string,
  email: string
): Promise<{ totpURI: string; backupCodes: string[]; secret: string }> {
  const { symmetricEncrypt } = await import("better-auth/crypto");

  // Générer un secret aléatoire de 20 caractères en base32
  const secret = randomBase32(20);

  const otp = createOTP(secret, { digits: 6, period: 30 });
  const totpURI = otp.url("Track My Cash", email);

  // Générer 8 backup codes (format XXXX-XXXX)
  const backupCodes: string[] = [];
  for (let i = 0; i < 8; i++) {
    backupCodes.push(`${randomAlphanumeric(4)}-${randomAlphanumeric(4)}`);
  }

  // Chiffrer et stocker
  const encryptedSecret = await symmetricEncrypt({ key: AUTH_SECRET, data: secret });
  const encryptedBackupCodes = await symmetricEncrypt({
    key: AUTH_SECRET,
    data: JSON.stringify(backupCodes),
  });

  const db = getDb();

  // Upsert dans la table twoFactor
  const existing = await get2FARecord(userId);
  if (existing) {
    await db.execute({
      sql: "UPDATE twoFactor SET secret = ?, backupCodes = ?, enabled = 0 WHERE userId = ?",
      args: [encryptedSecret, encryptedBackupCodes, userId],
    });
  } else {
    const id = randomId(32);
    await db.execute({
      sql: "INSERT INTO twoFactor (id, userId, secret, backupCodes, enabled) VALUES (?, ?, ?, ?, 0)",
      args: [id, userId, encryptedSecret, encryptedBackupCodes],
    });
  }

  return { totpURI, backupCodes, secret: encryptedSecret };
}

/**
 * Confirme l'activation du 2FA après vérification du premier code TOTP
 */
export async function confirm2FAEnable(userId: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "UPDATE twoFactor SET enabled = 1 WHERE userId = ?",
    args: [userId],
  });
  await db.execute({
    sql: "UPDATE user SET twoFactorEnabled = 1 WHERE id = ?",
    args: [userId],
  });
}

/**
 * Désactive le 2FA pour un utilisateur
 */
export async function disable2FA(userId: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "DELETE FROM twoFactor WHERE userId = ?",
    args: [userId],
  });
  await db.execute({
    sql: "UPDATE user SET twoFactorEnabled = 0 WHERE id = ?",
    args: [userId],
  });
}
