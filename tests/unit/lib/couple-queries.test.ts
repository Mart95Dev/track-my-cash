import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Client } from "@libsql/client";

// ─── TU-85-1 : getCoupleByUserId inconnu → null ──────────────────────────────

describe("couple-queries — getCoupleByUserId", () => {
  let mockDb: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-85-1 : getCoupleByUserId inconnu retourne null", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ rows: [] });

    const { getCoupleByUserId } = await import("@/lib/couple-queries");
    const result = await getCoupleByUserId(mockDb, "unknown-user");

    expect(result).toBeNull();
  });

  it("TU-85-1b : getCoupleByUserId utilisateur avec couple → retourne le couple", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [
        {
          id: "couple-abc",
          invite_code: "XYZ999",
          name: "Budget commun",
          created_by: "user-1",
          created_at: 1700000000,
        },
      ],
    });

    const { getCoupleByUserId } = await import("@/lib/couple-queries");
    const result = await getCoupleByUserId(mockDb, "user-1");

    expect(result).not.toBeNull();
    expect(result?.id).toBe("couple-abc");
    expect(result?.invite_code).toBe("XYZ999");
    expect(result?.name).toBe("Budget commun");
    expect(result?.created_by).toBe("user-1");
  });
});

// ─── TU-85-2 : createCouple insère couple + membre owner ─────────────────────

describe("couple-queries — createCouple", () => {
  let mockDb: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-85-2 : createCouple insère couple + membre owner et retourne le couple", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ rows: [] });

    const { createCouple } = await import("@/lib/couple-queries");
    const result = await createCouple(mockDb, "user1", "Notre budget", "ABC123");

    expect(result).not.toBeNull();
    expect(result.invite_code).toBe("ABC123");
    expect(result.created_by).toBe("user1");
    expect(result.name).toBe("Notre budget");
    expect(result.id).toBeTruthy();
    // 2 appels : INSERT couples + INSERT couple_members
    expect(mockDb.execute).toHaveBeenCalledTimes(2);
  });

  it("TU-85-2b : createCouple avec name=null fonctionne", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ rows: [] });

    const { createCouple } = await import("@/lib/couple-queries");
    const result = await createCouple(mockDb, "user1", null, "CODE42");

    expect(result.name).toBeNull();
    expect(result.invite_code).toBe("CODE42");
  });
});

// ─── TU-85-3 + TU-85-4 : joinCouple ─────────────────────────────────────────

describe("couple-queries — joinCouple", () => {
  let mockDb: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-85-3 : joinCouple code valide → insère membre role=member et retourne le couple", async () => {
    const mockExecute = mockDb.execute as ReturnType<typeof vi.fn>;
    // 1re requête : SELECT couple par invite_code → trouvé
    mockExecute.mockResolvedValueOnce({
      rows: [
        {
          id: "couple-1",
          invite_code: "ABC123",
          name: "Notre budget",
          created_by: "user1",
          created_at: 1700000000,
        },
      ],
    });
    // 2e requête : CHECK si déjà membre → pas encore
    mockExecute.mockResolvedValueOnce({ rows: [] });
    // 3e requête : INSERT membre
    mockExecute.mockResolvedValueOnce({ rows: [] });

    const { joinCouple } = await import("@/lib/couple-queries");
    const result = await joinCouple(mockDb, "user2", "ABC123");

    expect(result).not.toBeNull();
    expect(result?.id).toBe("couple-1");
    expect(result?.invite_code).toBe("ABC123");
    expect(mockExecute).toHaveBeenCalledTimes(3);
  });

  it("TU-85-4 : joinCouple code invalide → null", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ rows: [] });

    const { joinCouple } = await import("@/lib/couple-queries");
    const result = await joinCouple(mockDb, "user2", "INVALID");

    expect(result).toBeNull();
    expect(mockDb.execute).toHaveBeenCalledTimes(1);
  });

  it("TU-85-3b : joinCouple utilisateur déjà membre → retourne couple sans nouvel INSERT", async () => {
    const mockExecute = mockDb.execute as ReturnType<typeof vi.fn>;
    // 1re requête : SELECT couple par invite_code → trouvé
    mockExecute.mockResolvedValueOnce({
      rows: [
        {
          id: "couple-1",
          invite_code: "ABC123",
          name: null,
          created_by: "user1",
          created_at: 1700000000,
        },
      ],
    });
    // 2e requête : CHECK si déjà membre → oui
    mockExecute.mockResolvedValueOnce({ rows: [{ id: "cm-1" }] });

    const { joinCouple } = await import("@/lib/couple-queries");
    const result = await joinCouple(mockDb, "user1", "ABC123");

    expect(result).not.toBeNull();
    expect(result?.id).toBe("couple-1");
    // Seulement 2 appels (pas d'INSERT supplémentaire)
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });
});

