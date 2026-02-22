export interface Anomaly {
  transactionId: number;
  description: string;
  amount: number;
  category: string;
  historicalAvg: number;
  ratio: number;
}

export interface AnomalyDetectorOptions {
  threshold?: number;
  minAmount?: number;
}

/**
 * Détecte les dépenses anormalement élevées par rapport à la moyenne historique.
 * Logique pure, sans effets de bord — testable sans mock.
 */
export function detectAnomalies(
  newTransactions: {
    id: number;
    description: string;
    amount: number;
    category: string;
    type: "income" | "expense";
  }[],
  avgByCategory: Record<string, number>,
  options: AnomalyDetectorOptions = {}
): Anomaly[] {
  const { threshold = 2.0, minAmount = 50.0 } = options;

  return newTransactions
    .filter((tx) => tx.type === "expense")
    .filter((tx) => tx.amount >= minAmount)
    .filter((tx) => {
      const avg = avgByCategory[tx.category];
      if (!avg || avg === 0) return false;
      return tx.amount > avg * threshold;
    })
    .map((tx) => {
      const avg = avgByCategory[tx.category]!;
      return {
        transactionId: tx.id,
        description: tx.description,
        amount: tx.amount,
        category: tx.category,
        historicalAvg: avg,
        ratio: Math.round((tx.amount / avg) * 10) / 10,
      };
    });
}
