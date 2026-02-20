import type { Client } from "@libsql/client";

// Currencies supportées dans l'app
export const SUPPORTED_CURRENCIES = ["EUR", "MGA", "USD", "GBP", "CHF", "CAD", "AUD", "JPY", "CNY"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number] | string;

// Devise de référence (toujours EUR)
export const REFERENCE_CURRENCY = "EUR";

// Cache en mémoire : rates[currency] = taux vers EUR
let _ratesCache: { rates: Record<string, number>; fetchedAt: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1h

/**
 * Récupère tous les taux de change depuis l'API open.er-api.com
 * Retourne un objet { MGA: 5000, USD: 1.08, ... } (1 EUR = X devise)
 */
export async function getAllRates(db?: Client): Promise<Record<string, number>> {
  if (_ratesCache && Date.now() - _ratesCache.fetchedAt < CACHE_DURATION) {
    return _ratesCache.rates;
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR", {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json() as { rates?: Record<string, number> };
    const rates = data.rates ?? {};

    if (Object.keys(rates).length > 0) {
      _ratesCache = { rates, fetchedAt: Date.now() };
      return rates;
    }

    throw new Error("Taux non trouvés");
  } catch {
    // Fallback : taux stockés en settings ou valeurs par défaut
    const fallback: Record<string, number> = {
      EUR: 1,
      MGA: 5000,
      USD: 1.08,
      GBP: 0.86,
      CHF: 0.96,
      CAD: 1.46,
      AUD: 1.65,
      JPY: 161,
      CNY: 7.8,
    };

    if (db) {
      try {
        const { getSetting } = await import("@/lib/queries");
        const stored = await getSetting(db, "exchange_rate_eur_mga");
        if (stored) fallback.MGA = parseFloat(stored);
      } catch { /* ignore */ }
    }

    return fallback;
  }
}

/**
 * Retourne le taux de change EUR→MGA (backward compat)
 */
export async function getExchangeRate(db?: Client): Promise<number> {
  const rates = await getAllRates(db);
  return rates.MGA ?? 5000;
}

/**
 * Convertit un montant depuis une devise vers EUR (devise de référence)
 * rates = résultat de getAllRates() : 1 EUR = rates[currency]
 */
export function convertToReference(amount: number, currency: string, rates: Record<string, number>): number {
  if (currency === REFERENCE_CURRENCY) return amount;
  const rate = rates[currency];
  if (!rate || rate === 0) return amount; // fallback : pas de conversion
  return amount / rate;
}

/**
 * Convertit un montant EUR vers une autre devise
 */
export function convertFromReference(amount: number, currency: string, rates: Record<string, number>): number {
  if (currency === REFERENCE_CURRENCY) return amount;
  const rate = rates[currency];
  if (!rate || rate === 0) return amount;
  return amount * rate;
}
