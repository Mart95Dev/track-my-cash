import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TransactionCoupleToggle } from "@/components/transaction-couple-toggle";

vi.mock("@/app/actions/couple-actions", () => ({
  updateTransactionCoupleAction: vi.fn().mockResolvedValue(undefined),
  updateTransactionCategoryAction: vi.fn().mockResolvedValue(undefined),
}));

describe("TransactionCoupleToggle — pills catégories (STORY-099)", () => {
  it("TU-99-7 : toggle activé + catégorie vide → pills visibles", () => {
    render(
      <TransactionCoupleToggle
        txId={1}
        isShared={true}
        userId="u1"
        category=""
      />
    );
    // Au moins une pill de catégorie couple visible
    expect(screen.getAllByRole("button").length).toBeGreaterThan(1);
  });

  it("TU-99-8 : toggle activé + catégorie définie → pills absentes", () => {
    render(
      <TransactionCoupleToggle
        txId={1}
        isShared={true}
        userId="u1"
        category="Courses alimentaires"
      />
    );
    // Seulement le bouton toggle, pas de pills
    expect(screen.getAllByRole("button").length).toBe(1);
  });

  it("TU-99-9 : toggle désactivé + catégorie vide → pills absentes", () => {
    render(
      <TransactionCoupleToggle
        txId={1}
        isShared={false}
        userId="u1"
        category=""
      />
    );
    // Seulement le bouton toggle
    expect(screen.getAllByRole("button").length).toBe(1);
  });

  it("TU-99-10 : clic sur pill → callback onCategorySelect appelé avec la catégorie", async () => {
    const onCategorySelect = vi.fn();
    render(
      <TransactionCoupleToggle
        txId={1}
        isShared={true}
        userId="u1"
        category=""
        onCategorySelect={onCategorySelect}
      />
    );
    // Clique sur la première pill disponible (celle du début de COUPLE_CATEGORIES)
    const pills = screen.getAllByRole("button").filter((b) => b !== screen.getAllByRole("button")[0]);
    fireEvent.click(pills[0]);
    expect(onCategorySelect).toHaveBeenCalledOnce();
    expect(typeof onCategorySelect.mock.calls[0][0]).toBe("string");
  });
});
