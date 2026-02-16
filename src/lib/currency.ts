const CACHE_DURATION = 60 * 60 * 1000; // 1 heure

let cachedRate: { rate: number; fetchedAt: number } | null = null;

export async function getExchangeRate(): Promise<number> {
  // Retourner le cache si valide
  if (cachedRate && Date.now() - cachedRate.fetchedAt < CACHE_DURATION) {
    return cachedRate.rate;
  }

  try {
    const res = await fetch("https://api.frankfurter.dev/v1/latest?base=EUR&symbols=MGA", {
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
    // Fallback : taux stocké en base ou valeur par défaut
    const { getSetting } = await import("@/lib/queries");
    const stored = await getSetting("exchange_rate_eur_mga");
    return stored ? parseFloat(stored) : 5000;
  }
}
