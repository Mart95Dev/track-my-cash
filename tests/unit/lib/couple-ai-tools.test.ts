import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import type { Client } from "@libsql/client";

// ─── TU-91-1 : structure de createCoupleAiTools ──────────────────────────────

describe("createCoupleAiTools — structure (STORY-091)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("TU-91-1 : retourne un objet avec getCoupleBalance et getCoupleSummary", async () => {
    const mockDb = { execute: vi.fn() } as unknown as Client;
    const { createCoupleAiTools } = await import("@/lib/ai-tools");
    const tools = createCoupleAiTools(mockDb, mockDb, "user-1", "user-2");

    expect(tools).toHaveProperty("getCoupleBalance");
    expect(tools).toHaveProperty("getCoupleSummary");
    expect(typeof tools.getCoupleBalance.execute).toBe("function");
    expect(typeof tools.getCoupleSummary.execute).toBe("function");
  });

  it("TU-91-1b : getCoupleBalance a un inputSchema avec period optionnel", async () => {
    const mockDb = { execute: vi.fn() } as unknown as Client;
    const { createCoupleAiTools } = await import("@/lib/ai-tools");
    const tools = createCoupleAiTools(mockDb, mockDb, "user-1", "user-2");

    // inputSchema doit parser period optionnel sans erreur (cast Zod)
    const schema = tools.getCoupleBalance.inputSchema as z.ZodTypeAny;
    const parsed = schema.safeParse({});
    expect(parsed.success).toBe(true);
    const parsedWithPeriod = schema.safeParse({ period: "2026-02" });
    expect(parsedWithPeriod.success).toBe(true);
  });
});

// ─── TU-91-2 : getCoupleBalance.execute ──────────────────────────────────────

type CoupleBalanceResult = {
  type: "couple_balance";
  user1Paid: number;
  user2Paid: number;
  diff: number;
  amount: number;
  message: string;
};

type CoupleSummaryResult = {
  type: "couple_summary";
  totalExpenses: number;
  transactionCount: number;
  topCategories: Array<{ category: string; total: number }>;
  period: string;
  message: string;
};

describe("getCoupleBalance — execute (STORY-091)", () => {
  let mockDb1: Client;
  let mockDb2: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb1 = { execute: vi.fn() } as unknown as Client;
    mockDb2 = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-91-2 : user1=100€, user2=60€ → diff=40, partenaire doit à l'utilisateur", async () => {
    // mockDb1 répond 100€ payé par user-1
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ total: 100 }],
    });
    // mockDb2 répond 60€ payé par user-2
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ total: 60 }],
    });

    const { createCoupleAiTools } = await import("@/lib/ai-tools");
    const tools = createCoupleAiTools(mockDb1, mockDb2, "user-1", "user-2");
    const result = (await tools.getCoupleBalance.execute!(
      { period: undefined },
      {} as never
    )) as CoupleBalanceResult;

    expect(result.type).toBe("couple_balance");
    expect(result.user1Paid).toBe(100);
    expect(result.user2Paid).toBe(60);
    expect(result.diff).toBe(40);
    expect(result.amount).toBe(40);
    // user-1 a payé plus → partenaire (user-2) doit à l'utilisateur
    expect(result.message).toMatch(/partenaire vous doit/i);
  });

  it("TU-91-2b : user1=0€, user2=0€ → diff=0, égalité dans le message", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ total: null }],
    });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ total: null }],
    });

    const { createCoupleAiTools } = await import("@/lib/ai-tools");
    const tools = createCoupleAiTools(mockDb1, mockDb2, "user-1", "user-2");
    const result = (await tools.getCoupleBalance.execute!(
      { period: undefined },
      {} as never
    )) as CoupleBalanceResult;

    expect(result.diff).toBe(0);
    expect(result.amount).toBe(0);
    expect(result.message).toMatch(/égales/i);
  });
});

// ─── TU-91-3 : getCoupleSummary.execute ──────────────────────────────────────

describe("getCoupleSummary — execute (STORY-091)", () => {
  let mockDb1: Client;
  let mockDb2: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb1 = { execute: vi.fn() } as unknown as Client;
    mockDb2 = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-91-3 : 2 transactions dépenses partagées → totalExpenses et transactionCount corrects", async () => {
    // getSharedTransactionsForCouple requête DB1 et DB2
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [
        {
          id: 1, account_id: 10, type: "expense", amount: 80,
          date: "2026-02-10", category: "Alimentation", subcategory: "",
          description: "Courses", import_hash: null, created_at: "2026-02-10",
          account_name: null, note: null, is_couple_shared: 1,
          paid_by: "user-1", split_type: "50/50",
        },
      ],
    });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [
        {
          id: 2, account_id: 20, type: "expense", amount: 80,
          date: "2026-02-15", category: "Restaurant", subcategory: "",
          description: "Dîner", import_hash: null, created_at: "2026-02-15",
          account_name: null, note: null, is_couple_shared: 1,
          paid_by: "user-2", split_type: "50/50",
        },
      ],
    });

    const { createCoupleAiTools } = await import("@/lib/ai-tools");
    const tools = createCoupleAiTools(mockDb1, mockDb2, "user-1", "user-2");
    const result = (await tools.getCoupleSummary.execute!(
      { period: "2026-02" },
      {} as never
    )) as CoupleSummaryResult;

    expect(result.type).toBe("couple_summary");
    expect(result.totalExpenses).toBe(160);
    expect(result.transactionCount).toBe(2);
    expect(result.topCategories.length).toBeGreaterThan(0);
  });

  it("TU-91-3b : 0 transactions → totalExpenses=0, transactionCount=0", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ rows: [] });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ rows: [] });

    const { createCoupleAiTools } = await import("@/lib/ai-tools");
    const tools = createCoupleAiTools(mockDb1, mockDb2, "user-1", "user-2");
    const result = (await tools.getCoupleSummary.execute!(
      { period: undefined },
      {} as never
    )) as CoupleSummaryResult;

    expect(result.totalExpenses).toBe(0);
    expect(result.transactionCount).toBe(0);
    expect(result.topCategories).toEqual([]);
  });
});
