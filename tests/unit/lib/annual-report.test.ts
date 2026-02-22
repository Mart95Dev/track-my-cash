import { describe, it, expect, vi } from "vitest";
import type { Client } from "@libsql/client";
import { computeAnnualReport } from "@/lib/annual-report";

// 12 mois de données
const make12Months = () =>
  Array.from({ length: 12 }, (_, i) => ({
    month: `2025-${String(i + 1).padStart(2, "0")}`,
    income: 3000,
    expenses: i === 11 ? 5000 : 2000, // décembre = pire mois
  }));

const make12Rows = () =>
  make12Months().map((m) => ({
    month: m.month,
    income: m.income,
    expenses: m.expenses,
  }));

function createMockDb(monthlyRows: unknown[], categoryRows: unknown[] = []): Client {
  let call = 0;
  const execute = vi.fn().mockImplementation(() => {
    const rows = call === 0 ? monthlyRows : categoryRows;
    call++;
    return Promise.resolve({ rows });
  });
  return { execute } as unknown as Client;
}

describe("computeAnnualReport — STORY-046", () => {
  it("TU-1-1 : 12 mois de données → monthlyData.length = 12, totalIncome correct", async () => {
    const db = createMockDb(make12Rows(), [
      { category: "Logement", total: 12000 },
      { category: "Alimentation", total: 8000 },
    ]);

    const result = await computeAnnualReport(db, 1, 2025);
    expect(result.monthlyData).toHaveLength(12);
    expect(result.totalIncome).toBe(12 * 3000); // 36000
    expect(result.topExpenseCategories.length).toBeLessThanOrEqual(5);
  });

  it("TU-1-2 : 0 transactions → monthlyData = [], totalIncome = 0", async () => {
    const db = createMockDb([], []);
    const result = await computeAnnualReport(db, 1, 2024);
    expect(result.monthlyData).toHaveLength(0);
    expect(result.totalIncome).toBe(0);
    expect(result.bestMonth).toBeNull();
    expect(result.worstMonth).toBeNull();
  });

  it("TU-1-3 : 6 mois de données → monthlyData.length = 6, taux d'épargne calculé", async () => {
    const rows6 = Array.from({ length: 6 }, (_, i) => ({
      month: `2025-${String(i + 1).padStart(2, "0")}`,
      income: 3000,
      expenses: 2000,
    }));
    const db = createMockDb(rows6, []);
    const result = await computeAnnualReport(db, 1, 2025);
    expect(result.monthlyData).toHaveLength(6);
    // net mensuel = 1000, taux = 1000/3000 = 33.3%
    expect(result.annualSavingsRate).toBeCloseTo(33.33, 1);
  });

  it("TU-1-4 : bestMonth = mois avec le meilleur net (revenus - dépenses)", async () => {
    const rows = [
      { month: "2025-06", income: 4000, expenses: 1000 }, // net = 3000 → best
      { month: "2025-07", income: 3000, expenses: 2500 }, // net = 500
    ];
    const db = createMockDb(rows, []);
    const result = await computeAnnualReport(db, 1, 2025);
    expect(result.bestMonth?.month).toBe("2025-06");
    expect(result.bestMonth?.net).toBe(3000);
  });

  it("TU-1-5 : worstMonth = mois avec les dépenses les plus élevées", async () => {
    const rows = make12Rows(); // décembre = expenses 5000
    const db = createMockDb(rows, []);
    const result = await computeAnnualReport(db, 1, 2025);
    expect(result.worstMonth?.month).toBe("2025-12");
    expect(result.worstMonth?.expenses).toBe(5000);
  });

  it("TU-1-6 : topExpenseCategories trié par montant décroissant", async () => {
    const catRows = [
      { category: "Logement", total: 8400 },
      { category: "Alimentation", total: 3600 },
      { category: "Transport", total: 2800 },
    ];
    const db = createMockDb(make12Rows(), catRows);
    const result = await computeAnnualReport(db, 1, 2025);
    expect(result.topExpenseCategories[0]!.category).toBe("Logement");
    expect(result.topExpenseCategories[0]!.total).toBe(8400);
    // Vérifier que les pourcentages sont calculés
    expect(result.topExpenseCategories[0]!.percentage).toBeGreaterThan(0);
  });
});
