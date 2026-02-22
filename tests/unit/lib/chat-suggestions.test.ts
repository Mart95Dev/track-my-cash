import { describe, it, expect } from "vitest";
import { generateChatSuggestions } from "@/lib/chat-suggestions";

const CONTEXT_BUDGET_EXCEEDED = {
  exceededBudgets: [{ category: "Loisirs" }],
  lateGoals: [],
  savingsRate: 15,
};

const CONTEXT_LATE_GOAL = {
  exceededBudgets: [],
  lateGoals: [{ name: "Vacances" }],
  savingsRate: 18,
};

const CONTEXT_LOW_SAVINGS = {
  exceededBudgets: [],
  lateGoals: [],
  savingsRate: 5,
};

const CONTEXT_ALL_GOOD = {
  exceededBudgets: [],
  lateGoals: [],
  savingsRate: 25,
};

describe("generateChatSuggestions", () => {
  it("TU-48-1 : budget dépassé → suggestion budget en premier avec le nom de la catégorie", () => {
    const suggestions = generateChatSuggestions(CONTEXT_BUDGET_EXCEEDED);
    expect(suggestions[0]).toContain("Loisirs");
  });

  it("TU-48-2 : objectif en retard → une suggestion contient le nom de l'objectif", () => {
    const suggestions = generateChatSuggestions(CONTEXT_LATE_GOAL);
    expect(suggestions.some((s) => s.includes("Vacances"))).toBe(true);
  });

  it("TU-48-3 : faible taux d'épargne → une suggestion contient 'taux d'épargne'", () => {
    const suggestions = generateChatSuggestions(CONTEXT_LOW_SAVINGS);
    expect(suggestions.some((s) => s.includes("taux d'épargne"))).toBe(true);
  });

  it("TU-48-4 : situation saine → entre 4 et 6 suggestions (minimum AC-1)", () => {
    const suggestions = generateChatSuggestions(CONTEXT_ALL_GOOD);
    expect(suggestions.length).toBeGreaterThanOrEqual(4);
    expect(suggestions.length).toBeLessThanOrEqual(6);
  });

  it("TU-48-5 : jamais plus de 6 suggestions même avec plusieurs priorités", () => {
    const suggestions = generateChatSuggestions({
      exceededBudgets: [{ category: "A" }, { category: "B" }, { category: "C" }],
      lateGoals: [{ name: "X" }, { name: "Y" }],
      savingsRate: 3,
    });
    expect(suggestions.length).toBeLessThanOrEqual(6);
  });

  it("TU-48-6 : cap à 6 — les suggestions 'toujours présentes' sont exclues quand les priorités remplissent le plafond", () => {
    const suggestions = generateChatSuggestions({
      exceededBudgets: [
        { category: "A" },
        { category: "B" },
        { category: "C" },
        { category: "D" },
        { category: "E" },
        { category: "F" },
      ],
      lateGoals: [],
      savingsRate: 25,
    });
    expect(suggestions.length).toBe(6);
    expect(suggestions.every((s) => s.includes("budget"))).toBe(true);
  });

  it("TU-48-7 : budget dépassé → suggestions prioritaires apparaissent avant les génériques", () => {
    const suggestions = generateChatSuggestions(CONTEXT_BUDGET_EXCEEDED);
    const budgetIndex = suggestions.findIndex((s) => s.includes("Loisirs"));
    const genericIndex = suggestions.findIndex((s) =>
      s.includes("Résume ma situation")
    );
    expect(budgetIndex).toBeLessThan(genericIndex);
  });
});
