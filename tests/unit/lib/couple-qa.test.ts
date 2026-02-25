/**
 * QA Sprint v14 — Tests supplémentaires (FORGE QA Agent)
 * Fichier : tests/unit/lib/couple-qa.test.ts
 *
 * Couvre les GAPs identifiés lors de l'audit des stories 100–106.
 * Chaque describe est préfixé QA-STORY-1XX pour distinguer du Dev.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Client } from "@libsql/client";

// ─── Mocks globaux ────────────────────────────────────────────────────────────

vi.mock("@/lib/auth-utils", () => ({
  getRequiredUserId: vi.fn().mockResolvedValue("user-qa"),
  getRequiredSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getUserDb: vi.fn(),
  getDb: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// ═══════════════════════════════════════════════════════════════════════════════
// QA STORY-100 : couple-queries — getOnboardingChoice
// ═══════════════════════════════════════════════════════════════════════════════

describe("QA STORY-100 — getOnboardingChoice valeur exacte", () => {
  let mockDb: Client;

  beforeEach(() => {
    vi.resetModules();
    mockDb = { execute: vi.fn() } as unknown as Client;
  });

  it("QA-100-4 : retourne exactement la chaîne 'couple' (pas 'Couple' ni autre variante)", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ value: "couple" }],
    });
    const { getOnboardingChoice } = await import("@/lib/couple-queries");
    const result = await getOnboardingChoice(mockDb);
    expect(result).toBe("couple");
    expect(result).not.toBe("Couple");
    expect(result).not.toBe("COUPLE");
  });

  it("QA-100-4b : retourne exactement 'solo' quand la valeur est 'solo'", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [{ value: "solo" }],
    });
    const { getOnboardingChoice } = await import("@/lib/couple-queries");
    const result = await getOnboardingChoice(mockDb);
    expect(result).toBe("solo");
    expect(result).not.toBe("Solo");
  });

  it("QA-100-4c : le type de retour est string | null, jamais undefined", async () => {
    (mockDb.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      rows: [],
    });
    const { getOnboardingChoice } = await import("@/lib/couple-queries");
    const result = await getOnboardingChoice(mockDb);
    expect(result).toBeNull();
    expect(result).not.toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// QA STORY-104 : renderCoupleReminderEmail — structure HTML + code en évidence
// ═══════════════════════════════════════════════════════════════════════════════

describe("QA STORY-104 — renderCoupleReminderEmail structure HTML", () => {
  // Import direct car pas de dépendances DB pour cette fonction pure
  it("QA-104-1 : le code invite est rendu en évidence (dans un élément structuré)", async () => {
    const { renderCoupleReminderEmail } = await import("@/lib/email-templates");
    const html = renderCoupleReminderEmail("INVITE1", 1);
    // Le code doit apparaître dans le HTML
    expect(html).toContain("INVITE1");
    // Le code doit être dans un contexte mis en valeur :
    // soit dans un style inline, soit dans un div dédié "Code d'invitation"
    const inviteBlockPresent =
      html.includes("Code d") && html.includes("INVITE1");
    expect(inviteBlockPresent).toBe(true);
  });

  it("QA-104-1b : le code invite day=3 est bien rendu en évidence", async () => {
    const { renderCoupleReminderEmail } = await import("@/lib/email-templates");
    const html = renderCoupleReminderEmail("SHARE99", 3);
    expect(html).toContain("SHARE99");
    // Le code doit figurer dans le bloc centré (style text-align center ou background)
    expect(html.toLowerCase()).toContain("background");
  });

  it("QA-104-1c : le code invite day=7 est bien rendu en évidence", async () => {
    const { renderCoupleReminderEmail } = await import("@/lib/email-templates");
    const html = renderCoupleReminderEmail("WEEK007", 7);
    expect(html).toContain("WEEK007");
    // Letter-spacing appliqué pour le rendu visuel du code
    expect(html).toContain("letter-spacing");
  });

  it("QA-104-2 : retourne un HTML valide avec structure DOCTYPE + html + body", async () => {
    const { renderCoupleReminderEmail } = await import("@/lib/email-templates");
    const html = renderCoupleReminderEmail("VALID01", 1);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("<body");
    expect(html).toContain("</html>");
    expect(html).toContain("</body>");
  });

  it("QA-104-2b : contient la structure head avec charset UTF-8", async () => {
    const { renderCoupleReminderEmail } = await import("@/lib/email-templates");
    const html = renderCoupleReminderEmail("UTF8OK", 3);
    expect(html).toContain("<head");
    expect(html.toLowerCase()).toContain("charset");
    expect(html).toContain("UTF-8");
  });

  it("QA-104-2c : le titre TrackMyCash est présent dans le head", async () => {
    const { renderCoupleReminderEmail } = await import("@/lib/email-templates");
    const html = renderCoupleReminderEmail("TITLE01", 1);
    expect(html).toContain("TrackMyCash");
    // TrackMyCash doit être présent au moins 2 fois (titre + contenu)
    const occurrences = (html.match(/TrackMyCash/g) ?? []).length;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// QA STORY-105 : computeOnboardingProgress — invariants supplémentaires
// ═══════════════════════════════════════════════════════════════════════════════

describe("QA STORY-105 — computeOnboardingProgress invariants", () => {
  it("QA-105-1 : total est toujours exactement 4 (invariant)", async () => {
    const { computeOnboardingProgress } = await import("@/lib/onboarding-progress");

    const cases = [
      { hasTransactions: false, hasPartner: false, hasCoupleBudget: false },
      { hasTransactions: true,  hasPartner: false, hasCoupleBudget: false },
      { hasTransactions: true,  hasPartner: true,  hasCoupleBudget: false },
      { hasTransactions: true,  hasPartner: true,  hasCoupleBudget: true  },
      { hasTransactions: false, hasPartner: true,  hasCoupleBudget: true  },
      { hasTransactions: false, hasPartner: false, hasCoupleBudget: true  },
    ];

    for (const c of cases) {
      const result = computeOnboardingProgress(c);
      expect(result.total).toBe(4);
    }
  });

  it("QA-105-2a : percentage = Math.round((completed/4)*100)", async () => {
    const { computeOnboardingProgress } = await import("@/lib/onboarding-progress");

    // 1/4 = 25%
    const r1 = computeOnboardingProgress({ hasTransactions: false, hasPartner: false, hasCoupleBudget: false });
    expect(r1.percentage).toBe(Math.round((1 / 4) * 100)); // 25

    // 2/4 = 50%
    const r2 = computeOnboardingProgress({ hasTransactions: true, hasPartner: false, hasCoupleBudget: false });
    expect(r2.percentage).toBe(Math.round((2 / 4) * 100)); // 50

    // 3/4 = 75%
    const r3 = computeOnboardingProgress({ hasTransactions: true, hasPartner: true, hasCoupleBudget: false });
    expect(r3.percentage).toBe(Math.round((3 / 4) * 100)); // 75

    // 4/4 = 100%
    const r4 = computeOnboardingProgress({ hasTransactions: true, hasPartner: true, hasCoupleBudget: true });
    expect(r4.percentage).toBe(100);
  });

  it("QA-105-2b : percentage ne dépasse jamais 100", async () => {
    const { computeOnboardingProgress } = await import("@/lib/onboarding-progress");
    const result = computeOnboardingProgress({ hasTransactions: true, hasPartner: true, hasCoupleBudget: true });
    expect(result.percentage).toBeLessThanOrEqual(100);
    expect(result.percentage).toBeGreaterThanOrEqual(0);
  });

  it("QA-105-2c : percentage est un entier (arrondi)", async () => {
    const { computeOnboardingProgress } = await import("@/lib/onboarding-progress");
    const result = computeOnboardingProgress({ hasTransactions: false, hasPartner: false, hasCoupleBudget: false });
    expect(Number.isInteger(result.percentage)).toBe(true);
  });

  it("QA-105-3 : 'Compte créé' est toujours la première étape", async () => {
    const { computeOnboardingProgress } = await import("@/lib/onboarding-progress");
    const result = computeOnboardingProgress({ hasTransactions: false, hasPartner: false, hasCoupleBudget: false });
    expect(result.steps[0].label).toBe("Compte créé");
    expect(result.steps[0].completed).toBe(true);
    expect(result.completed).toBeGreaterThanOrEqual(1);
  });

  it("QA-105-3b : completed minimum = 1 même si tout à false (Compte créé toujours true)", async () => {
    const { computeOnboardingProgress } = await import("@/lib/onboarding-progress");
    const result = computeOnboardingProgress({ hasTransactions: false, hasPartner: false, hasCoupleBudget: false });
    expect(result.completed).toBe(1);
    // Ce qui correspond à "1 / 4" dans la barre
    expect(result.total).toBe(4);
  });

  it("QA-105-4 : hasCoupleBudget=true seul (sans hasTransactions ni hasPartner) → completed=2", async () => {
    const { computeOnboardingProgress } = await import("@/lib/onboarding-progress");
    const result = computeOnboardingProgress({
      hasTransactions: false,
      hasPartner: false,
      hasCoupleBudget: true,
    });
    expect(result.completed).toBe(2);
    expect(result.total).toBe(4);
    expect(result.percentage).toBe(50);
  });

  it("QA-105-4b : hasPartner=true seul (sans hasTransactions ni hasCoupleBudget) → completed=2", async () => {
    const { computeOnboardingProgress } = await import("@/lib/onboarding-progress");
    const result = computeOnboardingProgress({
      hasTransactions: false,
      hasPartner: true,
      hasCoupleBudget: false,
    });
    expect(result.completed).toBe(2);
    expect(result.total).toBe(4);
  });

  it("QA-105-4c : icônes Material Symbols présentes sur les étapes (account_balance_wallet, receipt_long, favorite, savings)", async () => {
    const { computeOnboardingProgress } = await import("@/lib/onboarding-progress");
    const result = computeOnboardingProgress({
      hasTransactions: false,
      hasPartner: false,
      hasCoupleBudget: false,
    });
    const icons = result.steps.map((s) => s.icon);
    expect(icons).toContain("account_balance_wallet");
    expect(icons).toContain("receipt_long");
    expect(icons).toContain("favorite");
    expect(icons).toContain("savings");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// QA STORY-106 : getCoupleState + getActiveMemberCount — cas limites
// ═══════════════════════════════════════════════════════════════════════════════

describe("QA STORY-106 — getCoupleState cas limites", () => {
  it("QA-106-1 : getCoupleState('none') si couple=null, memberCount ignoré (même si >0)", async () => {
    const { getCoupleState } = await import("@/lib/couple-hub");
    // memberCount ignoré si couple est null
    expect(getCoupleState(null, 0)).toBe("none");
    expect(getCoupleState(null, 1)).toBe("none");
    expect(getCoupleState(null, 2)).toBe("none");
    expect(getCoupleState(null, 99)).toBe("none");
  });

  it("QA-106-2 : getCoupleState('complete') si memberCount >= 2", async () => {
    const { getCoupleState } = await import("@/lib/couple-hub");
    const couple = { id: "couple-qa" };
    expect(getCoupleState(couple, 2)).toBe("complete");
    expect(getCoupleState(couple, 3)).toBe("complete");
    expect(getCoupleState(couple, 10)).toBe("complete");
  });

  it("QA-106-2b : getCoupleState('pending') si couple existe mais memberCount < 2", async () => {
    const { getCoupleState } = await import("@/lib/couple-hub");
    const couple = { id: "couple-qa" };
    expect(getCoupleState(couple, 0)).toBe("pending");
    expect(getCoupleState(couple, 1)).toBe("pending");
  });

  it("QA-106-3 : getActiveMemberCount filtre strictement par status='active'", async () => {
    const { getActiveMemberCount } = await import("@/lib/couple-hub");

    // Statuts variés — seul 'active' compte
    const members = [
      { status: "active" },
      { status: "inactive" },
      { status: "left" },
      { status: "pending" },
      { status: "ACTIVE" },   // Majuscules ne comptent pas (filtre strict)
      { status: "Active" },   // Capitalisation ne compte pas
    ];
    // Seul le premier est 'active' (exact match)
    expect(getActiveMemberCount(members)).toBe(1);
  });

  it("QA-106-3b : getActiveMemberCount retourne 0 si tableau vide", async () => {
    const { getActiveMemberCount } = await import("@/lib/couple-hub");
    expect(getActiveMemberCount([])).toBe(0);
  });

  it("QA-106-3c : getActiveMemberCount compte correctement 2 membres actifs", async () => {
    const { getActiveMemberCount } = await import("@/lib/couple-hub");
    const members = [
      { status: "active" },
      { status: "active" },
      { status: "left" },
    ];
    expect(getActiveMemberCount(members)).toBe(2);
  });

  it("QA-106-1b : getCoupleState retourne exactement les 3 valeurs 'none'|'pending'|'complete'", async () => {
    const { getCoupleState } = await import("@/lib/couple-hub");
    const validValues = ["none", "pending", "complete"] as const;
    const couple = { id: "c-1" };

    const r1 = getCoupleState(null, 0);
    const r2 = getCoupleState(couple, 1);
    const r3 = getCoupleState(couple, 2);

    expect(validValues).toContain(r1);
    expect(validValues).toContain(r2);
    expect(validValues).toContain(r3);
  });
});
