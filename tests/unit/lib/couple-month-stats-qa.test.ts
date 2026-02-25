/**
 * TU-94-QA-1 à TU-94-QA-2 — STORY-094 QA
 * Tests QA : getCoupleMonthStats — structure recentTransactions + limite 10
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Client } from "@libsql/client";

describe("couple-queries — getCoupleMonthStats QA (STORY-094)", () => {
  let mockDb1: Client;
  let mockDb2: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb1 = { execute: vi.fn() } as unknown as Client;
    mockDb2 = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-94-QA-1 : recentTransactions contient les champs (amount, category, description, date, paid_by)", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        rows: [
          {
            amount: -120,
            category: "Courses",
            description: "Monoprix",
            date: "2026-02-10",
            paid_by: "user-1",
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total: null }] });
    (mockDb2.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total: null }] });

    const { getCoupleMonthStats } = await import("@/lib/couple-queries");
    const result = await getCoupleMonthStats(mockDb1, mockDb2, "2026-02");

    expect(result.recentTransactions).toHaveLength(1);
    const tx = result.recentTransactions[0];
    expect(tx).toHaveProperty("amount");
    expect(tx).toHaveProperty("category");
    expect(tx).toHaveProperty("description");
    expect(tx).toHaveProperty("date");
    expect(tx).toHaveProperty("paid_by");
    expect(tx.description).toBe("Monoprix");
    expect(tx.paid_by).toBe("user-1");
    expect(tx.amount).toBe(-120);
  });

  it("TU-94-QA-2 : recentTransactions limitées à 10 si > 10 transactions", async () => {
    // 7 transactions db1 + 5 transactions db2 = 12 total → doit retourner 10
    const makeRow = (i: number) => ({
      amount: -(100 + i),
      category: "Courses",
      description: `tx-${i}`,
      date: `2026-02-${String(i + 1).padStart(2, "0")}`,
      paid_by: "user-1",
    });

    (mockDb1.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        rows: Array.from({ length: 7 }, (_, i) => makeRow(i)),
      })
      .mockResolvedValueOnce({ rows: [{ total: null }] });
    (mockDb2.execute as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        rows: Array.from({ length: 5 }, (_, i) => makeRow(i + 10)),
      })
      .mockResolvedValueOnce({ rows: [{ total: null }] });

    const { getCoupleMonthStats } = await import("@/lib/couple-queries");
    const result = await getCoupleMonthStats(mockDb1, mockDb2, "2026-02");

    expect(result.transactionCount).toBe(12);
    expect(result.recentTransactions).toHaveLength(10);
  });
});
