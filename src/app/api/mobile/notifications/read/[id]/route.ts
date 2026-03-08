/**
 * POST /api/mobile/notifications/read/[id] — Marquer une notification comme lue
 * STORY-062
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { markNotificationRead } from "@/lib/queries/notification-queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);
    const { id } = await params;

    await markNotificationRead(db, Number(id));
    return jsonOk({ id: Number(id), message: "Notification marquée comme lue" });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
