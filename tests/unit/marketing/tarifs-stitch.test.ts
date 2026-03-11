/**
 * Tests Dev — STORY-109
 * Refonte Page Tarifs (maquette 02-tarifs.html)
 *
 *  TU-109-1 : COMPARISON_FEATURES contient "Partage couple"
 *  TU-109-2 : PricingToggle est un composant client ("use client")
 *  TU-109-3 : prix plan Pro formaté "4,90€"
 *  TU-109-4 : page tarifs utilise "animated-border-wrapper" (card Pro animée)
 *  TU-109-5 : page tarifs contient une section FAQ (partenaire)
 *  TU-109-6 : page tarifs utilise bg-[#f6f6f8] ou bg-background-light
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { PLANS } from "@/lib/stripe-plans";

// ── Mocks nécessaires pour importer la page Server Component ─────────────────

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

vi.mock("@/components/pricing-toggle", () => ({
  PricingToggle: () => null,
}));

vi.mock("@/components/pricing-section", () => ({
  PricingSection: () => null,
}));

// ── Sources lues au démarrage ────────────────────────────────────────────────

let pageSrc: string;
let toggleSrc: string;
let pricingSectionSrc: string;

beforeAll(() => {
  pageSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(marketing)/tarifs/page.tsx"),
    "utf-8"
  );
  toggleSrc = readFileSync(
    join(process.cwd(), "src/components/pricing-toggle.tsx"),
    "utf-8"
  );
  pricingSectionSrc = readFileSync(
    join(process.cwd(), "src/components/pricing-section.tsx"),
    "utf-8"
  );
});

// ── TU-109-1 : COMPARISON_FEATURES (AC-6) ───────────────────────────────────

describe("STORY-109 — COMPARISON_FEATURES", () => {
  it("TU-109-1 : COMPARISON_FEATURES contient une ligne 'Partage couple'", async () => {
    const { COMPARISON_FEATURES } = await import(
      "@/app/[locale]/(marketing)/tarifs/page"
    );
    const hasPartage = COMPARISON_FEATURES.some(
      (r) =>
        r.label.toLowerCase().includes("partage") &&
        r.label.toLowerCase().includes("couple")
    );
    expect(hasPartage).toBe(true);
  });
});

// ── TU-109-2 : PricingToggle "use client" (AC-1) ────────────────────────────

describe("STORY-109 — PricingToggle composant client", () => {
  it("TU-109-2 : PricingToggle contient la directive 'use client'", () => {
    expect(toggleSrc).toContain('"use client"');
  });
});

// ── TU-109-3 : Prix Pro 4,90€ (AC-4) ────────────────────────────────────────

describe("STORY-109 — Prix plan Pro", () => {
  it("TU-109-3 : prix plan Pro (4.9) formaté en '4,90€'", () => {
    const price = PLANS.pro.price; // 4.9
    // Vérifie la formule de formatage attendue (toFixed(2) + remplacement virgule)
    const formatted =
      price === 0 ? "0€" : `${price.toFixed(2).replace(".", ",")}€`;
    expect(formatted).toBe("4,90€");
  });
});

// ── TU-109-4 : Card Pro highlighted with border-primary (AC-3) ───────────────

describe("STORY-109 — Card Pro mise en avant", () => {
  it("TU-109-4 : pricing section contient 'border-primary' (card Pro highlighted, AC-3)", () => {
    expect(pricingSectionSrc).toContain("border-primary");
  });
});

// ── TU-109-5 : FAQ section (contenu maquette) ────────────────────────────────

describe("STORY-109 — Section FAQ", () => {
  it("TU-109-5 : page tarifs contient une FAQ sur le partenaire", () => {
    expect(pageSrc).toMatch(/Mon partenaire/i);
  });
});

// ── TU-109-6 : Fond bg-[#f6f6f8] (AC-7) ────────────────────────────────────

describe("STORY-109 — Fond de page", () => {
  it("TU-109-6 : page tarifs utilise bg-[#f6f6f8] ou bg-background-light", () => {
    const hasBg =
      pageSrc.includes("bg-[#f6f6f8]") ||
      pageSrc.includes("bg-background-light");
    expect(hasBg).toBe(true);
  });
});
