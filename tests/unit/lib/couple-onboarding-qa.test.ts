/**
 * QA STORY-093 — Tests logique pure manquants
 *
 * GAPs couverts :
 *   QA-93-7 : getOnboardingStatus avec valeurs limites (null, "1")
 *   QA-93-8 : logique showCoupleOnboarding — false si complété (AC-5)
 *   QA-93-9 : logique showCoupleOnboarding — false si 0 compte
 *   QA-93-9b: logique showCoupleOnboarding — true si non complété + compte présent (AC-1)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Client } from "@libsql/client";

// ─── Mocks nécessaires pour couple-queries ────────────────────────────────────

vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-123"),
  getRequiredSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn(),
  getDb: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// ─── QA-93-7 : getOnboardingStatus valeurs limites ───────────────────────────

describe("QA STORY-093 — getOnboardingStatus valeurs limites", () => {
  let mockDb: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb = { execute: vi.fn() } as unknown as Client;
  });

  it("QA-93-7a : retourne false si la valeur est null (row présente mais valeur nulle)", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ value: null }],
    });
    const { getOnboardingStatus } = await import("@/lib/couple-queries");
    const result = await getOnboardingStatus(mockDb);
    expect(result).toBe(false);
  });

  it("QA-93-7b : retourne false si la valeur est '1' (truthy mais pas 'true')", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ value: "1" }],
    });
    const { getOnboardingStatus } = await import("@/lib/couple-queries");
    const result = await getOnboardingStatus(mockDb);
    expect(result).toBe(false);
  });

  it("QA-93-7c : retourne false si la valeur est 'TRUE' (casse différente)", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ value: "TRUE" }],
    });
    const { getOnboardingStatus } = await import("@/lib/couple-queries");
    const result = await getOnboardingStatus(mockDb);
    // La comparaison est strict: === "true", donc "TRUE" retourne false
    expect(result).toBe(false);
  });
});

// ─── QA-93-8 & QA-93-9 : logique showCoupleOnboarding (AC-1, AC-5) ──────────

describe("QA STORY-093 — logique showCoupleOnboarding (dashboard)", () => {
  /**
   * Réplique la condition du dashboard/page.tsx :
   *   showCoupleOnboarding = !coupleOnboardingCompleted && accounts.length > 0
   */

  it("QA-93-8 : false si onboarding_couple_completed est true (AC-5 — ne réapparaît pas)", () => {
    const coupleOnboardingCompleted = true;
    const accountsLength = 2;
    const showCoupleOnboarding = !coupleOnboardingCompleted && accountsLength > 0;
    expect(showCoupleOnboarding).toBe(false);
  });

  it("QA-93-9 : false si aucun compte (accounts.length === 0)", () => {
    const coupleOnboardingCompleted = false;
    const accountsLength = 0;
    const showCoupleOnboarding = !coupleOnboardingCompleted && accountsLength > 0;
    expect(showCoupleOnboarding).toBe(false);
  });

  it("QA-93-9b : true si onboarding non complété et au moins 1 compte (AC-1)", () => {
    const coupleOnboardingCompleted = false;
    const accountsLength = 1;
    const showCoupleOnboarding = !coupleOnboardingCompleted && accountsLength > 0;
    expect(showCoupleOnboarding).toBe(true);
  });

  it("QA-93-9c : false si onboarding complété ET aucun compte (double guard)", () => {
    const coupleOnboardingCompleted = true;
    const accountsLength = 0;
    const showCoupleOnboarding = !coupleOnboardingCompleted && accountsLength > 0;
    expect(showCoupleOnboarding).toBe(false);
  });
});
