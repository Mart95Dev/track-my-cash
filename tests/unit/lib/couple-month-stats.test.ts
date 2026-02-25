/**
 * TU-94-1 à TU-94-5 — STORY-094
 * Tests unitaires : getCoupleMonthStats
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Client } from "@libsql/client";

describe("couple-queries — getCoupleMonthStats (STORY-094)", () => {
  let mockDb1: Client;
  let mockDb2: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb1 = { execute: vi.fn() } as unknown as Client;
    mockDb2 = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-94-1 : 5 transactions partagées → total et count corrects", async () => {
    // db1 : 3 transactions (current), puis prev month total
    (mockDb1.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        rows: [
          { amount: -120, category: "Courses", description: "Monoprix", date: "2026-02-10", paid_by: "user-1" },
          { amount: -80,  category: "Courses", description: "Lidl",     date: "2026-02-12", paid_by: "user-1" },
          { amount: -200, category: "Loyer",   description: "Loyer fév",date: "2026-02-01", paid_by: "user-1" },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total: 350 }] });

    // db2 : 2 transactions (current), puis prev month total
    (mockDb2.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        rows: [
          { amount: -45, category: "Sorties",  description: "Restaurant", date: "2026-02-18", paid_by: "user-2" },
          { amount: -60, category: "Sorties",  description: "Cinéma",     date: "2026-02-20", paid_by: "user-2" },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total: 100 }] });

    const { getCoupleMonthStats } = await import("@/lib/couple-queries");
    const result = await getCoupleMonthStats(mockDb1, mockDb2, "2026-02");

    expect(result.transactionCount).toBe(5);
    // total = 120+80+200+45+60 = 505
    expect(result.totalExpenses).toBeCloseTo(505);
  });

  it("TU-94-2 : variation positive vs mois précédent", async () => {
    // current : 550, prev : 450 → variation ≈ +22.2%
    (mockDb1.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ rows: [{ amount: -300, category: "Loyer", description: "Loyer", date: "2026-02-01", paid_by: "user-1" }] })
      .mockResolvedValueOnce({ rows: [{ total: 350 }] });
    (mockDb2.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ rows: [{ amount: -250, category: "Courses", description: "Courses", date: "2026-02-05", paid_by: "user-2" }] })
      .mockResolvedValueOnce({ rows: [{ total: 100 }] });

    const { getCoupleMonthStats } = await import("@/lib/couple-queries");
    const result = await getCoupleMonthStats(mockDb1, mockDb2, "2026-02");

    // current = 300+250 = 550, prev = 350+100 = 450
    // variation = ((550-450)/450)*100 ≈ 22.2
    expect(result.variation).not.toBeNull();
    expect(result.variation!).toBeGreaterThan(0);
    expect(result.variation!).toBeCloseTo(22.2, 0);
  });

  it("TU-94-3 : variation null si aucune donnée mois précédent", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ rows: [{ amount: -100, category: "Courses", description: "X", date: "2026-02-01", paid_by: "user-1" }] })
      .mockResolvedValueOnce({ rows: [{ total: null }] });
    (mockDb2.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: null }] });

    const { getCoupleMonthStats } = await import("@/lib/couple-queries");
    const result = await getCoupleMonthStats(mockDb1, mockDb2, "2026-02");

    expect(result.variation).toBeNull();
  });

  it("TU-94-4 : top 3 catégories triées par montant DESC", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        rows: [
          { amount: -200, category: "Loyer",   description: "Loyer",   date: "2026-02-01", paid_by: "user-1" },
          { amount: -120, category: "Courses", description: "Courses", date: "2026-02-10", paid_by: "user-1" },
          { amount: -80,  category: "Courses", description: "Courses", date: "2026-02-12", paid_by: "user-1" },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });
    (mockDb2.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        rows: [{ amount: -45, category: "Sorties", description: "Resto", date: "2026-02-18", paid_by: "user-2" }],
      })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });

    const { getCoupleMonthStats } = await import("@/lib/couple-queries");
    const result = await getCoupleMonthStats(mockDb1, mockDb2, "2026-02");

    expect(result.topCategories).toHaveLength(3);
    // Loyer=200, Courses=200, Sorties=45 → trié DESC
    expect(result.topCategories[0].total).toBeGreaterThanOrEqual(result.topCategories[1].total);
    expect(result.topCategories[1].total).toBeGreaterThanOrEqual(result.topCategories[2].total);
    const cats = result.topCategories.map((c) => c.category);
    expect(cats).toContain("Loyer");
    expect(cats).toContain("Courses");
    expect(cats).toContain("Sorties");
  });

  it("TU-94-5 : aucune transaction partagée → zéros et tableaux vides", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });
    (mockDb2.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: 0 }] });

    const { getCoupleMonthStats } = await import("@/lib/couple-queries");
    const result = await getCoupleMonthStats(mockDb1, mockDb2, "2026-02");

    expect(result.totalExpenses).toBe(0);
    expect(result.transactionCount).toBe(0);
    expect(result.topCategories).toHaveLength(0);
    expect(result.recentTransactions).toHaveLength(0);
    expect(result.variation).toBeNull();
  });
});
