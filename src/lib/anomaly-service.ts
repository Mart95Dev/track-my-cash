import type { Client } from "@libsql/client";
import { createNotification } from "@/lib/queries";
import { detectAnomalies } from "@/lib/anomaly-detector";

interface NewTransaction {
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

export async function detectAndNotifyAnomalies(
  db: Client,
  accountId: number,
  newTransactions: NewTransaction[]
): Promise<void> {
  try {
    // Calculer les moyennes historiques par catégorie (avant cet import)
    const earliestDate = newTransactions
      .map((t) => t.date)
      .sort()[0];

    const cutoff = earliestDate ?? new Date().toISOString().split("T")[0]!;

    const avgResult = await db.execute({
      sql: `SELECT category, AVG(amount) as avg_amount
            FROM transactions
            WHERE account_id = ? AND type = 'expense' AND date < ?
            GROUP BY category`,
      args: [accountId, cutoff],
    });

    const avgByCategory: Record<string, number> = {};
    for (const row of avgResult.rows) {
      avgByCategory[String(row.category)] = Number(row.avg_amount);
    }

    // Préparer les nouvelles transactions pour la détection
    const txForDetection = newTransactions.map((t, idx) => ({
      id: idx,
      description: t.description,
      amount: t.amount,
      category: t.category,
      type: t.type,
    }));

    const anomalies = detectAnomalies(txForDetection, avgByCategory);

    // Créer une notification par anomalie (max 5 pour éviter le spam)
    const toNotify = anomalies.slice(0, 5);
    for (const anomaly of toNotify) {
      const message =
        `${anomaly.description} : ${anomaly.amount.toFixed(2)} € ` +
        `(${anomaly.ratio}x la moyenne habituelle de ${anomaly.historicalAvg.toFixed(2)} € ` +
        `pour la catégorie ${anomaly.category})`;

      await createNotification(db, "budget_exceeded", "Dépense anormale détectée", message);
    }
  } catch {
    // Erreur silencieuse — la détection d'anomalie ne bloque jamais l'import
  }
}
