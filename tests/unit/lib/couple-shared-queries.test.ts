import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Client } from "@libsql/client";

// ─── TU-90-1 + TU-90-2 : getCoupleSharedBudgets ──────────────────────────────

describe("couple-queries — getCoupleSharedBudgets", () => {
  let mockDb1: Client;
  let mockDb2: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb1 = { execute: vi.fn() } as unknown as Client;
    mockDb2 = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-90-1 : retourne les budgets couple des deux utilisateurs fusionnés", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          account_id: 10,
          category: "Alimentation",
          amount_limit: 400,
          period: "monthly",
          couple_id: "couple-1",
        },
      ],
    });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [
        {
          id: 2,
          account_id: 20,
          category: "Loisirs",
          amount_limit: 200,
          period: "monthly",
          couple_id: "couple-1",
        },
      ],
    });

    const { getCoupleSharedBudgets } = await import("@/lib/couple-queries");
    const result = await getCoupleSharedBudgets(mockDb1, mockDb2, "couple-1");

    expect(result).toHaveLength(2);
    expect(result[0].category).toBe("Alimentation");
    expect(result[0].amount_limit).toBe(400);
    expect(result[0].couple_id).toBe("couple-1");
    expect(result[1].category).toBe("Loisirs");
    expect(result[1].amount_limit).toBe(200);
  });

  it("TU-90-2 : retourne tableau vide si aucun budget couple dans les deux DBs", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ rows: [] });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ rows: [] });

    const { getCoupleSharedBudgets } = await import("@/lib/couple-queries");
    const result = await getCoupleSharedBudgets(mockDb1, mockDb2, "couple-1");

    expect(result).toEqual([]);
    expect(mockDb1.execute).toHaveBeenCalledTimes(1);
    expect(mockDb2.execute).toHaveBeenCalledTimes(1);
  });

  it("TU-90-2b : mappe correctement le champ period en 'monthly' | 'yearly'", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [
        {
          id: 5,
          account_id: 10,
          category: "Vacances",
          amount_limit: 2000,
          period: "yearly",
          couple_id: "couple-x",
        },
      ],
    });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ rows: [] });

    const { getCoupleSharedBudgets } = await import("@/lib/couple-queries");
    const result = await getCoupleSharedBudgets(mockDb1, mockDb2, "couple-x");

    expect(result[0].period).toBe("yearly");
    expect(result[0].id).toBe(5);
  });
});

// ─── TU-90-3 + TU-90-4 : getCoupleSharedGoals ────────────────────────────────

describe("couple-queries — getCoupleSharedGoals", () => {
  let mockDb1: Client;
  let mockDb2: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb1 = { execute: vi.fn() } as unknown as Client;
    mockDb2 = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-90-3 : retourne les objectifs couple des deux utilisateurs fusionnés", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          name: "Voyage Japon",
          target_amount: 5000,
          current_amount: 1000,
          currency: "EUR",
          deadline: "2026-12-01",
          couple_id: "couple-1",
        },
      ],
    });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [
        {
          id: 2,
          name: "Nouvelle voiture",
          target_amount: 15000,
          current_amount: 3000,
          currency: "EUR",
          deadline: null,
          couple_id: "couple-1",
        },
      ],
    });

    const { getCoupleSharedGoals } = await import("@/lib/couple-queries");
    const result = await getCoupleSharedGoals(mockDb1, mockDb2, "couple-1");

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Voyage Japon");
    expect(result[0].target_amount).toBe(5000);
    expect(result[0].current_amount).toBe(1000);
    expect(result[1].name).toBe("Nouvelle voiture");
    expect(result[1].deadline).toBeNull();
  });

  it("TU-90-4 : retourne tableau vide si aucun objectif couple", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ rows: [] });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ rows: [] });

    const { getCoupleSharedGoals } = await import("@/lib/couple-queries");
    const result = await getCoupleSharedGoals(mockDb1, mockDb2, "couple-1");

    expect(result).toEqual([]);
  });

  it("TU-90-4b : mappe correctement les champs de CoupleGoalItem", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [
        {
          id: 42,
          name: "Fonds urgence",
          target_amount: 3000,
          current_amount: 500,
          currency: "EUR",
          deadline: null,
          couple_id: "couple-abc",
        },
      ],
    });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ rows: [] });

    const { getCoupleSharedGoals } = await import("@/lib/couple-queries");
    const result = await getCoupleSharedGoals(mockDb1, mockDb2, "couple-abc");

    expect(result[0]).toEqual({
      id: 42,
      name: "Fonds urgence",
      target_amount: 3000,
      current_amount: 500,
      currency: "EUR",
      deadline: null,
      couple_id: "couple-abc",
    });
  });
});
