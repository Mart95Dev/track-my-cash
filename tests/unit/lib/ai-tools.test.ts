import { describe, it, expect } from "vitest";
import { createBudgetSchema, createGoalSchema, createRecurringSchema } from "@/lib/ai-tools";

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

describe("createRecurringSchema (STORY-062)", () => {
  it("TU-62-1 : input valide complet → parse OK (AC-5)", () => {
    const result = createRecurringSchema.parse({
      name: "Netflix",
      amount: 17.99,
      type: "expense",
      frequency: "monthly",
      category: "Abonnement",
      next_date: "2026-03-01",
    });
    expect(result.name).toBe("Netflix");
    expect(result.amount).toBe(17.99);
    expect(result.type).toBe("expense");
    expect(result.frequency).toBe("monthly");
    expect(result.next_date).toBe("2026-03-01");
  });

  it("TU-62-2 : montant négatif → ZodError (positive()) (AC-5)", () => {
    expect(() =>
      createRecurringSchema.parse({
        name: "Netflix",
        amount: -17,
        type: "expense",
        frequency: "monthly",
        category: "Abonnement",
        next_date: "2026-03-01",
      })
    ).toThrow();
  });

  it("TU-62-3 : fréquence invalide → ZodError (enum) (AC-5)", () => {
    expect(() =>
      createRecurringSchema.parse({
        name: "Netflix",
        amount: 17,
        type: "expense",
        frequency: "daily", // invalide
        category: "Abonnement",
        next_date: "2026-03-01",
      })
    ).toThrow();
  });

  it("TU-62-4 : next_date format invalide → ZodError (AC-3)", () => {
    expect(() =>
      createRecurringSchema.parse({
        name: "Loyer",
        amount: 800,
        type: "expense",
        frequency: "monthly",
        category: "Logement",
        next_date: "01/03/2026", // mauvais format
      })
    ).toThrow();
  });

  it("TU-62-5 : next_date format YYYY-MM-DD valide → parse OK (AC-3)", () => {
    const result = createRecurringSchema.parse({
      name: "Loyer",
      amount: 800,
      type: "income",
      frequency: "yearly",
      category: "Logement",
      next_date: "2026-01-01",
    });
    expect(result.next_date).toBe("2026-01-01");
  });

  it("TU-62-6 : type 'income' accepté → parse OK (AC-5)", () => {
    const result = createRecurringSchema.parse({
      name: "Salaire",
      amount: 2500,
      type: "income",
      frequency: "monthly",
      category: "Revenus",
      next_date: "2026-03-25",
    });
    expect(result.type).toBe("income");
  });
});
