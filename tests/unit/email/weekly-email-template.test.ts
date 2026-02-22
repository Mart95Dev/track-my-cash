import { describe, it, expect } from "vitest";
import { renderWeeklyEmail, type WeeklySummaryData } from "@/lib/email-templates";

function makeData(overrides: Partial<WeeklySummaryData> = {}): WeeklySummaryData {
  return {
    weekStart: "2026-02-16",
    weekEnd: "2026-02-22",
    totalExpenses: 450,
    totalIncome: 1200,
    currency: "EUR",
    topCategories: [
      { category: "Alimentation", amount: 180 },
      { category: "Transport", amount: 120 },
      { category: "Loisirs", amount: 80 },
    ],
    budgetsOver: [],
    goalsProgress: [],
    ...overrides,
  };
}

describe("renderWeeklyEmail (STORY-061)", () => {
  it("TU-61-5 : le template contient le récap dépenses de la semaine (AC-5)", () => {
    const html = renderWeeklyEmail(makeData(), "Alice", "https://app.trackmycash.fr");
    expect(html).toContain("Dépenses");
    expect(html).toContain("450");
  });

  it("TU-61-6 : le template contient les revenus (AC-5)", () => {
    const html = renderWeeklyEmail(makeData(), "Alice", "https://app.trackmycash.fr");
    expect(html).toContain("Revenus");
    expect(html).toContain("1");
  });

  it("TU-61-7 : le template contient les top catégories (AC-5)", () => {
    const html = renderWeeklyEmail(makeData(), "Alice", "https://app.trackmycash.fr");
    expect(html).toContain("Alimentation");
    expect(html).toContain("Transport");
    expect(html).toContain("Loisirs");
  });

  it("TU-61-8 : le template contient un CTA (lien vers l'app) (AC-5)", () => {
    const html = renderWeeklyEmail(makeData(), "Alice", "https://app.trackmycash.fr");
    expect(html).toContain("https://app.trackmycash.fr");
  });

  it("TU-61-9 : top catégories vide → pas de crash, retourne une chaîne valide", () => {
    const html = renderWeeklyEmail(
      makeData({ topCategories: [] }),
      "Bob",
      "https://app.trackmycash.fr"
    );
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
  });
});
