import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── TU-89-1 à TU-89-6 : canUseCoupleFeature + canUsePremiumCoupleFeature ────
// Les tests utilisent vi.doMock (non-hoisted) + vi.resetModules() pour
// configurer dynamiquement le plan retourné par getUserPlanId.

// ─── TU-89-1 : canUseCoupleFeature plan free → { allowed: false, reason } ────

describe("subscription-utils — canUseCoupleFeature (plan free)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/db", () => ({
      getDb: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue({
          rows: [{ plan_id: "free", status: "active", trial_ends_at: null }],
        }),
      }),
    }));
    vi.doMock("@/lib/ai-usage", () => ({
      getAiUsageCount: vi.fn().mockResolvedValue(0),
      checkAiLimit: vi.fn().mockReturnValue({ allowed: true }),
    }));
  });

  it("TU-89-1 : plan free → { allowed: false, reason: '...' }", async () => {
    const { canUseCoupleFeature } = await import("@/lib/subscription-utils");
    const result = await canUseCoupleFeature("user-free");

    expect(result.allowed).toBe(false);
    expect(typeof result.reason).toBe("string");
    expect((result.reason ?? "").length).toBeGreaterThan(0);
  });
});

// ─── TU-89-2 : canUseCoupleFeature plan pro → { allowed: true } ──────────────

describe("subscription-utils — canUseCoupleFeature (plan pro)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/db", () => ({
      getDb: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue({
          rows: [{ plan_id: "pro", status: "active", trial_ends_at: null }],
        }),
      }),
    }));
    vi.doMock("@/lib/ai-usage", () => ({
      getAiUsageCount: vi.fn().mockResolvedValue(0),
      checkAiLimit: vi.fn().mockReturnValue({ allowed: true }),
    }));
  });

  it("TU-89-2 : plan pro → { allowed: true }", async () => {
    const { canUseCoupleFeature } = await import("@/lib/subscription-utils");
    const result = await canUseCoupleFeature("user-pro");

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });
});

// ─── TU-89-3 : canUseCoupleFeature plan premium → { allowed: true } ──────────

describe("subscription-utils — canUseCoupleFeature (plan premium)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/db", () => ({
      getDb: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue({
          rows: [{ plan_id: "premium", status: "active", trial_ends_at: null }],
        }),
      }),
    }));
    vi.doMock("@/lib/ai-usage", () => ({
      getAiUsageCount: vi.fn().mockResolvedValue(0),
      checkAiLimit: vi.fn().mockReturnValue({ allowed: true }),
    }));
  });

  it("TU-89-3 : plan premium → { allowed: true }", async () => {
    const { canUseCoupleFeature } = await import("@/lib/subscription-utils");
    const result = await canUseCoupleFeature("user-premium");

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });
});

// ─── TU-89-4 : canUsePremiumCoupleFeature plan free → { allowed: false } ─────

describe("subscription-utils — canUsePremiumCoupleFeature (plan free)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/db", () => ({
      getDb: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue({
          rows: [{ plan_id: "free", status: "active", trial_ends_at: null }],
        }),
      }),
    }));
    vi.doMock("@/lib/ai-usage", () => ({
      getAiUsageCount: vi.fn().mockResolvedValue(0),
      checkAiLimit: vi.fn().mockReturnValue({ allowed: true }),
    }));
  });

  it("TU-89-4 : plan free → { allowed: false }", async () => {
    const { canUsePremiumCoupleFeature } = await import("@/lib/subscription-utils");
    const result = await canUsePremiumCoupleFeature("user-free");

    expect(result.allowed).toBe(false);
    expect(typeof result.reason).toBe("string");
    expect((result.reason ?? "").length).toBeGreaterThan(0);
  });
});

// ─── TU-89-5 : canUsePremiumCoupleFeature plan pro → { allowed: false } ──────

