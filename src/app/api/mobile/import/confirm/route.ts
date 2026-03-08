/**
 * POST /api/mobile/import/confirm — Confirmer un import bancaire
 * STORY-063
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { getSetting } from "@/lib/queries/settings-queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const body = await req.json();
    const { sessionId, accountId } = body as {
      sessionId?: string;
      accountId?: number;
    };

    if (!sessionId || !accountId) {
      return jsonError(400, "Champs requis : sessionId, accountId");
    }

    const sessionData = await getSetting(db, `import_session_${sessionId}`);
    if (!sessionData) {
      return jsonError(404, "Session d'import introuvable ou expirée");
    }

    // TODO: Implémenter la logique de confirmation réelle
    // (parser le fichier stocké, créer les transactions via bulkInsert)

    return jsonOk({
      imported: 0,
      duplicates: 0,
      message: "Import confirmé",
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
