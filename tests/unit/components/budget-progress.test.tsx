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

  it("TU-2-2 : la classe text-danger est présente si percentage > 90", () => {
    const overBudget: BudgetStatus = { ...baseBudget, spent: 500, percentage: 125 };
    const { container } = render(<BudgetProgress budget={overBudget} />);
    // Le badge de pourcentage utilise text-danger quand le budget est dépassé
    const pctEl = container.querySelector(".text-danger");
    expect(pctEl).not.toBeNull();
  });

  it("TU-2-3 : affiche le nom de la catégorie", () => {
    render(<BudgetProgress budget={baseBudget} />);
    expect(screen.getByText("Alimentation")).toBeTruthy();
  });

  it("TU-2-4 : affiche les montants dépensé et budget sous la forme 'X sur Y'", () => {
    render(<BudgetProgress budget={baseBudget} currency="EUR" />);
    // Le composant affiche "{spent} sur {limit}" dans un paragraphe
    const row = screen.getByText(/sur/);
    expect(row).toBeTruthy();
    // La barre de progression est présente
    expect(screen.getByRole("progressbar")).toBeTruthy();
  });
});
