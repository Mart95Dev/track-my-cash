/**
 * GET /api/mobile/user/export — Export RGPD des donnees utilisateur (STORY-144)
 * AC-1 : Retourne un JSON avec toutes les donnees per-user
 */
import { getMobileUserId, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import {
  getAllAccounts,
  getTransactions,
  getRecurringPayments,
  getAllBudgets,
  getGoals,
  getAllSettings,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const [accounts, transactions, recurring, budgets, goals, settings] =
      await Promise.all([
        getAllAccounts(db),
        getTransactions(db),
        getRecurringPayments(db),
        getAllBudgets(db),
        getGoals(db),
        getAllSettings(db),
      ]);

    const payload = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      accounts,
      transactions,
      recurring,
      budgets,
      goals,
      settings,
    };

    const date = new Date().toISOString().split("T")[0];

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="track-my-cash-export-${date}.json"`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    if (err instanceof Response) throw err;
    return new Response(JSON.stringify({ error: "Erreur interne du serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
