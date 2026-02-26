/**
 * TU-108-1 à TU-108-5 — STORY-108
 * Tests unitaires : Landing page Stitch v2 (exports constants)
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children }: { children: unknown }) => children,
}));

describe("STORY-108 — Landing page Stitch v2", () => {
  // ── AC-4 : BENTO_FEATURES ≥ 4 items ──────────────────────────────────────

  it("TU-108-1 : BENTO_FEATURES contient au moins 4 items", async () => {
    const { BENTO_FEATURES } = await import("@/app/[locale]/(marketing)/page");
    expect(BENTO_FEATURES.length).toBeGreaterThanOrEqual(4);
  });

  // ── AC-3 : STEPS[0] = Import ──────────────────────────────────────────────

  it("TU-108-2 : STEPS[0] est l'étape Import (relevés bancaires)", async () => {
    const { STEPS } = await import("@/app/[locale]/(marketing)/page");
    const step0 = STEPS[0];
    const mentionsImport =
      step0.title.toLowerCase().includes("import") ||
      step0.desc.toLowerCase().includes("relevé") ||
      step0.desc.toLowerCase().includes("csv");
    expect(mentionsImport).toBe(true);
  });

  // ── AC-2 : Aucun step ne mentionne connexion directe ─────────────────────

  it("TU-108-3 : aucun step ne mentionne 'connexion directe' ou 'Safe Connect'", async () => {
    const { STEPS } = await import("@/app/[locale]/(marketing)/page");
    for (const step of STEPS) {
      expect(step.title.toLowerCase()).not.toContain("connexion directe");
      expect(step.desc.toLowerCase()).not.toContain("connexion directe");
      expect(step.title).not.toContain("Safe Connect");
      expect(step.desc).not.toContain("Safe Connect");
      expect(step.desc).not.toContain("Open Banking");
    }
  });

  // ── AC-5 : PRICING noms corrects ─────────────────────────────────────────

  it("TU-108-4 : PRICING_DISPLAY contient Découverte, Couple Pro, Unlimited", async () => {
    const { PRICING_DISPLAY } = await import("@/app/[locale]/(marketing)/page");
    const names = PRICING_DISPLAY.map((p) => p.name);
    expect(names).toContain("Découverte");
    expect(names).toContain("Couple Pro");
    expect(names).toContain("Unlimited");
  });

  // ── AC-5 : Couple Pro prix 4,90€ ─────────────────────────────────────────

  it("TU-108-5 : PRICING_DISPLAY Couple Pro affiche le prix '4,90€'", async () => {
    const { PRICING_DISPLAY } = await import("@/app/[locale]/(marketing)/page");
    const couplePro = PRICING_DISPLAY.find((p) => p.name === "Couple Pro");
    expect(couplePro).toBeDefined();
    expect(couplePro?.price).toBe("4,90€");
  });

  // ── AC-5 : badge Populaire sur Couple Pro ────────────────────────────────

  it("TU-108-5b : PRICING_DISPLAY Couple Pro a le badge 'Populaire'", async () => {
    const { PRICING_DISPLAY } = await import("@/app/[locale]/(marketing)/page");
    const couplePro = PRICING_DISPLAY.find((p) => p.name === "Couple Pro");
    expect(couplePro?.badge).toBe("Populaire");
  });

  // ── AC-3 : STEPS = exactement 3 étapes ───────────────────────────────────

  it("TU-108-6 : STEPS contient exactement 3 étapes", async () => {
    const { STEPS } = await import("@/app/[locale]/(marketing)/page");
    expect(STEPS).toHaveLength(3);
  });

  // ── AC-3 : STEPS[1] = Répartition, STEPS[2] = Vision ─────────────────────

  it("TU-108-7 : STEPS[1] = Répartition et STEPS[2] = Vision", async () => {
    const { STEPS } = await import("@/app/[locale]/(marketing)/page");
    expect(STEPS[1].title.toLowerCase()).toContain("répartition");
    expect(STEPS[2].title.toLowerCase()).toContain("vision");
  });

  // ── AC-4 : card Espace Couple est md:col-span-2 ───────────────────────────

  it("TU-108-8 : BENTO_FEATURES[0] est 'Espace Couple' avec colSpan 2", async () => {
    const { BENTO_FEATURES } = await import("@/app/[locale]/(marketing)/page");
    const couple = BENTO_FEATURES.find((f) => f.id === "couple");
    expect(couple).toBeDefined();
    expect(couple?.colSpan).toBe(2);
  });
});
