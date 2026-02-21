import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  convertToReference,
  convertFromReference,
  REFERENCE_CURRENCY,
} from "@/lib/currency";

// STORY-003 — Dashboard : conversion multi-devises

const RATES: Record<string, number> = {
  EUR: 1,
  MGA: 5000,
  USD: 1.08,
  GBP: 0.86,
  CHF: 0.96,
};

describe("convertToReference", () => {
  it("AC-1 : EUR → EUR reste identique", () => {
    expect(convertToReference(100, "EUR", RATES)).toBe(100);
  });

  it("AC-2 : MGA → EUR : 5000 MGA = 1 EUR", () => {
    const result = convertToReference(5000, "MGA", RATES);
    expect(result).toBeCloseTo(1, 5);
  });

  it("AC-3 : USD → EUR : 108 USD ≈ 100 EUR", () => {
    const result = convertToReference(108, "USD", RATES);
    expect(result).toBeCloseTo(100, 1);
  });

  it("AC-4 : GBP → EUR : 86 GBP ≈ 100 EUR", () => {
    const result = convertToReference(86, "GBP", RATES);
    expect(result).toBeCloseTo(100, 1);
  });

  it("AC-5 : devise inconnue → retourne montant tel quel (fallback)", () => {
    expect(convertToReference(100, "XYZ", RATES)).toBe(100);
  });

  it("AC-6 : taux zéro → retourne montant tel quel (protection division par zéro)", () => {
    const ratesWithZero = { ...RATES, BAD: 0 };
    expect(convertToReference(100, "BAD", ratesWithZero)).toBe(100);
  });

  it("AC-7 : montant zéro reste zéro", () => {
    expect(convertToReference(0, "MGA", RATES)).toBe(0);
  });

  it("AC-8 : devise de référence exposée comme EUR", () => {
    expect(REFERENCE_CURRENCY).toBe("EUR");
  });
});

describe("convertFromReference", () => {
  it("AC-9 : EUR → EUR reste identique", () => {
    expect(convertFromReference(100, "EUR", RATES)).toBe(100);
  });

  it("AC-10 : EUR → MGA : 1 EUR = 5000 MGA", () => {
    const result = convertFromReference(1, "MGA", RATES);
    expect(result).toBeCloseTo(5000, 2);
  });

  it("AC-11 : EUR → USD : 100 EUR = 108 USD", () => {
    const result = convertFromReference(100, "USD", RATES);
    expect(result).toBeCloseTo(108, 1);
  });

  it("AC-12 : devise inconnue → retourne montant tel quel (fallback)", () => {
    expect(convertFromReference(100, "XYZ", RATES)).toBe(100);
  });
});

// ============ getAllRates ============

describe("getAllRates", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("AC-13 : retourne les taux depuis l'API quand le fetch réussit", async () => {
    const mockRates = { EUR: 1, MGA: 5000, USD: 1.08 };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ rates: mockRates }),
      })
    );
    const { getAllRates } = await import("@/lib/currency");
    const rates = await getAllRates();
    expect(rates.EUR).toBe(1);
    expect(rates.MGA).toBe(5000);
  });

  it("AC-14 : retourne les taux de fallback quand l'API échoue", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error"))
    );
    const { getAllRates } = await import("@/lib/currency");
    const rates = await getAllRates();
    // Fallback toujours défini
    expect(rates.EUR).toBe(1);
    expect(rates.MGA).toBe(5000);
    expect(rates.USD).toBeDefined();
  });

  it("AC-15 : retourne fallback si l'API renvoie des taux vides", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ rates: {} }),
      })
    );
    const { getAllRates } = await import("@/lib/currency");
    const rates = await getAllRates();
    // Fallback
    expect(rates.EUR).toBe(1);
  });

  it("AC-16 : getExchangeRate retourne le taux MGA", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ rates: { EUR: 1, MGA: 4800 } }),
      })
    );
    const { getExchangeRate } = await import("@/lib/currency");
    const rate = await getExchangeRate();
    expect(rate).toBe(4800);
  });
});
