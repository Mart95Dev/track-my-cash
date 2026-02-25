/**
 * TU-96-QA-1 à TU-96-QA-3 — STORY-096 QA
 * Tests QA : balance getCoupleWeeklyStats + premium plan + balance équilibre
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Client } from "@libsql/client";
import { renderWeeklyEmail } from "@/lib/email-templates";
import type { CoupleWeeklyData } from "@/lib/couple-queries";

// ─── GAP-1 : balance direction ────────────────────────────────────────────────

describe("getCoupleWeeklyStats — balance (STORY-096 QA)", () => {
  let mockDb1: Client;
  let mockDb2: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb1 = { execute: vi.fn() } as unknown as Client;
    mockDb2 = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-96-QA-1 : u1 paie 170€, u2 paie 30€ → balance = +140 (u2 doit à u1)", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
      rows: [
        { amount: 50, category: "Courses", paid_by: "u1" },
        { amount: 120, category: "Loyer", paid_by: "u1" },
      ],
    });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
      rows: [{ amount: 30, category: "Courses", paid_by: "u2" }],
    });

    const { getCoupleWeeklyStats } = await import("@/lib/couple-queries");
    const result = await getCoupleWeeklyStats(mockDb1, mockDb2, "u1", "u2", "2026-02-17");

    // u1 paid 170, u2 paid 30 → balance from u1's perspective = +140
    expect(result.balance).toBeCloseTo(140);
  });
});

// ─── GAP-2 : balance = 0 (équilibre) dans le template email ──────────────────

describe("renderWeeklyEmail — balance zéro (STORY-096 QA)", () => {
  const BASE_DATA = {
    weekStart: "2026-02-17",
    weekEnd: "2026-02-23",
    totalExpenses: 300,
    totalIncome: 600,
    currency: "EUR",
    topCategories: [],
    budgetsOver: [],
    goalsProgress: [],
  };

  it("TU-96-QA-2 : balance = 0 → 'Balance à l'équilibre' dans le rendu", () => {
    const coupleWeekly: CoupleWeeklyData = {
      sharedExpenses: 200,
      balance: 0,
      topSharedCategory: "Courses",
      transactionCount: 2,
      partnerName: "Alex",
    };
    const html = renderWeeklyEmail(
      { ...BASE_DATA, coupleWeekly },
      "Thomas",
      "https://app.test"
    );
    expect(html).toContain("Balance à l");
    expect(html).not.toContain("partenaire vous doit");
    expect(html).not.toContain("vous devez");
  });
});

// ─── GAP-3 : plan Premium → coupleWeekly présent (AC-1 complet) ───────────────

describe("computeWeeklySummary — plan Premium (STORY-096 QA)", () => {
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

  it("TU-96-QA-3 : User Premium + couple actif → coupleWeekly présent (AC-1)", async () => {
    vi.doMock("@/lib/subscription-utils", () => ({
      getUserPlanId: vi.fn().mockResolvedValue("premium"),
    }));
    vi.doMock("@/lib/queries", () => ({
      getWeeklySummaryData: vi.fn().mockResolvedValue(BASE_WEEKLY),
    }));
    vi.doMock("@/lib/couple-queries", () => ({
      getCoupleByUserId: vi
        .fn()
        .mockResolvedValue({ id: "c1", invite_code: "XYZ", name: null, created_by: "u1", created_at: 0 }),
      getCoupleMembers: vi.fn().mockResolvedValue([
        { id: "m1", couple_id: "c1", user_id: "u1", role: "owner", status: "active", joined_at: 0 },
        { id: "m2", couple_id: "c1", user_id: "u3", role: "member", status: "active", joined_at: 0 },
      ]),
      getCoupleWeeklyStats: vi.fn().mockResolvedValue({
        sharedExpenses: 180,
        balance: -10,
        topSharedCategory: "Restaurants",
        transactionCount: 3,
      }),
    }));
    vi.doMock("@/lib/db", () => ({
      getDb: vi.fn().mockReturnValue({
        execute: vi
          .fn()
          .mockResolvedValue({ rows: [{ name: "Léa", email: "lea@test.com" }] }),
      }),
      getUserDb: vi.fn().mockResolvedValue({ execute: vi.fn() }),
    }));

    const { computeWeeklySummary } = await import("@/lib/weekly-summary");
    const result = await computeWeeklySummary("u1", {} as Client, "2026-02-17", "2026-02-23");

    expect(result.coupleWeekly).toBeDefined();
    expect(result.coupleWeekly?.partnerName).toBe("Léa");
    expect(result.coupleWeekly?.transactionCount).toBe(3);
  });
});
