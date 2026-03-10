/**
 * POST /api/mobile/auth/2fa/verify — Vérifier un code TOTP ou backup code (STORY-141)
 * AC-2 : Vérifie le code TOTP après login avec 2FA
 * AC-5 : Supporte les backup codes
 */
import { signMobileToken, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { verifyTempToken, get2FARecord, verifyTOTPCode, verifyAndConsumeBackupCode } from "@/lib/mobile-2fa";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function POST(req: Request) {
  try {
    const { tempToken, code, backupCode } = (await req.json()) as {
      tempToken?: string;
      code?: string;
      backupCode?: string;
    };

    if (!tempToken) {
      return jsonError(400, "tempToken requis");
    }

    if (!code && !backupCode) {
      return jsonError(400, "Code TOTP ou code de récupération requis");
    }

    // Vérifier le tempToken (JWT 5min)
    let userId: string;
    let email: string;
    try {
      const payload = await verifyTempToken(tempToken);
      userId = payload.userId;
      email = payload.email;
    } catch {
      return jsonError(401, "Token temporaire invalide ou expiré");
    }

    // Backup code flow
    if (backupCode) {
      const valid = await verifyAndConsumeBackupCode(userId, backupCode);
      if (!valid) {
        return jsonError(401, "Code de récupération invalide");
      }
      const token = await signMobileToken(userId, email);
      return jsonOk({ user: { id: userId, email, name: null }, token });
    }

    // TOTP code flow
    const record = await get2FARecord(userId);
    if (!record) {
      return jsonError(400, "2FA non configuré");
    }

    const valid = await verifyTOTPCode(record.secret, code!);
    if (!valid) {
      return jsonError(401, "Code invalide");
    }

    const token = await signMobileToken(userId, email);
    return jsonOk({ user: { id: userId, email, name: null }, token });
  } catch {
    return jsonError(500, "Erreur interne du serveur");
  }
}
