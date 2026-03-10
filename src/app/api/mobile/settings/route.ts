/**
 * GET/PUT /api/mobile/settings — Settings utilisateur (STORY-145)
 * AC-1 : GET retourne toutes les paires cle/valeur
 * AC-2 : PUT upsert une valeur
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { getAllSettings, setSetting } from "@/lib/queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);
    const settingsList = await getAllSettings(db);

    const settings: Record<string, string> = {};
    for (const s of settingsList) {
      settings[s.key] = s.value;
    }

    return jsonOk({ settings });
  } catch (err) {
    if (err instanceof Response) throw err;
    return jsonError(500, "Erreur interne du serveur");
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const { key, value } = (await req.json()) as { key?: string; value?: string };

    if (!key || value === undefined) {
      return jsonError(400, "Clé et valeur requises");
    }

    await setSetting(db, key, value);
    return jsonOk({ success: true });
  } catch (err) {
    if (err instanceof Response) throw err;
    return jsonError(500, "Erreur interne du serveur");
  }
}
