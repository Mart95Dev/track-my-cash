import { describe, it, expect } from "vitest";
import { simulateScenario } from "@/lib/scenario-simulator";
import type { BaseForecast, Scenario } from "@/lib/scenario-simulator";

const BASE_FORECAST: BaseForecast = {
  avgMonthlyIncome: 3000,
  avgMonthlyExpenses: 2500,
  goals: [{ target_amount: 6000, current_amount: 1200 }],
};

const BASE_NO_GOALS: BaseForecast = {
  avgMonthlyIncome: 3000,
  avgMonthlyExpenses: 2500,
  goals: [],
};

const SCENARIO_EXTRA_SAVINGS: Scenario = {
  type: "extra_savings",
  amount: 200,
};

const SCENARIO_CUT_EXPENSE: Scenario = {
  type: "cut_expense",
  amount: 100,
  category: "Loisirs",
};

const SCENARIO_INCOME_INCREASE: Scenario = {
  type: "income_increase",
  amount: 10, // 10%
};

describe("simulateScenario", () => {
  it("TU-51-1 : extra savings 200€/mois → annualImpact = 2400, taux d'épargne augmente", () => {
    const result = simulateScenario(BASE_FORECAST, SCENARIO_EXTRA_SAVINGS);
    expect(result.annualImpact).toBe(2400);
    // baseline = (3000-2500)/3000*100 ≈ 16.67%, projected = 700/3000*100 ≈ 23.33%
    expect(result.projectedSavingsRate).toBeGreaterThan(result.baselineSavingsRate);
    expect(result.monthlyNetSavings).toBe(700);
  });

  it("TU-51-2 : couper dépense 100€/mois → annualImpact = 1200, dépenses réduites", () => {
    const result = simulateScenario(BASE_FORECAST, SCENARIO_CUT_EXPENSE);
    expect(result.annualImpact).toBe(1200);
    // newSavings = 3000 - 2400 = 600
    expect(result.monthlyNetSavings).toBe(600);
    expect(result.projectedSavingsRate).toBeGreaterThan(result.baselineSavingsRate);
  });

  it("TU-51-3 : hausse revenus +10% → projectedSavingsRate calculé correctement", () => {
    const result = simulateScenario(BASE_FORECAST, SCENARIO_INCOME_INCREASE);
    // newIncome = 3300, newSavings = 800, rate = 800/3300*100 ≈ 24.24%
    expect(result.projectedSavingsRate).toBeCloseTo(24.24, 1);
    // annualImpact = (3300-3000)*12 = 3600 (float tolerance)
    expect(result.annualImpact).toBeCloseTo(3600, 0);
  });

  it("TU-51-4 : avec objectif → monthsToGoal < baseline si épargne augmente", () => {
    const baseline = simulateScenario(BASE_FORECAST, { type: "extra_savings", amount: 0 });
    const improved = simulateScenario(BASE_FORECAST, SCENARIO_EXTRA_SAVINGS);
    // baseline remaining = 4800, savings=500 → ceil(4800/500) = 10
    expect(baseline.monthsToGoal).toBe(10);
    // improved remaining = 4800, savings=700 → ceil(4800/700) = 7
    expect(improved.monthsToGoal).toBe(7);
    expect(improved.monthsToGoal!).toBeLessThan(baseline.monthsToGoal!);
  });

  it("TU-51-5 : sans objectif → monthsToGoal = null", () => {
    const result = simulateScenario(BASE_NO_GOALS, SCENARIO_EXTRA_SAVINGS);
    expect(result.monthsToGoal).toBeNull();
  });

  it("TU-51-6 : extra savings 0€ → annualImpact = 0, taux identique à la baseline", () => {
    const result = simulateScenario(BASE_FORECAST, { type: "extra_savings", amount: 0 });
    expect(result.annualImpact).toBe(0);
    expect(result.projectedSavingsRate).toBeCloseTo(result.baselineSavingsRate, 5);
  });

  it("TU-51-7 : montant extra savings dépasse les revenus → projectedSavingsRate plafonné à 100", () => {
    // amount = 3000 : newSavings = 500 + 3000 = 3500 > income (3000) → plafonner
    const result = simulateScenario(BASE_FORECAST, { type: "extra_savings", amount: 3000 });
    expect(result.projectedSavingsRate).toBe(100);
  });

  it("QA-51-1 : épargne mensuelle négative avec objectifs → monthsToGoal = null", () => {
    const deficitBase: BaseForecast = {
      avgMonthlyIncome: 1000,
      avgMonthlyExpenses: 2000,
      goals: [{ target_amount: 5000, current_amount: 0 }],
    };
    const result = simulateScenario(deficitBase, { type: "extra_savings", amount: 0 });
    expect(result.monthlyNetSavings).toBeLessThan(0);
    expect(result.monthsToGoal).toBeNull();
  });

  it("QA-51-2 : cut_expense dépassant les dépenses → projectedSavingsRate plafonné à 100", () => {
    // amount = 3000 > expenses (2500) : newExpenses = -500, newSavings = 3500 > income (3000) → plafonner
    const result = simulateScenario(BASE_FORECAST, { type: "cut_expense", amount: 3000 });
    expect(result.projectedSavingsRate).toBe(100);
  });
});
