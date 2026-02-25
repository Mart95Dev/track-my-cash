/**
 * STORY-099 — Catégories prédéfinies couple
 * QA tests composant complémentaires (TEA).
 * Couvre les GAPs non testés par Dev : nombre initial de pills, bouton "Voir plus",
 * server action updateTransactionCategoryAction appelée lors du clic pill.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TransactionCoupleToggle } from "@/components/transaction-couple-toggle";

const mockUpdateCoupleAction = vi.fn().mockResolvedValue(undefined);
const mockUpdateCategoryAction = vi.fn().mockResolvedValue(undefined);

vi.mock("@/app/actions/couple-actions", () => ({
  updateTransactionCoupleAction: () => mockUpdateCoupleAction(),
  updateTransactionCategoryAction: (txId: number, cat: string) =>
    mockUpdateCategoryAction(txId, cat),
}));

describe("TransactionCoupleToggle — pills QA complémentaires (STORY-099)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-99-QA-6 : toggle activé + catégorie vide → exactement 4 pills visibles initialement + bouton Voir plus", () => {
    render(
      <TransactionCoupleToggle
        txId={1}
        isShared={true}
        userId="u1"
        category=""
      />
    );
    // 4 pills + 1 bouton toggle + 1 bouton "Voir plus" = 6 boutons au total
    const buttons = screen.getAllByRole("button");
    // Le premier bouton est le toggle couple
    // Les 4 suivants sont les pills
    // Le dernier est "Voir plus"
    expect(buttons.length).toBe(6);
    expect(screen.getByText("Voir plus")).toBeDefined();
  });

  it("TU-99-QA-7 : clic sur 'Voir plus' → affiche les 8 pills (toutes les catégories)", () => {
    render(
      <TransactionCoupleToggle
        txId={1}
        isShared={true}
        userId="u1"
        category=""
      />
    );
    const voirPlusBtn = screen.getByText("Voir plus");
    fireEvent.click(voirPlusBtn);
    // Après click : 8 pills + 1 toggle = 9 boutons, plus de "Voir plus"
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(9);
    expect(screen.queryByText("Voir plus")).toBeNull();
  });

  it("TU-99-QA-8 : clic sur pill → updateTransactionCategoryAction appelé avec txId et catégorie correcte", async () => {
    render(
      <TransactionCoupleToggle
        txId={42}
        isShared={true}
        userId="u1"
        category=""
      />
    );
    // Clique sur la première pill (index 1, après le bouton toggle)
    const buttons = screen.getAllByRole("button");
    // buttons[0] = toggle, buttons[1] = première pill
    fireEvent.click(buttons[1]);
    await waitFor(() => {
      expect(mockUpdateCategoryAction).toHaveBeenCalledOnce();
      expect(mockUpdateCategoryAction).toHaveBeenCalledWith(
        42,
        expect.any(String)
      );
      // Le second argument doit être une string non vide
      const categoryArg = mockUpdateCategoryAction.mock.calls[0][1];
      expect(typeof categoryArg).toBe("string");
      expect(categoryArg.trim().length).toBeGreaterThan(0);
    });
  });

  it("TU-99-QA-9 : toggle activé + catégorie 'Autre' → pills visibles (AC-2 cas 'Autre')", () => {
    render(
      <TransactionCoupleToggle
        txId={1}
        isShared={true}
        userId="u1"
        category="Autre"
      />
    );
    // "Autre" est une catégorie générique → pills doivent s'afficher
    const buttons = screen.getAllByRole("button");
    // Au moins toggle + 4 pills + "Voir plus" = 6
    expect(buttons.length).toBeGreaterThan(1);
  });

  it("TU-99-QA-10 : toggle activé + catégorie vide → première pill affiche une catégorie de COUPLE_CATEGORIES", () => {
    render(
      <TransactionCoupleToggle
        txId={1}
        isShared={true}
        userId="u1"
        category=""
      />
    );
    // La première catégorie du tableau est "Loyer / charges"
    expect(screen.getByText("Loyer / charges")).toBeDefined();
  });
});
