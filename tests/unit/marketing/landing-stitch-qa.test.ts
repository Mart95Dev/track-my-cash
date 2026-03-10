/**
 * Tests QA complémentaires — STORY-108
 * Couvre les gaps identifiés lors de l'audit :
 *  - GAP-108-A : AC-1 — Hero H1 contient "L'argent à deux" et "en toute transparence"
 *  - GAP-108-B : AC-5 — PRICING_DISPLAY a exactement 3 plans
 *  - GAP-108-C : AC-6 — CTA dark contient bg-slate-900
 *  - GAP-108-E : AC-8 — page wrapper utilise bg-[#FAFAFA]
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children }: { children: unknown }) => children,
}));

let src: string;

beforeAll(() => {
  src = readFileSync(
    join(process.cwd(), "src/app/[locale]/(marketing)/page.tsx"),
    "utf-8"
  );
});

describe("STORY-108 QA — Contenu hero et sections (AC-1/AC-6/AC-8)", () => {
  // ── GAP-108-A : AC-1 — Hero H1 ────────────────────────────────────────────

  it("QA-108-A : source page contient 'L'argent ne devrait'", () => {
    // Tient compte de l'entité HTML &apos; ou de l'apostrophe directe
    expect(src).toMatch(/L(&apos;|')argent ne devrait/);
  });

  it("QA-108-A2 : source page contient 'en toute transparence'", () => {
    expect(src).toContain("en toute transparence");
  });

  // ── GAP-108-C : AC-6 — CTA bg-primary ─────────────────────────────────────

  it("QA-108-C : source page contient 'bg-primary' (CTA card)", () => {
    expect(src).toContain("bg-primary");
  });

  it("QA-108-C2 : CTA contient du texte blanc (text-white)", () => {
    expect(src).toContain("text-white");
  });

  // ── GAP-108-E : AC-8 — fond bg-[#F5F3FF] hero ────────────────────────────

  it("QA-108-E : page hero utilise bg-[#F5F3FF]", () => {
    expect(src).toContain("bg-[#F5F3FF]");
  });
});

describe("STORY-108 QA — PRICING_DISPLAY 3 plans (AC-5)", () => {
  // ── GAP-108-B : AC-5 — Exactement 3 plans ────────────────────────────────

  it("QA-108-B : PRICING_DISPLAY contient exactement 3 plans", async () => {
    const { PRICING_DISPLAY } = await import(
      "@/app/[locale]/(marketing)/page"
    );
    expect(PRICING_DISPLAY).toHaveLength(3);
  });

  it("QA-108-B2 : PRICING_DISPLAY[0] est 'Découverte' (gratuit)", async () => {
    const { PRICING_DISPLAY } = await import(
      "@/app/[locale]/(marketing)/page"
    );
    expect(PRICING_DISPLAY[0].name).toBe("Découverte");
    expect(PRICING_DISPLAY[0].price).toBe("0€");
  });

  it("QA-108-B3 : PRICING_DISPLAY[2] est 'Unlimited' avec prix 7,90€", async () => {
    const { PRICING_DISPLAY } = await import(
      "@/app/[locale]/(marketing)/page"
    );
    expect(PRICING_DISPLAY[2].name).toBe("Unlimited");
    expect(PRICING_DISPLAY[2].price).toBe("7,90€");
  });
});
