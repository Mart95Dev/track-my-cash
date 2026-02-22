import { describe, it, expect } from "vitest";
import { suggestBudgets } from "@/lib/budget-suggester";
import type { CategoryExpense } from "@/lib/budget-suggester";

const EXPENSES_STABLE: CategoryExpense[] = [
  { category: "Alimentation", monthlyAmounts: [350, 380, 360] },
];

const EXPENSES_VARIABLE: CategoryExpense[] = [
  { category: "Loisirs", monthlyAmounts: [100, 300, 50] },
];

const EXPENSES_INSUFFICIENT: CategoryExpense[] = [
  { category: "Vêtements", monthlyAmounts: [200] }, // 1 seul mois
];

const EXISTING_BUDGET_CATEGORIES = ["Alimentation"];

describe("suggestBudgets", () => {
  it("TU-52-1 : catégorie stable (3 mois, CV ≤ 0.15) → high confidence, suggestedLimit arrondi dizaine sup", () => {
    const result = suggestBudgets(EXPENSES_STABLE, []);
    expect(result).toHaveLength(1);
    const s = result[0]!;
    expect(s.category).toBe("Alimentation");
    // avg = (350 + 380 + 360) / 3 = 363.33 → roundUpToTen = 370
    expect(s.suggestedLimit).toBe(370);
    expect(s.avgAmount).toBeCloseTo(363.33, 1);
    expect(s.confidence).toBe("high");
  });

  it("TU-52-2 : catégorie variable (CV > 0.30) → confidence low", () => {
    const result = suggestBudgets(EXPENSES_VARIABLE, []);
    expect(result).toHaveLength(1);
    expect(result[0]!.confidence).not.toBe("high");
    // avg = (100 + 300 + 50) / 3 = 150 → CV ≈ 0.72 > 0.30 → low
    expect(result[0]!.confidence).toBe("low");
  });

  it("TU-52-3 : catégorie déjà budgétée → exclue des suggestions", () => {
    const result = suggestBudgets(EXPENSES_STABLE, EXISTING_BUDGET_CATEGORIES);
    expect(result).toHaveLength(0);
  });

  it("TU-52-4 : 1 seul mois de données → non suggérée", () => {
    const result = suggestBudgets(EXPENSES_INSUFFICIENT, []);
    expect(result).toHaveLength(0);
  });

  it("TU-52-5 : maximum 8 suggestions même avec 15 catégories", () => {
    const manyExpenses: CategoryExpense[] = Array.from({ length: 15 }, (_, i) => ({
      category: `Catégorie ${i + 1}`,
      monthlyAmounts: [200, 210],
    }));
    const result = suggestBudgets(manyExpenses, []);
    expect(result.length).toBeLessThanOrEqual(8);
    expect(result).toHaveLength(8);
  });

  it("TU-52-6 : maxSuggestions personnalisé → respecté", () => {
    const manyExpenses: CategoryExpense[] = Array.from({ length: 10 }, (_, i) => ({
      category: `Cat ${i + 1}`,
      monthlyAmounts: [100, 120, 110],
    }));
    const result = suggestBudgets(manyExpenses, [], 3);
    expect(result).toHaveLength(3);
  });

  it("TU-52-7 : 2 mois de données + faible variance → medium confidence", () => {
    const twoMonths: CategoryExpense[] = [
      { category: "Transport", monthlyAmounts: [100, 110] },
    ];
    const result = suggestBudgets(twoMonths, []);
    expect(result).toHaveLength(1);
    // 2 mois : même si CV est faible, confidence = medium (pas 3 mois complets)
    expect(result[0]!.confidence).toBe("medium");
  });

  it("QA-52-1 : tableau expenses vide → aucune suggestion retournée", () => {
    const result = suggestBudgets([], []);
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it("QA-52-2 : montants tous à 0 → guard division par zéro, suggestedLimit = 0", () => {
    const zeroExpenses: CategoryExpense[] = [
      { category: "Divers", monthlyAmounts: [0, 0, 0] },
    ];
    const result = suggestBudgets(zeroExpenses, []);
    // avg = 0, coefficientOfVariation retourne 0 (guard), CV ≤ 0.15 + 3 mois → high
    expect(result).toHaveLength(1);
    expect(result[0]!.suggestedLimit).toBe(0);
    expect(result[0]!.avgAmount).toBe(0);
    expect(result[0]!.confidence).toBe("high");
  });
});
