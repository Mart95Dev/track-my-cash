/**
 * GET    /api/mobile/accounts/[id] — Détail d'un compte
 * PUT    /api/mobile/accounts/[id] — Mise à jour
 * DELETE /api/mobile/accounts/[id] — Suppression
 * STORY-058
 */
import { getMobileUserId, jsonOk, jsonError, handleCors, jsonNoContent } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { getAccountById, updateAccount, deleteAccount } from "@/lib/queries/account-queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);
    const { id } = await params;
    const account = await getAccountById(db, Number(id));

    if (!account) {
      return jsonError(404, "Compte introuvable");
    }

    return jsonOk(account);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);
    const { id } = await params;

    const existing = await getAccountById(db, Number(id));
    if (!existing) {
      return jsonError(404, "Compte introuvable");
    }

    const body = await req.json();
    const { name, initial_balance, balance_date, currency, alert_threshold } = body as {
      name?: string;
      initial_balance?: number;
      balance_date?: string;
      currency?: string;
      alert_threshold?: number | null;
    };

    if (!name || initial_balance === undefined || !balance_date || !currency) {
      return jsonError(400, "Champs requis : name, initial_balance, balance_date, currency");
    }

    await updateAccount(db, Number(id), name, initial_balance, balance_date, currency, alert_threshold ?? null);
    const updated = await getAccountById(db, Number(id));
    return jsonOk(updated);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);
    const { id } = await params;

    const existing = await getAccountById(db, Number(id));
    if (!existing) {
      return jsonError(404, "Compte introuvable");
    }

    await deleteAccount(db, Number(id));
    return jsonNoContent();
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