// ─── TU-85-2c : getCoupleMembers ─────────────────────────────────────────────

describe("couple-queries — getCoupleMembers", () => {
  let mockDb: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-85-2c : getCoupleMembers retourne tableau vide si aucun membre actif", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ rows: [] });

    const { getCoupleMembers } = await import("@/lib/couple-queries");
    const result = await getCoupleMembers(mockDb, "couple-inexistant");

    expect(result).toEqual([]);
    expect(mockDb.execute).toHaveBeenCalledTimes(1);
  });

  it("TU-85-2d : getCoupleMembers retourne les membres actifs avec leurs rôles", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [
        {
          id: "cm-1",
          couple_id: "couple-1",
          user_id: "user1",
          role: "owner",
          status: "active",
          joined_at: 1700000000,
        },
        {
          id: "cm-2",
          couple_id: "couple-1",
          user_id: "user2",
          role: "member",
          status: "active",
          joined_at: 1700000100,
        },
      ],
    });

    const { getCoupleMembers } = await import("@/lib/couple-queries");
    const result = await getCoupleMembers(mockDb, "couple-1");

    expect(result).toHaveLength(2);
    expect(result[0].user_id).toBe("user1");
    expect(result[0].role).toBe("owner");
    expect(result[1].user_id).toBe("user2");
    expect(result[1].role).toBe("member");
  });

  it("TU-85-2e : getCoupleMembers mappe correctement les champs du type CoupleMember", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [
        {
          id: "cm-42",
          couple_id: "couple-abc",
          user_id: "user-xyz",
          role: "owner",
          status: "active",
          joined_at: 1700999999,
        },
      ],
    });

    const { getCoupleMembers } = await import("@/lib/couple-queries");
    const result = await getCoupleMembers(mockDb, "couple-abc");

    expect(result[0]).toEqual({
      id: "cm-42",
      couple_id: "couple-abc",
      user_id: "user-xyz",
      role: "owner",
      status: "active",
      joined_at: 1700999999,
    });
  });
});

// ─── TU-85-5 : leaveCouple ───────────────────────────────────────────────────

describe("couple-queries — leaveCouple", () => {
  let mockDb: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-85-5 : leaveCouple supprime membre et le couple si orphelin (0 membres restants)", async () => {
    const mockExecute = mockDb.execute as ReturnType<typeof vi.fn>;
    // 1. Trouver le couple
    mockExecute.mockResolvedValueOnce({ rows: [{ id: "couple-1" }] });
    // 2. Supprimer le membre
    mockExecute.mockResolvedValueOnce({ rows: [] });
    // 3. Compter les membres restants → 0 (orphelin)
    mockExecute.mockResolvedValueOnce({ rows: [{ count: 0 }] });
    // 4. Supprimer le couple
    mockExecute.mockResolvedValueOnce({ rows: [] });

    const { leaveCouple } = await import("@/lib/couple-queries");
    await leaveCouple(mockDb, "user1");

    expect(mockExecute).toHaveBeenCalledTimes(4);
  });

  it("TU-85-5b : leaveCouple supprime seulement le membre si partenaire reste", async () => {
    const mockExecute = mockDb.execute as ReturnType<typeof vi.fn>;
    // 1. Trouver le couple
    mockExecute.mockResolvedValueOnce({ rows: [{ id: "couple-1" }] });
    // 2. Supprimer le membre
    mockExecute.mockResolvedValueOnce({ rows: [] });
    // 3. Compter les membres restants → 1 (partenaire encore là)
    mockExecute.mockResolvedValueOnce({ rows: [{ count: 1 }] });

    const { leaveCouple } = await import("@/lib/couple-queries");
    await leaveCouple(mockDb, "user1");

    // 3 appels seulement (pas de DELETE couple)
    expect(mockExecute).toHaveBeenCalledTimes(3);
  });

  it("TU-85-5c : leaveCouple sans couple actif → ne fait rien", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ rows: [] });

    const { leaveCouple } = await import("@/lib/couple-queries");
    await leaveCouple(mockDb, "user-orphan");

    expect(mockDb.execute).toHaveBeenCalledTimes(1);
  });
});

