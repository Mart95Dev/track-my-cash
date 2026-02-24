import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks déclarés avant les imports (hoisted)
vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-123"),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getDb: vi.fn().mockReturnValue({ execute: vi.fn() }),
}));

vi.mock("@/lib/couple-queries", () => ({
  getCoupleByUserId: vi.fn(),
  createCouple: vi.fn(),
  joinCouple: vi.fn(),
  leaveCouple: vi.fn(),
}));

vi.mock("@/lib/subscription-utils", () => ({
  canUseCoupleFeature: vi.fn().mockResolvedValue({ allowed: true }),
}));

describe("couple-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-86-1 : createCoupleAction autorisé (pro, pas de couple existant) → { success: true, inviteCode: string } avec inviteCode 6 chars uppercase", async () => {
    const { getCoupleByUserId, createCouple } = await import("@/lib/couple-queries");
    vi.mocked(getCoupleByUserId).mockResolvedValueOnce(null);
    vi.mocked(createCouple).mockResolvedValueOnce({
      id: "c_123",
      invite_code: "ABC123",
      name: null,
      created_by: "user-123",
      created_at: 1700000000,
    });

    const { createCoupleAction } = await import("@/app/actions/couple-actions");
    const form = new FormData();
    form.set("name", "Notre couple");

    const result = await createCoupleAction(null, form);

    expect((result as { success: boolean }).success).toBe(true);
    const inviteCode = (result as { inviteCode: string }).inviteCode;
    expect(typeof inviteCode).toBe("string");
    expect(inviteCode).toHaveLength(6);
    expect(inviteCode).toMatch(/^[A-Z0-9]{6}$/);
  });

  it("TU-86-2 : createCoupleAction déjà en couple → { error: 'Vous êtes déjà dans un couple' }", async () => {
    const { getCoupleByUserId } = await import("@/lib/couple-queries");
    vi.mocked(getCoupleByUserId).mockResolvedValueOnce({
      id: "c_existing",
      invite_code: "XYZ789",
      name: "Mon couple",
      created_by: "user-123",
      created_at: 1700000000,
    });

    const { createCoupleAction } = await import("@/app/actions/couple-actions");
    const form = new FormData();
    form.set("name", "Nouveau couple");

    const result = await createCoupleAction(null, form);

    expect((result as { error: string }).error).toBe("Vous êtes déjà dans un couple");
  });

  it("TU-86-3 : createCoupleAction plan free (canUseCoupleFeature.allowed=false) → { error: 'couple_pro' }", async () => {
    const { canUseCoupleFeature } = await import("@/lib/subscription-utils");
    vi.mocked(canUseCoupleFeature).mockResolvedValueOnce({
      allowed: false,
      reason: undefined,
    });

    const { createCoupleAction } = await import("@/app/actions/couple-actions");
    const form = new FormData();

    const result = await createCoupleAction(null, form);

    expect((result as { error: string }).error).toBe("couple_pro");
  });

  it("TU-86-4 : joinCoupleAction code valide → { success: true }", async () => {
    const { getCoupleByUserId, joinCouple } = await import("@/lib/couple-queries");
    vi.mocked(getCoupleByUserId).mockResolvedValueOnce(null);
    vi.mocked(joinCouple).mockResolvedValueOnce({
      id: "c_123",
      invite_code: "ABC123",
      name: null,
      created_by: "other-user",
      created_at: 1700000000,
    });

    const { joinCoupleAction } = await import("@/app/actions/couple-actions");
    const form = new FormData();
    form.set("inviteCode", "abc123");

    const result = await joinCoupleAction(null, form);

    expect((result as { success: boolean }).success).toBe(true);
  });

  it("TU-86-5 : joinCoupleAction code invalide (joinCouple retourne null) → { error: 'Code invalide' }", async () => {
    const { getCoupleByUserId, joinCouple } = await import("@/lib/couple-queries");
    vi.mocked(getCoupleByUserId).mockResolvedValueOnce(null);
    vi.mocked(joinCouple).mockResolvedValueOnce(null);

    const { joinCoupleAction } = await import("@/app/actions/couple-actions");
    const form = new FormData();
    form.set("inviteCode", "BADCOD");

    const result = await joinCoupleAction(null, form);

    expect((result as { error: string }).error).toBe("Code invalide");
  });

  it("TU-86-6 : joinCoupleAction sans code → { error: 'Code requis' }", async () => {
    const { getCoupleByUserId } = await import("@/lib/couple-queries");
    vi.mocked(getCoupleByUserId).mockResolvedValueOnce(null);

    const { joinCoupleAction } = await import("@/app/actions/couple-actions");
    const form = new FormData();
    // pas de inviteCode

    const result = await joinCoupleAction(null, form);

    expect((result as { error: string }).error).toBe("Code requis");
  });

  it("TU-86-7 : leaveCoupleAction → { success: true } + leaveCouple appelé", async () => {
    const { leaveCouple } = await import("@/lib/couple-queries");
    vi.mocked(leaveCouple).mockResolvedValueOnce(undefined);

    const { leaveCoupleAction } = await import("@/app/actions/couple-actions");
    const result = await leaveCoupleAction();

    expect(result).toEqual({ success: true });
    expect(vi.mocked(leaveCouple)).toHaveBeenCalledWith(expect.anything(), "user-123");
  });

  it("TU-86-8 : inviteCode généré par createCoupleAction est bien 6 chars uppercase alphanumériques", async () => {
    const { getCoupleByUserId, createCouple } = await import("@/lib/couple-queries");
    const capturedCodes: string[] = [];

    vi.mocked(getCoupleByUserId).mockResolvedValue(null);
    vi.mocked(createCouple).mockImplementation(async (_db, _userId, _name, code) => {
      capturedCodes.push(code);
      return {
        id: "c_test",
        invite_code: code,
        name: null,
        created_by: "user-123",
        created_at: 1700000000,
      };
    });

    const { createCoupleAction } = await import("@/app/actions/couple-actions");

    // Générer plusieurs codes pour vérifier le pattern
    for (let i = 0; i < 5; i++) {
      const form = new FormData();
      await createCoupleAction(null, form);
    }

    expect(capturedCodes).toHaveLength(5);
    for (const code of capturedCodes) {
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    }
  });
});
