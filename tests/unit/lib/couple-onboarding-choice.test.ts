/**
 * TU-100-1 à TU-100-4 — STORY-100
 * Tests unitaires : getOnboardingChoice + setOnboardingChoiceAction
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Client } from "@libsql/client";

// ─── Mocks globaux ────────────────────────────────────────────────────────────

vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-100"),
  getRequiredSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn(),
  getDb: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// ─── TU-100-1/2/3 : getOnboardingChoice ──────────────────────────────────────

describe("couple-queries — getOnboardingChoice (STORY-100)", () => {
  let mockDb: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb = { execute: vi.fn() } as unknown as Client;
  });

  it("TU-100-1 : retourne null si la ligne est absente", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [],
    });
    const { getOnboardingChoice } = await import("@/lib/couple-queries");
    const result = await getOnboardingChoice(mockDb);
    expect(result).toBeNull();
  });

  it("TU-100-2 : retourne 'couple' si SET à 'couple'", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ value: "couple" }],
    });
    const { getOnboardingChoice } = await import("@/lib/couple-queries");
    const result = await getOnboardingChoice(mockDb);
    expect(result).toBe("couple");
  });

  it("TU-100-3 : retourne 'solo' si SET à 'solo'", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ value: "solo" }],
    });
    const { getOnboardingChoice } = await import("@/lib/couple-queries");
    const result = await getOnboardingChoice(mockDb);
    expect(result).toBe("solo");
  });
});

// ─── TU-100-4 : setOnboardingChoiceAction ────────────────────────────────────

describe("couple-actions — setOnboardingChoiceAction (STORY-100)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("TU-100-4a : insère onboarding_choice='couple' dans settings", async () => {
    const mockExecute = vi.fn().mockResolvedValue({ rows: [] });
    const mockDb = { execute: mockExecute } as unknown as Client;

    const { getUserDb } = await import("@/lib/db");
    (getUserDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

    const { setOnboardingChoiceAction } = await import(
      "@/app/actions/couple-actions"
    );
    await setOnboardingChoiceAction("couple");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        sql: expect.stringContaining("INSERT OR REPLACE INTO settings"),
        args: expect.arrayContaining(["onboarding_choice", "couple"]),
      })
    );
  });

  it("TU-100-4b : insère onboarding_choice='solo' dans settings", async () => {
    const mockExecute = vi.fn().mockResolvedValue({ rows: [] });
    const mockDb = { execute: mockExecute } as unknown as Client;

    const { getUserDb } = await import("@/lib/db");
    (getUserDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

    const { setOnboardingChoiceAction } = await import(
      "@/app/actions/couple-actions"
    );
    await setOnboardingChoiceAction("solo");

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        sql: expect.stringContaining("INSERT OR REPLACE INTO settings"),
        args: expect.arrayContaining(["onboarding_choice", "solo"]),
      })
    );
  });

  it("TU-100-4c : idempotente — appelée 2 fois sans erreur", async () => {
    const mockExecute = vi.fn().mockResolvedValue({ rows: [] });
    const mockDb = { execute: mockExecute } as unknown as Client;

    const { getUserDb } = await import("@/lib/db");
    (getUserDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

    const { setOnboardingChoiceAction } = await import(
      "@/app/actions/couple-actions"
    );
    await setOnboardingChoiceAction("couple");
    await setOnboardingChoiceAction("solo");

    expect(mockExecute).toHaveBeenCalledTimes(2);
  });
});
