/**
 * TU-96-1 à TU-96-6 — STORY-096
 * Tests unitaires : getCoupleWeeklyStats + computeWeeklySummary
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Client } from "@libsql/client";

// ─── getCoupleWeeklyStats ─────────────────────────────────────────────────────

describe("getCoupleWeeklyStats (STORY-096)", () => {
  let mockDb1: Client;
  let mockDb2: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb1 = { execute: vi.fn() } as unknown as Client;
    mockDb2 = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-96-1 : 3 tx partagées (2+1) → transactionCount=3, sharedExpenses=200", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
      rows: [
        { amount: 50, category: "Courses", paid_by: "u1" },
        { amount: 30, category: "Courses", paid_by: "u2" },
      ],
    });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
      rows: [{ amount: 120, category: "Loyer", paid_by: "u1" }],
    });

    const { getCoupleWeeklyStats } = await import("@/lib/couple-queries");
    const result = await getCoupleWeeklyStats(mockDb1, mockDb2, "u1", "u2", "2026-02-17");

    expect(result.transactionCount).toBe(3);
    expect(result.sharedExpenses).toBeCloseTo(200);
  });

  it("TU-96-2 : catégorie dominante identifiée (Loyer 200 > Courses 150)", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
      rows: [
        { amount: 100, category: "Courses", paid_by: "u1" },
        { amount: 50, category: "Courses", paid_by: "u1" },
      ],
    });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
      rows: [{ amount: 200, category: "Loyer", paid_by: "u2" }],
    });

    const { getCoupleWeeklyStats } = await import("@/lib/couple-queries");
    const result = await getCoupleWeeklyStats(mockDb1, mockDb2, "u1", "u2", "2026-02-17");

    expect(result.topSharedCategory).toBe("Loyer");
  });

  it("TU-96-3 : aucune tx partagée → transactionCount=0, sharedExpenses=0", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ rows: [] });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ rows: [] });

    const { getCoupleWeeklyStats } = await import("@/lib/couple-queries");
    const result = await getCoupleWeeklyStats(mockDb1, mockDb2, "u1", "u2", "2026-02-17");

    expect(result.transactionCount).toBe(0);
    expect(result.sharedExpenses).toBe(0);
    expect(result.topSharedCategory).toBe("");
  });
});

// ─── computeWeeklySummary ────────────────────────────────────────────────────

describe("computeWeeklySummary (STORY-096)", () => {
  const BASE_WEEKLY = {
    weekStart: "2026-02-17",
    weekEnd: "2026-02-23",
    totalExpenses: 500,
    totalIncome: 1000,
    topCategories: [],
    budgetsOver: [],
    goalsProgress: [],
  };

  beforeEach(() => {
    vi.resetModules();
  });

  it("TU-96-4 : User Pro + couple actif → coupleWeekly présent avec partnerName", async () => {
    vi.doMock("@/lib/subscription-utils", () => ({
      getUserPlanId: vi.fn().mockResolvedValue("pro"),
    }));
    vi.doMock("@/lib/queries", () => ({
      getWeeklySummaryData: vi.fn().mockResolvedValue(BASE_WEEKLY),
    }));
    vi.doMock("@/lib/couple-queries", () => ({
      getCoupleByUserId: vi
        .fn()
        .mockResolvedValue({ id: "c1", invite_code: "ABC", name: null, created_by: "u1", created_at: 0 }),
      getCoupleMembers: vi.fn().mockResolvedValue([
        { id: "m1", couple_id: "c1", user_id: "u1", role: "owner", status: "active", joined_at: 0 },
        { id: "m2", couple_id: "c1", user_id: "u2", role: "member", status: "active", joined_at: 0 },
      ]),
      getCoupleWeeklyStats: vi.fn().mockResolvedValue({
        sharedExpenses: 245.5,
        balance: 35,
        topSharedCategory: "Courses",
        transactionCount: 4,
      }),
    }));
    vi.doMock("@/lib/db", () => ({
      getDb: vi.fn().mockReturnValue({
        execute: vi
          .fn()
          .mockResolvedValue({ rows: [{ name: "Marie", email: "marie@test.com" }] }),
      }),
      getUserDb: vi.fn().mockResolvedValue({ execute: vi.fn() }),
    }));

    const { computeWeeklySummary } = await import("@/lib/weekly-summary");
    const result = await computeWeeklySummary("u1", {} as Client, "2026-02-17", "2026-02-23");

    expect(result.coupleWeekly).toBeDefined();
    expect(result.coupleWeekly?.transactionCount).toBe(4);
    expect(result.coupleWeekly?.partnerName).toBe("Marie");
  });

  it("TU-96-5 : User Gratuit + couple actif → coupleWeekly absent", async () => {
    vi.doMock("@/lib/subscription-utils", () => ({
      getUserPlanId: vi.fn().mockResolvedValue("free"),
    }));
    vi.doMock("@/lib/queries", () => ({
      getWeeklySummaryData: vi.fn().mockResolvedValue(BASE_WEEKLY),
    }));
    vi.doMock("@/lib/couple-queries", () => ({
      getCoupleByUserId: vi.fn().mockResolvedValue({ id: "c1" }),
      getCoupleMembers: vi.fn().mockResolvedValue([]),
      getCoupleWeeklyStats: vi.fn(),
    }));
    vi.doMock("@/lib/db", () => ({
      getDb: vi.fn().mockReturnValue({ execute: vi.fn() }),
      getUserDb: vi.fn().mockResolvedValue({ execute: vi.fn() }),
    }));

    const { computeWeeklySummary } = await import("@/lib/weekly-summary");
    const result = await computeWeeklySummary("u1", {} as Client, "2026-02-17", "2026-02-23");

    expect(result.coupleWeekly).toBeUndefined();
  });

  it("TU-96-6 : User Pro + pas de couple → coupleWeekly absent", async () => {
    vi.doMock("@/lib/subscription-utils", () => ({
      getUserPlanId: vi.fn().mockResolvedValue("pro"),
    }));
    vi.doMock("@/lib/queries", () => ({
      getWeeklySummaryData: vi.fn().mockResolvedValue(BASE_WEEKLY),
    }));
    vi.doMock("@/lib/couple-queries", () => ({
      getCoupleByUserId: vi.fn().mockResolvedValue(null),
      getCoupleMembers: vi.fn().mockResolvedValue([]),
      getCoupleWeeklyStats: vi.fn(),
    }));
    vi.doMock("@/lib/db", () => ({
      getDb: vi.fn().mockReturnValue({ execute: vi.fn() }),
      getUserDb: vi.fn().mockResolvedValue({ execute: vi.fn() }),
    }));

    const { computeWeeklySummary } = await import("@/lib/weekly-summary");
    const result = await computeWeeklySummary("u1", {} as Client, "2026-02-17", "2026-02-23");

    expect(result.coupleWeekly).toBeUndefined();
  });
});
