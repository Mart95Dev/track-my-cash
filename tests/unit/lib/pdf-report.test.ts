/**
 * TU-97-1 à TU-97-8 — STORY-097
 * Tests unitaires : generateMonthlyReport + validateMonthParam
 */
import { describe, it, expect } from "vitest";
import { generateMonthlyReport, validateMonthParam } from "@/lib/pdf-report";

const BASE_REPORT = {
  month: "2026-02",
  revenues: 3200,
  expenses: 1950,
  net: 1250,
  topCategories: [
    { category: "Courses", amount: 450, pct: 23 },
    { category: "Loyer", amount: 800, pct: 41 },
    { category: "Transports", amount: 120, pct: 6 },
  ],
  transactions: [
    { date: "2026-02-01", description: "Loyer février", category: "Loyer", amount: 800 },
    { date: "2026-02-05", description: "Carrefour", category: "Courses", amount: 85 },
  ],
};

// ─── generateMonthlyReport ────────────────────────────────────────────────────

describe("generateMonthlyReport (STORY-097)", () => {
  it("TU-97-1 : données valides → retourne Uint8Array non vide", () => {
    const buffer = generateMonthlyReport(BASE_REPORT);
    expect(buffer).toBeInstanceOf(Uint8Array);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("TU-97-2 : buffer commence par %PDF (signature PDF valide)", () => {
    const buffer = generateMonthlyReport(BASE_REPORT);
    const signature = String.fromCharCode(...buffer.slice(0, 4));
    expect(signature).toBe("%PDF");
  });

  it("TU-97-3 : données couple définies → pas d'erreur, buffer non null", () => {
    const buffer = generateMonthlyReport({
      ...BASE_REPORT,
      coupleData: {
        sharedExpenses: 345,
        balance: 25,
        partnerName: "Marie",
        topSharedCategory: "Courses",
      },
    });
    expect(buffer).not.toBeNull();
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("TU-97-4 : données couple undefined → pas d'erreur", () => {
    const buffer = generateMonthlyReport({ ...BASE_REPORT, coupleData: undefined });
    expect(buffer).toBeInstanceOf(Uint8Array);
    expect(buffer.length).toBeGreaterThan(0);
  });
});

// ─── validateMonthParam ──────────────────────────────────────────────────────

describe("validateMonthParam (STORY-097)", () => {
  it("TU-97-5 : '2026-01' → valide", () => {
    expect(validateMonthParam("2026-01")).toBe(true);
  });

  it("TU-97-6 : '2026-1' → invalide (mois sans zéro)", () => {
    expect(validateMonthParam("2026-1")).toBe(false);
  });

  it("TU-97-7 : '' → invalide", () => {
    expect(validateMonthParam("")).toBe(false);
  });

  it("TU-97-8 : '2026-13' → invalide (mois > 12)", () => {
    expect(validateMonthParam("2026-13")).toBe(false);
  });
});
