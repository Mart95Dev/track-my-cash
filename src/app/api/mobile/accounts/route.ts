/**
 * GET  /api/mobile/accounts — Liste tous les comptes
 * POST /api/mobile/accounts — Crée un nouveau compte
 * STORY-058
 */
import { getMobileUserId, jsonOk, jsonCreated, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { getAllAccounts, createAccount } from "@/lib/queries/account-queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);
    const accounts = await getAllAccounts(db);
    return jsonOk(accounts);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const body = await req.json();
    const { name, initial_balance, balance_date, currency } = body as {
      name?: string;
      initial_balance?: number;
      balance_date?: string;
      currency?: string;
    };

    if (!name || initial_balance === undefined || !balance_date || !currency) {
      return jsonError(400, "Champs requis : name, initial_balance, balance_date, currency");
    }

    const account = await createAccount(db, name, initial_balance, balance_date, currency);
    return jsonCreated(account);
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