describe("subscription-utils — canUsePremiumCoupleFeature (plan pro)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/db", () => ({
      getDb: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue({
          rows: [{ plan_id: "pro", status: "active", trial_ends_at: null }],
        }),
      }),
    }));
    vi.doMock("@/lib/ai-usage", () => ({
      getAiUsageCount: vi.fn().mockResolvedValue(0),
      checkAiLimit: vi.fn().mockReturnValue({ allowed: true }),
    }));
  });

  it("TU-89-5 : plan pro → { allowed: false }", async () => {
    const { canUsePremiumCoupleFeature } = await import("@/lib/subscription-utils");
    const result = await canUsePremiumCoupleFeature("user-pro");

    expect(result.allowed).toBe(false);
    expect(typeof result.reason).toBe("string");
    expect((result.reason ?? "").length).toBeGreaterThan(0);
  });
});

// ─── TU-89-6 : canUsePremiumCoupleFeature plan premium → { allowed: true } ───

describe("subscription-utils — canUsePremiumCoupleFeature (plan premium)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("@/lib/db", () => ({
      getDb: vi.fn().mockReturnValue({
        execute: vi.fn().mockResolvedValue({
          rows: [{ plan_id: "premium", status: "active", trial_ends_at: null }],
        }),
      }),
    }));
    vi.doMock("@/lib/ai-usage", () => ({
      getAiUsageCount: vi.fn().mockResolvedValue(0),
      checkAiLimit: vi.fn().mockReturnValue({ allowed: true }),
    }));
  });

  it("TU-89-6 : plan premium → { allowed: true }", async () => {
    const { canUsePremiumCoupleFeature } = await import("@/lib/subscription-utils");
    const result = await canUsePremiumCoupleFeature("user-premium");

    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });
});

// ─── TU-89-7 : UpgradeReason inclut couple_pro et couple_premium ─────────────

describe("use-upgrade-modal — UpgradeReason inclut les reasons couple", () => {
  it("TU-89-7 : UpgradeReason inclut 'couple_pro' et 'couple_premium' (vérification via UPGRADE_CONFIGS)", async () => {
    const { UPGRADE_CONFIGS } = await import("@/hooks/use-upgrade-modal");

    // Si les clés sont présentes dans UPGRADE_CONFIGS, le type UpgradeReason les inclut
    const keys = Object.keys(UPGRADE_CONFIGS);
    expect(keys).toContain("couple_pro");
    expect(keys).toContain("couple_premium");
  });
});

// ─── TU-89-8 : UPGRADE_CONFIGS["couple_pro"] targetPlan = "pro" ──────────────

describe("use-upgrade-modal — UPGRADE_CONFIGS couple_pro", () => {
  it("TU-89-8 : UPGRADE_CONFIGS['couple_pro'] existe et a targetPlan 'pro'", async () => {
    const { UPGRADE_CONFIGS } = await import("@/hooks/use-upgrade-modal");

    expect(UPGRADE_CONFIGS).toHaveProperty("couple_pro");
    expect(UPGRADE_CONFIGS.couple_pro.targetPlan).toBe("pro");
    expect(UPGRADE_CONFIGS.couple_pro.features.length).toBeGreaterThanOrEqual(3);
    expect(typeof UPGRADE_CONFIGS.couple_pro.title).toBe("string");
    expect(typeof UPGRADE_CONFIGS.couple_pro.description).toBe("string");
  });
});

// ─── TU-89-9 : UPGRADE_CONFIGS["couple_premium"] targetPlan = "premium" ──────

describe("use-upgrade-modal — UPGRADE_CONFIGS couple_premium", () => {
  it("TU-89-9 : UPGRADE_CONFIGS['couple_premium'] existe et a targetPlan 'premium'", async () => {
    const { UPGRADE_CONFIGS } = await import("@/hooks/use-upgrade-modal");

    expect(UPGRADE_CONFIGS).toHaveProperty("couple_premium");
    expect(UPGRADE_CONFIGS.couple_premium.targetPlan).toBe("premium");
    expect(UPGRADE_CONFIGS.couple_premium.features.length).toBeGreaterThanOrEqual(3);
    expect(typeof UPGRADE_CONFIGS.couple_premium.title).toBe("string");
    expect(typeof UPGRADE_CONFIGS.couple_premium.description).toBe("string");
  });
});
