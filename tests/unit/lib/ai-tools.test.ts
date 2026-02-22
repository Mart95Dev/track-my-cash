import { describe, it, expect } from "vitest";
import { createBudgetSchema, createGoalSchema } from "@/lib/ai-tools";

describe("createBudgetSchema", () => {
  it("TU-50-1 : input valide → parse OK", () => {
    const result = createBudgetSchema.parse({
      category: "Restaurants",
      amount_limit: 200,
    });
    expect(result.category).toBe("Restaurants");
    expect(result.amount_limit).toBe(200);
  });

  it("TU-50-2 : montant négatif → ZodError", () => {
    expect(() =>
      createBudgetSchema.parse({ category: "X", amount_limit: -50 })
    ).toThrow();
  });

  it("TU-50-3 : montant zéro → ZodError (positive() exclut 0)", () => {
    expect(() =>
      createBudgetSchema.parse({ category: "X", amount_limit: 0 })
    ).toThrow();
  });

  // === Tests QA — branches de validation non couvertes ===

  it("QA-50-1 : catégorie vide ('') → ZodError (min(1))", () => {
    expect(() =>
      createBudgetSchema.parse({ category: "", amount_limit: 100 })
    ).toThrow();
  });
});

describe("createGoalSchema", () => {
  it("TU-50-4 : input valide sans deadline → parse OK, deadline undefined", () => {
    const result = createGoalSchema.parse({
      name: "Vacances",
      target_amount: 1500,
    });
    expect(result.name).toBe("Vacances");
    expect(result.target_amount).toBe(1500);
    expect(result.deadline).toBeUndefined();
  });

  it("TU-50-5 : input valide avec deadline → parse OK", () => {
    const result = createGoalSchema.parse({
      name: "X",
      target_amount: 500,
      deadline: "2026-07-01",
    });
    expect(result.deadline).toBe("2026-07-01");
  });

  it("TU-50-6 : montant cible nul → ZodError (positive() exclut 0)", () => {
    expect(() =>
      createGoalSchema.parse({ name: "X", target_amount: 0 })
    ).toThrow();
  });

  it("QA-50-2 : nom vide ('') → ZodError (min(1))", () => {
    expect(() =>
      createGoalSchema.parse({ name: "", target_amount: 500 })
    ).toThrow();
  });
});
