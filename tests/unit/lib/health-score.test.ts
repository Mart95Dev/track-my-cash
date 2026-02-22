import { describe, it, expect } from "vitest";
import { computeHealthScore } from "@/lib/health-score";

const SUMMARIES_STABLE = [
  { income: 3000, expenses: 2000 },
  { income: 3100, expenses: 2100 },
  { income: 2900, expenses: 1900 },
];

const SUMMARIES_ZERO_SAVINGS = [
  { income: 2000, expenses: 2000 },
  { income: 1500, expenses: 1500 },
];

const BUDGETS_ALL_OK = [
  { category: "Alimentation", amount_limit: 400, spent: 300 },
  { category: "Loisirs", amount_limit: 200, spent: 150 },
];

const BUDGETS_ONE_EXCEEDED = [
  { category: "Alimentation", amount_limit: 400, spent: 300 },
  { category: "Loisirs", amount_limit: 200, spent: 250 },
];

const GOALS_PROGRESSING = [
  { target_amount: 1000, current_amount: 600 },
  { target_amount: 500, current_amount: 250 },
];

describe("computeHealthScore", () => {
  it("TU-47-1 : score nominal — revenus stables, budgets ok, objectifs 50%", () => {
    const result = computeHealthScore({
      monthlySummaries: SUMMARIES_STABLE,
      budgets: BUDGETS_ALL_OK,
      goals: GOALS_PROGRESSING,
    });
    expect(result.total).toBeGreaterThanOrEqual(70);
    expect(result.total).toBeLessThanOrEqual(100);
    expect(["Bon", "Excellent"]).toContain(result.label);
    // Sous-scores non nuls
    expect(result.savingsScore).toBeGreaterThan(0);
    expect(result.budgetsScore).toBeGreaterThan(0);
    expect(result.goalsScore).toBeGreaterThan(0);
    expect(result.stabilityScore).toBeGreaterThan(0);
  });

  it("TU-47-2 : aucun budget ni objectif → défauts 12.5 pts chacun", () => {
    const result = computeHealthScore({
      monthlySummaries: SUMMARIES_STABLE,
      budgets: [],
      goals: [],
    });
    expect(result.budgetsScore).toBe(12.5);
    expect(result.goalsScore).toBe(12.5);
  });

  it("TU-47-3 : taux d'épargne 0% → savingsScore = 0", () => {
    const result = computeHealthScore({
      monthlySummaries: SUMMARIES_ZERO_SAVINGS,
      budgets: [],
      goals: [],
    });
    expect(result.savingsScore).toBe(0);
  });

  it("TU-47-4 : taux d'épargne ≥ 20% → savingsScore = 25", () => {
    // (3000-2000)/3000 = 33% > 20%
    const result = computeHealthScore({
      monthlySummaries: [{ income: 3000, expenses: 2000 }],
      budgets: [],
      goals: [],
    });
    expect(result.savingsScore).toBe(25);
  });

  it("TU-47-5 : budget dépassé → budgetsScore < 25", () => {
    const result = computeHealthScore({
      monthlySummaries: SUMMARIES_STABLE,
      budgets: BUDGETS_ONE_EXCEEDED,
      goals: [],
    });
    expect(result.budgetsScore).toBeLessThan(25);
    // 1/2 budgets ok → 12.5
    expect(result.budgetsScore).toBeCloseTo(12.5, 1);
  });

  it("TU-47-6 : revenus très instables (CV > 0.5) → stabilityScore = 0", () => {
    const result = computeHealthScore({
      monthlySummaries: [
        { income: 5000, expenses: 1000 },
        { income: 100, expenses: 100 },
        { income: 3000, expenses: 1000 },
      ],
      budgets: [],
      goals: [],
    });
    expect(result.stabilityScore).toBe(0);
  });

  it("TU-47-7 : total = somme des 4 sous-scores (arrondie)", () => {
    const result = computeHealthScore({
      monthlySummaries: SUMMARIES_STABLE,
      budgets: BUDGETS_ALL_OK,
      goals: GOALS_PROGRESSING,
    });
    const expectedTotal = Math.round(
      result.savingsScore + result.budgetsScore + result.goalsScore + result.stabilityScore
    );
    // Le total peut différer légèrement à cause des arrondis intermédiaires
    expect(result.total).toBeCloseTo(expectedTotal, 0);
  });

  it("TU-47-8 : label 'Attention' si total < 40", () => {
    // Revenus = dépenses, budgets tous dépassés, pas d'objectifs, revenus instables
    const result = computeHealthScore({
      monthlySummaries: [
        { income: 5000, expenses: 5000 },
        { income: 100, expenses: 100 },
        { income: 3000, expenses: 3000 },
      ],
      budgets: [{ category: "X", amount_limit: 100, spent: 500 }],
      goals: [],
    });
    expect(result.label).toBe("Attention");
    expect(result.total).toBeLessThan(40);
  });

  it("TU-47-9 : objectif complété à 100% → goalsScore = 25", () => {
    const result = computeHealthScore({
      monthlySummaries: [{ income: 3000, expenses: 2000 }],
      budgets: [],
      goals: [{ target_amount: 1000, current_amount: 1000 }],
    });
    expect(result.goalsScore).toBe(25);
  });

  // === Tests QA — couverture des branches manquantes ===

  it("QA-47-1 : aucun mois avec revenu > 0 → savingsScore = 0 (ligne 22)", () => {
    // Tous les mois ont income = 0 → validMonths vide → branche else à savingsScore = 0
    const result = computeHealthScore({
      monthlySummaries: [
        { income: 0, expenses: 0 },
        { income: 0, expenses: 100 },
      ],
      budgets: [],
      goals: [],
    });
    expect(result.savingsScore).toBe(0);
  });

  it("QA-47-2 : moyenne des revenus = 0 (incomes tous nuls) → stabilityScore = 0 (ligne 63)", () => {
    // mean = 0 → cv non calculable → stabilityScore = 0
    const result = computeHealthScore({
      monthlySummaries: [
        { income: 0, expenses: 200 },
        { income: 0, expenses: 150 },
        { income: 0, expenses: 300 },
      ],
      budgets: [],
      goals: [],
    });
    expect(result.stabilityScore).toBe(0);
    expect(result.savingsScore).toBe(0);
  });
});
