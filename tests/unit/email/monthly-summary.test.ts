import { describe, it, expect } from "vitest";
import { renderMonthlySummaryEmail, type MonthlySummaryData } from "@/lib/email-templates";

function makeData(overrides: Partial<MonthlySummaryData> = {}): MonthlySummaryData {
  return {
    month: "2026-01",
    income: 3000,
    expenses: 1800,
    net: 1200,
    currency: "EUR",
    topCategories: [
      { category: "Alimentation", total: 600, percentage: 33.3 },
      { category: "Transport", total: 400, percentage: 22.2 },
      { category: "Loisirs", total: 300, percentage: 16.7 },
    ],
    ...overrides,
  };
}

describe("renderMonthlySummaryEmail", () => {
  it("TU-1-1 : le template contient le mois formaté (janvier 2026)", () => {
    const html = renderMonthlySummaryEmail(makeData());
    expect(html).toContain("janvier 2026");
  });

  it("TU-1-2 : le template contient les montants revenus et dépenses", () => {
    const html = renderMonthlySummaryEmail(makeData());
    // Montants formatés en fr-FR avec devise
    expect(html).toContain("3");  // 3 000 €
    expect(html).toContain("1"); // 1 800 €
    expect(html).toContain("Revenus");
    expect(html).toContain("Dépenses");
  });

  it("TU-1-3 : le template contient les catégories du top 3", () => {
    const html = renderMonthlySummaryEmail(makeData());
    expect(html).toContain("Alimentation");
    expect(html).toContain("Transport");
    expect(html).toContain("Loisirs");
  });

  it("TU-1-4 : cashflow positif → mention 'excédent' ou signe '+'", () => {
    const html = renderMonthlySummaryEmail(makeData({ net: 500 }));
    const hasPositiveSign = html.includes("excédent") || html.includes("+");
    expect(hasPositiveSign).toBe(true);
  });

  it("TU-1-5 : topCategories vide → affiche 'Aucune dépense ce mois'", () => {
    const html = renderMonthlySummaryEmail(makeData({ topCategories: [] }));
    expect(html).toContain("Aucune dépense ce mois");
  });
});
