/**
 * POST /api/mobile/auth/2fa/disable — Désactiver le 2FA (STORY-141)
 * AC-4 : Vérifie le code TOTP avant désactivation
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { get2FARecord, verifyTOTPCode, disable2FA } from "@/lib/mobile-2fa";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);

    const { code } = (await req.json()) as { code?: string };

    if (!code) {
      return jsonError(400, "Code TOTP requis");
    }

    const record = await get2FARecord(userId);
    if (!record) {
      return jsonError(400, "2FA non activé");
    }

    const valid = await verifyTOTPCode(record.secret, code);
    if (!valid) {
      return jsonError(401, "Code invalide");
    }

    await disable2FA(userId);
    return jsonOk({ disabled: true });
  } catch (err) {
    if (err instanceof Response) throw err;
    return jsonError(500, "Erreur interne du serveur");
  }
}
