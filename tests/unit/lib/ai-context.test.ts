import { describe, it, expect, vi } from "vitest";
import type { Client } from "@libsql/client";
import type { Account } from "@/lib/queries";

// Compte de test minimal
const mockAccount: Account = {
  id: 1,
  name: "Compte Courant",
  initial_balance: 1000,
  balance_date: "2026-01-01",
  currency: "EUR",
  created_at: "2026-01-01",
  calculated_balance: 1500,
  alert_threshold: null,
};

// Helper : crée un mock db retournant des résultats vides par défaut
function createMockDb(overrides: Record<number, { rows: unknown[] }> = {}): Client {
  let callIndex = 0;
  const execute = vi.fn().mockImplementation(() => {
    const result = overrides[callIndex] ?? { rows: [] };
    callIndex++;
    return Promise.resolve(result);
  });
  return { execute } as unknown as Client;
}

describe("buildFinancialContext — STORY-044", () => {
  it("TU-1-1 : avec un objectif d'épargne actif → output contient la section et le nom du goal", async () => {
    // Call order : 0=expenses, 1=incomes, 2=monthly, 3=recurring, 4=goals, 5=budgets
    const db = createMockDb({
      4: {
        rows: [
          {
            name: "Épargne vacances",
            target_amount: 1000,
            current_amount: 600,
            deadline: "2026-07-01",
            status: "active",
          },
        ],
      },
    });

    const { buildFinancialContext } = await import("@/lib/ai-context");
    const result = await buildFinancialContext(db, [mockAccount]);

    expect(result).toContain("Objectifs d'épargne");
    expect(result).toContain("Épargne vacances");
    expect(result).toContain("60%");
    expect(result).toContain("2026-07-01");
  });

  it("TU-1-2 : avec un budget dépassé → output contient 'DÉPASSÉ' et '⚠ ALERTE'", async () => {
    const db = createMockDb({
      5: {
        rows: [
          {
            category: "Loisirs",
            amount_limit: 200,
            spent: 250,
          },
        ],
      },
    });

    const { buildFinancialContext } = await import("@/lib/ai-context");
    const result = await buildFinancialContext(db, [mockAccount]);

    expect(result).toContain("DÉPASSÉ");
    expect(result).toContain("⚠ ALERTE");
    expect(result).toContain("Loisirs");
  });

  it("TU-1-3 : sans goals → section 'Objectifs d'épargne' absente", async () => {
    const db = createMockDb(); // toutes les requêtes retournent []

    const { buildFinancialContext } = await import("@/lib/ai-context");
    const result = await buildFinancialContext(db, [mockAccount]);

    expect(result).not.toContain("Objectifs d'épargne");
  });

  it("TU-1-4 : sans budgets → section 'Budgets' absente", async () => {
    const db = createMockDb(); // toutes les requêtes retournent []

    const { buildFinancialContext } = await import("@/lib/ai-context");
    const result = await buildFinancialContext(db, [mockAccount]);

    expect(result).not.toContain("Budgets du mois en cours");
  });

  it("TU-1-5 : budget à 85% → statut 'à risque' dans l'output (pas d'alerte DÉPASSÉ)", async () => {
    const db = createMockDb({
      5: {
        rows: [
          {
            category: "Restauration",
            amount_limit: 200,
            spent: 170, // 85% → à risque
          },
        ],
      },
    });

    const { buildFinancialContext } = await import("@/lib/ai-context");
    const result = await buildFinancialContext(db, [mockAccount]);

    expect(result).toContain("Budgets du mois en cours");
    expect(result).toContain("à risque");
    expect(result).not.toContain("DÉPASSÉ");
    expect(result).not.toContain("⚠ ALERTE");
  });
});
