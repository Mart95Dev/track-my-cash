/**
 * GET /api/mobile/anomalies — Detection d'anomalies de depenses (STORY-146)
 * AC-1 : Retourne les anomalies significatives (score >= 2.0, montant >= 50)
 * AC-2 : Filtre optionnel par account_id
 */
import { getMobileUserId, jsonOk, jsonError, handleCors } from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import { detectAnomalies } from "@/lib/anomaly-detector";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

export async function GET(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const url = new URL(req.url);
    const months = Number(url.searchParams.get("months") ?? 3);
    const accountId = url.searchParams.get("account_id");

    // Calculer la date de debut
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    const startDateStr = startDate.toISOString().split("T")[0];

    // Recuperer les transactions recentes
    const accountFilter = accountId ? " AND account_id = ?" : "";
    const txArgs: (string | number)[] = [startDateStr];
    if (accountId) txArgs.push(Number(accountId));

    const txResult = await db.execute({
      sql: `SELECT id, description, amount, category, type, date
            FROM transactions
            WHERE date >= ?${accountFilter}
            ORDER BY date DESC`,
      args: txArgs,
    });

    const transactions = txResult.rows.map((row) => ({
      id: Number(row.id),
      description: String(row.description),
      amount: Number(row.amount),
      category: String(row.category),
      type: String(row.type) as "income" | "expense",
      date: String(row.date),
    }));

    // Calculer les moyennes historiques par categorie
    const avgArgs: (string | number)[] = [startDateStr];
    if (accountId) avgArgs.push(Number(accountId));

    const avgResult = await db.execute({
      sql: `SELECT category, AVG(amount) as avg_amount
            FROM transactions
            WHERE type = 'expense' AND date < ?${accountFilter ? " AND account_id = ?" : ""}
            GROUP BY category`,
      args: avgArgs,
    });

    const avgByCategory: Record<string, number> = {};
    for (const row of avgResult.rows) {
      avgByCategory[String(row.category)] = Number(row.avg_amount);
    }

    // Detecter les anomalies
    const anomalies = detectAnomalies(transactions, avgByCategory);

    return jsonOk({ anomalies });
  } catch (err) {
    if (err instanceof Response) throw err;
    return jsonError(500, "Erreur interne du serveur");
  }
}
