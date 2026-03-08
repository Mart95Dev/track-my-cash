/**
 * POST /api/mobile/emails/weekly-recap — Récapitulatif hebdomadaire
 * STORY-063
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function POST(req: Request) {
  try {
    await getMobileUserId(req);

    // TODO: intégrer le service d'email
    return jsonOk({ success: true });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
