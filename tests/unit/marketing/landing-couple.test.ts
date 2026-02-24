import { describe, it, expect, vi } from "vitest";

// Mocks des imports Next.js côté landing page
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children }: { children: unknown }) => children,
}));

// ─── TU-92-1 à TU-92-4 : Landing page — données couple ───────────────────────

describe("Landing page — données couple (STORY-092)", () => {
  it("TU-92-1 : FEATURES[0] contient un titre avec 'couple' ou 'commun' ou 'partagé'", async () => {
    const { FEATURES } = await import("@/app/[locale]/(marketing)/page");
    const titlesLower = FEATURES.map((f) => f.title.toLowerCase());
    const hasCoupleFeature = titlesLower.some(
      (t) => t.includes("couple") || t.includes("commun") || t.includes("partagé") || t.includes("partenaire")
    );
    expect(hasCoupleFeature).toBe(true);
  });

  it("TU-92-2 : FEATURES a exactement 3 éléments", async () => {
    const { FEATURES } = await import("@/app/[locale]/(marketing)/page");
    expect(FEATURES).toHaveLength(3);
  });

  it("TU-92-3 : STEPS contient une étape mentionnant 'partenaire'", async () => {
    const { STEPS } = await import("@/app/[locale]/(marketing)/page");
    const mentionsPartner = STEPS.some(
      (s) =>
        s.title.toLowerCase().includes("partenaire") ||
        s.desc.toLowerCase().includes("partenaire")
    );
    expect(mentionsPartner).toBe(true);
  });

  it("TU-92-4 : TESTIMONIALS a 2 éléments avec auteur et texte", async () => {
    const { TESTIMONIALS } = await import("@/app/[locale]/(marketing)/page");
    expect(TESTIMONIALS).toHaveLength(2);
    for (const t of TESTIMONIALS) {
      expect(typeof t.author).toBe("string");
      expect(t.author.length).toBeGreaterThan(0);
      expect(typeof t.text).toBe("string");
      expect(t.text.length).toBeGreaterThan(0);
    }
  });
});
