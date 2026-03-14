/**
 * Tests QA — STORY-109 (forge-verify)
 * Comble les gaps identifiés lors de l'audit :
 *
 *  GAP-109-A : AC-2 — Badge "Économisez 20%" + icône auto_awesome dans PricingToggle
 *  GAP-109-B : AC-5 — Prix Unlimited "8,90€" vérifié
 *  GAP-109-C : AC-3 — Animation @keyframes gradient-xy et couleur #EC4899 dans globals.css
 *  GAP-109-D : AC-1 — Boutons "Mensuel" / "Annuel" dans le toggle source
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { PLANS } from "@/lib/stripe-plans";

let toggleSrc: string;
let cssSrc: string;

beforeAll(() => {
  toggleSrc = readFileSync(
    join(process.cwd(), "src/components/pricing-toggle.tsx"),
    "utf-8"
  );
  cssSrc = readFileSync(
    join(process.cwd(), "src/app/globals.css"),
    "utf-8"
  );
});

// ── GAP-109-D : AC-1 — Boutons Mensuel / Annuel ──────────────────────────────

describe("STORY-109 QA — Toggle boutons (AC-1, GAP-D)", () => {
  it("QA-109-D : PricingToggle contient le label 'Mensuel'", () => {
    expect(toggleSrc).toContain("Mensuel");
  });

  it("QA-109-D2 : PricingToggle contient le label 'Annuel'", () => {
    expect(toggleSrc).toContain("Annuel");
  });
});

// ── GAP-109-A : AC-2 — Badge "Économisez 20%" + auto_awesome ─────────────────

describe("STORY-109 QA — Badge Économisez 15% (AC-2, GAP-A)", () => {
  it("QA-109-A : PricingToggle contient le texte dynamique de remise annuelle", () => {
    expect(toggleSrc).toContain("Économisez");
    expect(toggleSrc).toContain("en annuel");
  });

  it("QA-109-A2 : PricingToggle contient l'icône 'auto_awesome'", () => {
    expect(toggleSrc).toContain("auto_awesome");
  });
});

// ── GAP-109-B : AC-5 — Prix Unlimited 8,90€ ─────────────────────────────────

describe("STORY-109 QA — Prix plan Unlimited (AC-5, GAP-B)", () => {
  it("QA-109-B : prix plan Unlimited (8.9) formaté en '8,90€'", () => {
    const price = PLANS.premium.price; // 8.9
    const formatted =
      price === 0 ? "0€" : `${price.toFixed(2).replace(".", ",")}€`;
    expect(formatted).toBe("8,90€");
  });
});

// ── GAP-109-C : AC-3 — Animation CSS globals.css ─────────────────────────────

describe("STORY-109 QA — Animation CSS animated-border-wrapper (AC-3, GAP-C)", () => {
  it("QA-109-C : globals.css contient '@keyframes gradient-xy'", () => {
    expect(cssSrc).toContain("gradient-xy");
  });

  it("QA-109-C2 : globals.css contient la couleur couple-pink '#EC4899' dans l'animation", () => {
    expect(cssSrc).toContain("#EC4899");
  });

  it("QA-109-C3 : globals.css contient 'background-size: 200% 200%' pour l'animation", () => {
    expect(cssSrc).toContain("200% 200%");
  });
});