// ─── TU-85-6 : migrations idempotentes ───────────────────────────────────────

describe("db — migrations couple idempotentes", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("TU-85-6 : initSchema ne lève pas d'erreur si les colonnes couple existent déjà", async () => {
    const mockExecute = vi.fn().mockRejectedValue(new Error("duplicate column name: visibility"));
    const mockExecuteMultiple = vi.fn().mockResolvedValue(undefined);

    vi.doMock("@libsql/client", () => ({
      createClient: vi.fn().mockReturnValue({
        execute: mockExecute,
        executeMultiple: mockExecuteMultiple,
      }),
    }));

    const { initSchema } = await import("@/lib/db");
    await expect(initSchema()).resolves.not.toThrow();
  });
});

// ─── TU-87-1 + TU-87-2 : computeCoupleBalanceForPeriod ──────────────────────

describe("couple-queries — computeCoupleBalanceForPeriod", () => {
  let mockDb1: Client;
  let mockDb2: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb1 = { execute: vi.fn() } as unknown as Client;
    mockDb2 = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-87-1 : user1=100€, user2=60€ → diff=40, owes=userId2", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ total: 100 }],
    });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ total: 60 }],
    });

    const { computeCoupleBalanceForPeriod } = await import("@/lib/couple-queries");
    const result = await computeCoupleBalanceForPeriod(
      mockDb1,
      mockDb2,
      "user-1",
      "user-2"
    );

    expect(result.user1Paid).toBe(100);
    expect(result.user2Paid).toBe(60);
    expect(result.diff).toBe(40);
    expect(result.owes).toBe("user-2");
    expect(result.amount).toBe(40);
  });

  it("TU-87-2 : user1=0€, user2=0€ → diff=0", async () => {
    (mockDb1.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ total: null }],
    });
    (mockDb2.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ total: null }],
    });

    const { computeCoupleBalanceForPeriod } = await import("@/lib/couple-queries");
    const result = await computeCoupleBalanceForPeriod(
      mockDb1,
      mockDb2,
      "user-1",
      "user-2"
    );

    expect(result.user1Paid).toBe(0);
    expect(result.user2Paid).toBe(0);
    expect(result.diff).toBe(0);
    expect(result.amount).toBe(0);
    // owes peut être user-2 car diff >= 0
    expect(result.owes).toBe("user-2");
  });
});

// ─── TU-85-7 : computeCoupleBalance ─────────────────────────────────────────

describe("couple-queries — computeCoupleBalance", () => {
  let mockDb: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-85-7 : computeCoupleBalance retourne tableau vide si pas de données", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ rows: [] });

    const { computeCoupleBalance } = await import("@/lib/couple-queries");
    const result = await computeCoupleBalance(mockDb, "couple-1", "2026-02");

    expect(result).toEqual([]);
    expect(mockDb.execute).toHaveBeenCalledTimes(1);
  });

  it("TU-85-7b : computeCoupleBalance retourne les données existantes", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [
        {
          id: "cb-1",
          couple_id: "couple-1",
          user_id: "user1",
          period_month: "2026-02",
          total_paid: 450.5,
          computed_at: 1700000000,
        },
        {
          id: "cb-2",
          couple_id: "couple-1",
          user_id: "user2",
          period_month: "2026-02",
          total_paid: 320.0,
          computed_at: 1700000000,
        },
      ],
    });

    const { computeCoupleBalance } = await import("@/lib/couple-queries");
    const result = await computeCoupleBalance(mockDb, "couple-1", "2026-02");

    expect(result).toHaveLength(2);
    expect(result[0].user_id).toBe("user1");
    expect(result[0].total_paid).toBe(450.5);
    expect(result[1].user_id).toBe("user2");
    expect(result[1].total_paid).toBe(320.0);
  });
});
