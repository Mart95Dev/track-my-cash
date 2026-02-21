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
});
