import { describe, it, expect, vi } from "vitest";

// Mock next-intl (hooks client)
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "fr",
}));

import { render, screen } from "@testing-library/react";
import { createElement } from "react";

// Import after mocking
const { MonthlySummary } = await import("@/components/monthly-summary");

function makeData(savingsRate: number | null) {
  return [
    {
      month: "2026-01",
      income: 3000,
      expenses: 1800,
      net: 1200,
      savingsRate,
    },
  ];
}

describe("MonthlySummary — taux d'épargne", () => {
  it("TU-1-1 : savingsRate positif (20%) → badge avec class text-income", () => {
    render(createElement(MonthlySummary, { data: makeData(20) }));
    const badge = screen.getByTestId("savings-rate-badge");
    expect(badge).toBeTruthy();
    expect(badge.className).toContain("text-income");
    expect(badge.textContent).toContain("20.0%");
  });

  it("TU-1-2 : savingsRate négatif (-10%) → badge avec class text-expense", () => {
    render(createElement(MonthlySummary, { data: makeData(-10) }));
    const badge = screen.getByTestId("savings-rate-badge");
    expect(badge.className).toContain("text-expense");
    expect(badge.textContent).toContain("-10.0%");
  });

  it("TU-1-3 : savingsRate null (revenus = 0) → affiche '—'", () => {
    render(createElement(MonthlySummary, { data: makeData(null) }));
    expect(screen.queryByTestId("savings-rate-badge")).toBeNull();
    expect(screen.getByText("—")).toBeTruthy();
  });

  it("TU-1-4 : MonthlySummary rend sans erreur avec props minimales (sans savingsRate)", () => {
    const minData = [{ month: "2026-01", income: 0, expenses: 0, net: 0 }];
    expect(() => render(createElement(MonthlySummary, { data: minData }))).not.toThrow();
  });
});
