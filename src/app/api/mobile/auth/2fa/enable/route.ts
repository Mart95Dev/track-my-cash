/**
 * POST /api/mobile/auth/2fa/enable — Activer le 2FA TOTP (STORY-141)
 * AC-3 : Génère QR + backup codes, puis confirme avec un code TOTP
 *
 * Deux étapes :
 * 1. POST sans body.code → retourne { totpURI, backupCodes, qrDataUrl }
 * 2. POST avec body.code → confirme l'activation
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { initiate2FASetup, confirm2FAEnable, get2FARecord, verifyTOTPCode } from "@/lib/mobile-2fa";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);

    const body = (await req.json().catch(() => ({}))) as { code?: string };

    if (body.code) {
      // Étape 2 : Confirmer l'activation avec le premier code TOTP
      const record = await get2FARecord(userId);
      if (!record) {
        return jsonError(400, "Aucune configuration 2FA en attente. Appelez d'abord sans code.");
      }

      const valid = await verifyTOTPCode(record.secret, body.code);
      if (!valid) {
        return jsonError(401, "Code invalide");
      }

      await confirm2FAEnable(userId);
      return jsonOk({ enabled: true });
    }

    // Étape 1 : Générer le secret + QR + backup codes
    const db = getDb();
    const userResult = await db.execute({
      sql: "SELECT email FROM user WHERE id = ?",
      args: [userId],
    });

    if (userResult.rows.length === 0) {
      return jsonError(404, "Utilisateur non trouvé");
    }

    const email = String(userResult.rows[0].email);
    const { totpURI, backupCodes } = await initiate2FASetup(userId, email);

    // Le QR code doit etre genere cote client (pas via un service tiers pour eviter de fuiter le secret)
    return jsonOk({ totpURI, backupCodes });
  } catch (err) {
    if (err instanceof Response) throw err;
    return jsonError(500, "Erreur interne du serveur");
  }
}
