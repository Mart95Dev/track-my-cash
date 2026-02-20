import type { Client } from "@libsql/client";

const CACHE_DURATION = 60 * 60 * 1000; // 1 heure

let cachedRate: { rate: number; fetchedAt: number } | null = null;

export async function getExchangeRate(db?: Client): Promise<number> {
  if (cachedRate && Date.now() - cachedRate.fetchedAt < CACHE_DURATION) {
    return cachedRate.rate;
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR", {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    const rate = data.rates?.MGA;

    if (typeof rate === "number" && rate > 0) {
      cachedRate = { rate, fetchedAt: Date.now() };
      return rate;
    }

    throw new Error("Taux MGA non trouvé");
  } catch {
    // Fallback : taux stocké en paramètres ou valeur par défaut
    if (db) {
      const { getSetting } = await import("@/lib/queries");
      const stored = await getSetting(db, "exchange_rate_eur_mga");
      return stored ? parseFloat(stored) : 5000;
    }
    return 5000;
  }
}
