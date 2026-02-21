import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB client
const mockExecute = vi.fn();
const mockDb = { execute: mockExecute } as unknown as import("@libsql/client").Client;

describe("getBudgetStatus — logique de calcul", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-1-1 : retourne [] si aucun budget n'est défini", async () => {
    mockExecute.mockResolvedValue({ rows: [] });
    const { getBudgetStatus } = await import("@/lib/queries");
    const result = await getBudgetStatus(mockDb, 1);
    expect(result).toEqual([]);
  });

  it("TU-1-2 : spent = 0 si aucune transaction de la catégorie dans le mois", async () => {
    mockExecute.mockResolvedValue({
      rows: [{ category: "Alimentation", amount_limit: 400, period: "monthly", spent: 0 }],
    });
    const { getBudgetStatus } = await import("@/lib/queries");
    const result = await getBudgetStatus(mockDb, 1);
    expect(result[0].spent).toBe(0);
    expect(result[0].percentage).toBe(0);
  });

  it("TU-1-3 : spent = somme correcte des dépenses du mois (pas les revenus)", async () => {
    mockExecute.mockResolvedValue({
      rows: [{ category: "Alimentation", amount_limit: 400, period: "monthly", spent: 350 }],
    });
    const { getBudgetStatus } = await import("@/lib/queries");
    const result = await getBudgetStatus(mockDb, 1);
    expect(result[0].spent).toBe(350);
  });

  it("TU-1-4 : la requête utilise les bornes de date (firstDay, lastDay) comme paramètres", async () => {
    mockExecute.mockResolvedValue({ rows: [] });
    const { getBudgetStatus } = await import("@/lib/queries");
    await getBudgetStatus(mockDb, 42);
    const call = mockExecute.mock.calls[0][0];
    // La requête doit avoir 3 args : firstDay, lastDay, accountId
    expect(call.args).toHaveLength(3);
    expect(call.args[2]).toBe(42);
  });

  it("TU-1-5 : percentage = (spent / limit) * 100", async () => {
    mockExecute.mockResolvedValue({
      rows: [{ category: "Transport", amount_limit: 100, period: "monthly", spent: 87.5 }],
    });
    const { getBudgetStatus } = await import("@/lib/queries");
    const result = await getBudgetStatus(mockDb, 1);
    expect(result[0].percentage).toBeCloseTo(87.5, 1);
  });

  it("TU-1-6 : percentage peut dépasser 100 (budget dépassé)", async () => {
    mockExecute.mockResolvedValue({
      rows: [{ category: "Loisirs", amount_limit: 200, period: "monthly", spent: 350 }],
    });
    const { getBudgetStatus } = await import("@/lib/queries");
    const result = await getBudgetStatus(mockDb, 1);
    expect(result[0].percentage).toBeGreaterThan(100);
  });
});
