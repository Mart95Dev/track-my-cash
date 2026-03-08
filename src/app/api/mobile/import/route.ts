/**
 * POST /api/mobile/import — Upload + prévisualisation import bancaire
 * STORY-063
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const body = await req.json();
    const { filename, content, accountId } = body as {
      filename?: string;
      content?: string;
      accountId?: number;
    };

    if (!filename || !content || !accountId) {
      return jsonError(400, "Champs requis : filename, content, accountId");
    }

    // Décoder le contenu (base64 → texte)
    let textContent: string;
    try {
      textContent = Buffer.from(content, "base64").toString("utf-8");
    } catch {
      textContent = content;
    }

    // Déterminer le format par extension
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";

    // Import simplifié — le parsing réel se fait côté mobile
    // Ici on génère un sessionId pour confirmation
    const sessionId = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Stocker temporairement en settings pour la confirmation
    const { setSetting } = await import("@/lib/queries/settings-queries");
    await setSetting(db, `import_session_${sessionId}`, JSON.stringify({
      filename,
      accountId,
      format: ext,
      contentLength: textContent.length,
      createdAt: new Date().toISOString(),
    }));

    return jsonOk({
      sessionId,
      filename,
      format: ext,
      preview: textContent.slice(0, 500),
      lineCount: textContent.split("\n").length,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
