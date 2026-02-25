/**
 * TU-93-1 à TU-93-4 — STORY-093
 * Tests unitaires : getOnboardingStatus + markOnboardingCompleteAction
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Client } from "@libsql/client";

// ─── Mocks Server Action ───────────────────────────────────────────────────────

vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-123"),
  getRequiredSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn(),
  getDb: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// ─── TU-93-3 / TU-93-4 : getOnboardingStatus ─────────────────────────────────

describe("couple-queries — getOnboardingStatus (STORY-093)", () => {
  let mockDb: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-93-3 : retourne false si le setting est absent", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [],
    });
    const { getOnboardingStatus } = await import("@/lib/couple-queries");
    const result = await getOnboardingStatus(mockDb);
    expect(result).toBe(false);
  });

  it("TU-93-4 : retourne true si onboarding_couple_completed = 'true'", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ value: "true" }],
    });
    const { getOnboardingStatus } = await import("@/lib/couple-queries");
    const result = await getOnboardingStatus(mockDb);
    expect(result).toBe(true);
  });

  it("retourne false si la valeur est 'false'", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ value: "false" }],
    });
    const { getOnboardingStatus } = await import("@/lib/couple-queries");
    const result = await getOnboardingStatus(mockDb);
    expect(result).toBe(false);
  });
});

// ─── TU-93-1 / TU-93-2 : markOnboardingCompleteAction ────────────────────────

describe("couple-actions — markOnboardingCompleteAction (STORY-093)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("TU-93-1 : insère onboarding_couple_completed=true dans settings", async () => {
    const mockExecute = vi.fn().mockResolvedValue({ rows: [] });
    const mockDb = { execute: mockExecute } as unknown as Client;

    const { getUserDb } = await import("@/lib/db");
    (getUserDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

    const { markOnboardingCompleteAction } = await import(
      "@/app/actions/couple-actions"
    );
    await markOnboardingCompleteAction();

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        sql: expect.stringContaining("INSERT OR REPLACE INTO settings"),
        args: expect.arrayContaining(["onboarding_couple_completed", "true"]),
      })
    );
  });

  it("TU-93-2 : idempotente — appelée 2 fois sans erreur", async () => {
    const mockExecute = vi.fn().mockResolvedValue({ rows: [] });
    const mockDb = { execute: mockExecute } as unknown as Client;

    const { getUserDb } = await import("@/lib/db");
    (getUserDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

    const { markOnboardingCompleteAction } = await import(
      "@/app/actions/couple-actions"
    );
    await markOnboardingCompleteAction();
    await markOnboardingCompleteAction();

    // Deux appels réussis sans throw
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });
});
