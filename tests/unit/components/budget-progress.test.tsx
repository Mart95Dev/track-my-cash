import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BudgetProgress } from "@/components/budget-progress";
import type { BudgetStatus } from "@/lib/queries";

const baseBudget: BudgetStatus = {
  category: "Alimentation",
  spent: 260,
  limit: 400,
  percentage: 65,
  period: "monthly",
};

describe("BudgetProgress", () => {
  it("TU-2-1 : affiche '65%' si percentage = 65", () => {
    render(<BudgetProgress budget={baseBudget} />);
    expect(screen.getByText("65%")).toBeTruthy();
  });

  it("TU-2-2 : la classe text-expense est présente si percentage > 100", () => {
    const overBudget: BudgetStatus = { ...baseBudget, spent: 500, percentage: 125 };
    const { container } = render(<BudgetProgress budget={overBudget} />);
    // L'élément affichant le % doit avoir la classe text-expense
    const pctEl = container.querySelector(".text-expense");
    expect(pctEl).not.toBeNull();
  });

  it("TU-2-3 : affiche le nom de la catégorie", () => {
    render(<BudgetProgress budget={baseBudget} />);
    expect(screen.getByText("Alimentation")).toBeTruthy();
  });

  it("TU-2-4 : affiche 'Dépensé' et 'Budget'", () => {
    render(<BudgetProgress budget={baseBudget} currency="EUR" />);
    const el = screen.getByText(/Dépensé/);
    expect(el).toBeTruthy();
    expect(el.textContent).toContain("Budget");
  });
});
