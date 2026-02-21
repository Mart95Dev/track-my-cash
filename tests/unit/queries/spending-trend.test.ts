import { describe, it, expect, vi, beforeEach } from "vitest";

const mockExecute = vi.fn();
const mockDb = { execute: mockExecute } as unknown as import("@libsql/client").Client;

describe("getSpendingTrend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("TU-1-1 : 0 transactions → tableau vide", async () => {
    mockExecute.mockResolvedValue({ rows: [] });
    const { getSpendingTrend } = await import("@/lib/queries");
    const result = await getSpendingTrend(mockDb, 6);
    expect(result).toEqual([]);
  });

  it("TU-1-2 : transactions sur 2 mois → 2 entrées distinctes par mois", async () => {
    mockExecute.mockResolvedValue({
      rows: [
        { month: "2025-12", category: "Alimentation", total: 300 },
        { month: "2026-01", category: "Alimentation", total: 400 },
      ],
    });
    const { getSpendingTrend } = await import("@/lib/queries");
    const result = await getSpendingTrend(mockDb, 6);
    expect(result).toHaveLength(2);
    expect(result[0].month).toBe("2025-12");
    expect(result[1].month).toBe("2026-01");
  });

  it("TU-1-3 : filtre accountId → la requête passe accountId en argument", async () => {
    mockExecute.mockResolvedValue({ rows: [] });
    const { getSpendingTrend } = await import("@/lib/queries");
    await getSpendingTrend(mockDb, 6, 42);
    const call = mockExecute.mock.calls[0][0];
    expect(call.args).toContain(42);
  });

  it("TU-1-4 : catégories regroupées correctement — amount = SUM total retourné", async () => {
    mockExecute.mockResolvedValue({
      rows: [
        { month: "2026-01", category: "Alimentation", total: 650 },
        { month: "2026-01", category: "Transport", total: 200 },
      ],
    });
    const { getSpendingTrend } = await import("@/lib/queries");
    const result = await getSpendingTrend(mockDb, 6);
    const alim = result.find((r) => r.category === "Alimentation");
    expect(alim?.amount).toBe(650);
    const transport = result.find((r) => r.category === "Transport");
    expect(transport?.amount).toBe(200);
  });
});
