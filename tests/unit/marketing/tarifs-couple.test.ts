import { describe, it, expect, vi } from "vitest";

// ─── TU-92-5 à TU-92-6 : stripe-plans — features couple ─────────────────────

describe("PLANS — features couple (STORY-092)", () => {
  it("TU-92-5 : PLANS.pro.features contient 'couple' ou 'partenaire'", async () => {
    const { PLANS } = await import("@/lib/stripe-plans");
    const hasCouple = PLANS.pro.features.some(
      (f) => f.toLowerCase().includes("couple") || f.toLowerCase().includes("partenaire")
    );
    expect(hasCouple).toBe(true);
  });

  it("TU-92-6 : PLANS.premium.features contient 'couple'", async () => {
    const { PLANS } = await import("@/lib/stripe-plans");
    const hasCouple = PLANS.premium.features.some(
      (f) => f.toLowerCase().includes("couple")
    );
    expect(hasCouple).toBe(true);
  });
});

// ─── TU-92-7 à TU-92-8 : tarifs page — lignes couple ─────────────────────────

// Mocks pour la page tarifs (Server Component avec auth)
vi.mock("@/components/subscribe-button", () => ({
  SubscribeButton: () => null,
}));
vi.mock("@/lib/auth-utils", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/lib/subscription-utils", () => ({
  getUserPlanId: vi.fn().mockResolvedValue("free"),
}));
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children }: { children: unknown }) => children,
}));

describe("Tarifs page — lignes couple (STORY-092)", () => {
  it("TU-92-7 : COMPARISON_FEATURES contient une ligne 'Partage couple'", async () => {
    const { COMPARISON_FEATURES } = await import(
      "@/app/[locale]/(marketing)/tarifs/page"
    );
    const hasPartage = COMPARISON_FEATURES.some(
      (r) => r.label.toLowerCase().includes("partage") || r.label.toLowerCase().includes("couple")
    );
    expect(hasPartage).toBe(true);
  });

  it("TU-92-8 : COMPARISON_FEATURES contient une ligne 'IA couple'", async () => {
    const { COMPARISON_FEATURES } = await import(
      "@/app/[locale]/(marketing)/tarifs/page"
    );
    const hasIaCouple = COMPARISON_FEATURES.some(
      (r) =>
        r.label.toLowerCase().includes("ia couple") ||
        (r.label.toLowerCase().includes("ia") && r.label.toLowerCase().includes("couple"))
    );
    expect(hasIaCouple).toBe(true);
  });
});
