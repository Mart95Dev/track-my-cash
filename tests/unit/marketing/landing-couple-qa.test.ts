/**
 * Tests QA complémentaires — STORY-092
 * Couvre les gaps identifiés par l'audit :
 *  - AC-1 : hero H1 "couple" via DESCRIPTIONS.fr
 *  - AC-4 : TESTIMONIALS.role non vide
 *  - AC-7 : COMPARISON_FEATURES — valeurs pro/premium correctes
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children }: { children: unknown }) => children,
}));
vi.mock("@/components/subscribe-button", () => ({
  SubscribeButton: () => null,
}));
vi.mock("@/lib/auth-utils", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/lib/subscription-utils", () => ({
  getUserPlanId: vi.fn().mockResolvedValue("free"),
}));

// ─── TU-92-9 : Landing page — DESCRIPTIONS SEO ───────────────────────────────

describe("Landing page — SEO description couple (STORY-092)", () => {
  it("TU-92-9 : DESCRIPTIONS.fr contient 'couple' (SEO pivotée couple)", async () => {
    const { DESCRIPTIONS } = await import("@/app/[locale]/(marketing)/page");
    expect(DESCRIPTIONS.fr.toLowerCase()).toContain("couple");
  });
});

// ─── TU-92-10 : TESTIMONIALS — champ role défini ─────────────────────────────

describe("Landing page — TESTIMONIALS role défini (STORY-092)", () => {
  it("TU-92-10 : chaque témoignage a un role non vide", async () => {
    const { TESTIMONIALS } = await import("@/app/[locale]/(marketing)/page");
    for (const t of TESTIMONIALS) {
      expect(typeof t.role).toBe("string");
      expect(t.role.length).toBeGreaterThan(0);
    }
  });
});

// ─── TU-92-11 : FEATURES — bullets non vides ─────────────────────────────────

describe("Landing page — FEATURES bullets non vides (STORY-092)", () => {
  it("TU-92-11 : chaque feature a au moins 1 bullet", async () => {
    const { FEATURES } = await import("@/app/[locale]/(marketing)/page");
    for (const f of FEATURES) {
      expect(Array.isArray(f.bullets)).toBe(true);
      expect(f.bullets.length).toBeGreaterThanOrEqual(1);
    }
  });
});

// ─── TU-92-12 : COMPARISON_FEATURES — valeurs couple correctes ───────────────

describe("Tarifs page — valeurs couple dans COMPARISON_FEATURES (STORY-092)", () => {
  it("TU-92-12 : 'Partage couple' est pro=true et premium=true", async () => {
    const { COMPARISON_FEATURES } = await import(
      "@/app/[locale]/(marketing)/tarifs/page"
    );
    const row = COMPARISON_FEATURES.find((r) =>
      r.label.toLowerCase().includes("partage couple")
    );
    expect(row).toBeDefined();
    expect(row!.pro).toBe(true);
    expect(row!.premium).toBe(true);
    // Gratuit n'y a pas accès
    expect(row!.free).toBe(false);
  });

  it("TU-92-13 : 'IA conseiller couple' est pro=false et premium=true (gate Premium)", async () => {
    const { COMPARISON_FEATURES } = await import(
      "@/app/[locale]/(marketing)/tarifs/page"
    );
    const row = COMPARISON_FEATURES.find(
      (r) =>
        r.label.toLowerCase().includes("ia") &&
        r.label.toLowerCase().includes("couple")
    );
    expect(row).toBeDefined();
    expect(row!.pro).toBe(false);
    expect(row!.premium).toBe(true);
    expect(row!.free).toBe(false);
  });
});
