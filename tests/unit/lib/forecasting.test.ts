import { describe, it, expect } from "vitest";
import { computeForecast } from "@/lib/forecasting";
import type { SpendingTrendEntry, Budget } from "@/lib/queries";

const trendAlim: SpendingTrendEntry[] = [
  { month: "2025-11", category: "Alimentation", amount: 380 },
  { month: "2025-12", category: "Alimentation", amount: 420 },
  { month: "2026-01", category: "Alimentation", amount: 450 },
];

const budgetAlim: Budget[] = [
  {
    id: 1,
    account_id: 1,
    category: "Alimentation",
    amount_limit: 400,
    period: "monthly",
    created_at: "2026-01-01",
    last_budget_alert_at: null,
    last_budget_alert_type: null,
  },
];

describe("computeForecast", () => {
  it("TU-1-1 : avec 3 mois de données → retourne tableau de CategoryForecast", () => {
    const result = computeForecast(trendAlim, budgetAlim);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      category: "Alimentation",
      avgAmount: expect.any(Number),
      lastMonthAmount: 450,
      budgetLimit: 400,
      trend: expect.stringMatching(/^(up|down|stable)$/),
      status: expect.stringMatching(/^(on_track|at_risk|exceeded|no_budget)$/),
    });
  });

  it("TU-1-2 : catégorie avec dépense > budget → status = 'exceeded'", () => {
    const result = computeForecast(trendAlim, budgetAlim);
    // avgAmount = (380+420+450)/3 = 416.67 > 400
    expect(result[0].status).toBe("exceeded");
  });

  it("TU-1-3 : catégorie sans budget → status = 'no_budget'", () => {
    const result = computeForecast(trendAlim, []); // aucun budget
    expect(result[0].status).toBe("no_budget");
    expect(result[0].budgetLimit).toBeNull();
  });

  it("TU-1-4 : tendance — dernier mois > moyenne → trend = 'up'", () => {
    const result = computeForecast(trendAlim, []);
    // dernier mois = 450, avg = ~416 → ratio positif > 5% → up
    expect(result[0].trend).toBe("up");
  });

  it("TU-1-5 : avec 0 données → retourne tableau vide", () => {
    const result = computeForecast([], budgetAlim);
    expect(result).toHaveLength(0);
  });

  // === Tests QA — gaps couverts ===

  it("TU-QA-1 : trend = 'down' quand dernier mois < moyenne de plus de 5%", () => {
    // 500 + 480 + 430 → avg = 470, dernier = 430 → ratio = (430-470)/470 ≈ -8.5% → down
    const trendDown: SpendingTrendEntry[] = [
      { month: "2025-11", category: "Transport", amount: 500 },
      { month: "2025-12", category: "Transport", amount: 480 },
      { month: "2026-01", category: "Transport", amount: 430 },
    ];
    const result = computeForecast(trendDown, []);
    expect(result[0].trend).toBe("down");
  });

  it("TU-QA-2 : status = 'at_risk' quand avgAmount entre 80% et 100% du budget", () => {
    // avg = 340, budget = 400 → ratio = 340/400 = 85% → at_risk
    const trendAtRisk: SpendingTrendEntry[] = [
      { month: "2025-11", category: "Loisirs", amount: 320 },
      { month: "2025-12", category: "Loisirs", amount: 350 },
      { month: "2026-01", category: "Loisirs", amount: 350 },
    ];
    const budgetLoisirs: Budget[] = [
      {
        id: 2, account_id: 1, category: "Loisirs",
        amount_limit: 400, period: "monthly",
        created_at: "2026-01-01",
        last_budget_alert_at: null, last_budget_alert_type: null,
      },
    ];
    const result = computeForecast(trendAtRisk, budgetLoisirs);
    // avg = (320+350+350)/3 = 340 → 340/400 = 85% → at_risk
    expect(result[0].status).toBe("at_risk");
  });

  it("TU-QA-3 : trend = 'stable' quand 1 seul mois de données", () => {
    const trendOneMonth: SpendingTrendEntry[] = [
      { month: "2026-01", category: "Santé", amount: 200 },
    ];
    const result = computeForecast(trendOneMonth, []);
    expect(result[0].trend).toBe("stable");
  });

  it("TU-QA-4 : tri par avgAmount décroissant avec plusieurs catégories", () => {
    const multiCat: SpendingTrendEntry[] = [
      { month: "2026-01", category: "Transport", amount: 150 },
      { month: "2026-01", category: "Alimentation", amount: 400 },
      { month: "2026-01", category: "Loisirs", amount: 80 },
    ];
    const result = computeForecast(multiCat, []);
    expect(result).toHaveLength(3);
    expect(result[0].category).toBe("Alimentation"); // 400
    expect(result[1].category).toBe("Transport");   // 150
    expect(result[2].category).toBe("Loisirs");     // 80
  });

  it("TU-QA-5 : avgAmount calculé correctement sur exactement 3 mois", () => {
    const result = computeForecast(trendAlim, []);
    // (380 + 420 + 450) / 3 = 1250/3 ≈ 416.67
    expect(result[0].avgAmount).toBeCloseTo(416.67, 1);
    expect(result[0].lastMonthAmount).toBe(450);
  });
});
