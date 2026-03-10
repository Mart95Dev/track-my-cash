/**
 * GET/POST /api/mobile/categorization-rules — Regles de categorisation (STORY-145)
 * AC-3 : GET retourne les regles triees par priority DESC
 * AC-4 : POST cree une nouvelle regle
 */
import { getMobileUserId, jsonOk, jsonCreated, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { getCategorizationRules, createCategorizationRule } from "@/lib/queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);
    const rules = await getCategorizationRules(db);
    return jsonOk({ rules });
  } catch (err) {
    if (err instanceof Response) throw err;
    return jsonError(500, "Erreur interne du serveur");
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const { pattern, category, priority } = (await req.json()) as {
      pattern?: string;
      category?: string;
      priority?: number;
    };

    if (!pattern || !category) {
      return jsonError(400, "Pattern et catégorie requis");
    }

    const prio = priority ?? 0;
    await createCategorizationRule(db, pattern, category, prio);

    return jsonCreated({ pattern, category, priority: prio });
  } catch (err) {
    if (err instanceof Response) throw err;
    return jsonError(500, "Erreur interne du serveur");
  }
}
