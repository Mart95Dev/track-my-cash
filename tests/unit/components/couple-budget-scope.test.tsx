import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock server actions — nécessaire car BudgetForm les importe au niveau module
vi.mock("@/app/actions/budget-actions", () => ({
  upsertBudgetAction: vi.fn().mockResolvedValue({ success: true }),
  deleteBudgetAction: vi.fn().mockResolvedValue({ success: true }),
  upsertCoupleBudgetAction: vi.fn().mockResolvedValue({ success: true }),
}));

import { BudgetForm } from "@/components/budget-form";

describe("BudgetForm — scope couple (STORY-090)", () => {
  it("TU-90-5 : affiche le sélecteur de portée si couple actif + Pro", () => {
    render(
      <BudgetForm
        accountId={1}
        budgets={[]}
        hasCoupleActive={true}
        isPro={true}
        coupleId="couple-1"
      />
    );

    expect(screen.getByText(/Portée/i)).toBeDefined();
  });

  it("TU-90-5b : affiche les boutons 'Personnel' et 'Couple' si couple actif + Pro", () => {
    render(
      <BudgetForm
        accountId={1}
        budgets={[]}
        hasCoupleActive={true}
        isPro={true}
        coupleId="couple-1"
      />
    );

    // Les deux options de portée sont présentes
    const buttons = screen.getAllByRole("button");
    const personnelBtn = buttons.find((b) => b.textContent === "Personnel");
    const coupleBtn = buttons.find((b) => b.textContent === "Couple");
    expect(personnelBtn).toBeDefined();
    expect(coupleBtn).toBeDefined();
  });

  it("TU-90-6 : n'affiche pas le sélecteur de portée si couple non actif", () => {
    render(
      <BudgetForm
        accountId={1}
        budgets={[]}
        hasCoupleActive={false}
      />
    );

    expect(screen.queryByText(/Portée/i)).toBeNull();
  });

  it("TU-90-6b : n'affiche pas le sélecteur si isPro=false même avec couple actif", () => {
    render(
      <BudgetForm
        accountId={1}
        budgets={[]}
        hasCoupleActive={true}
        isPro={false}
        coupleId="couple-1"
      />
    );

    expect(screen.queryByText(/Portée/i)).toBeNull();
  });
});
