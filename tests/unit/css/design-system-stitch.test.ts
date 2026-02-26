/**
 * TU-107-1 à TU-107-5 — STORY-107
 * Tests unitaires : tokens CSS Stitch v2 dans globals.css
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

let css: string;

beforeAll(() => {
  css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf-8");
});

describe("STORY-107 — Design System CSS Stitch v2", () => {
  // ── AC-1 : Token --couple-pink dans :root ──────────────────────────────

  it("TU-107-1 : globals.css contient --couple-pink: #EC4899 dans :root", () => {
    expect(css).toContain("--couple-pink: #EC4899");
  });

  // ── AC-2 : Exposition dans @theme inline ──────────────────────────────

  it("TU-107-2 : @theme inline expose --color-couple-pink", () => {
    expect(css).toContain("--color-couple-pink");
  });

  it("TU-107-2b : --color-couple-pink référence var(--couple-pink)", () => {
    expect(css).toMatch(/--color-couple-pink:\s*var\(--couple-pink\)/);
  });

  // ── AC-3 : Classe .glass-panel ────────────────────────────────────────

  it("TU-107-3 : .glass-panel est définie", () => {
    expect(css).toContain(".glass-panel");
  });

  it("TU-107-3b : .glass-panel a backdrop-filter: blur(12px)", () => {
    expect(css).toContain("backdrop-filter: blur(12px)");
  });

  it("TU-107-3c : .glass-panel a un background rgba blanc transparent", () => {
    expect(css).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.75\)/);
  });

  // ── AC-4 : Classe .btn-premium ───────────────────────────────────────

  it("TU-107-4 : .btn-premium est définie", () => {
    expect(css).toContain(".btn-premium");
  });

  it("TU-107-4b : .btn-premium a un box-shadow primary", () => {
    expect(css).toMatch(/rgba\(72,\s*72,\s*229,\s*0\.25\)/);
  });

  it("TU-107-4c : .btn-premium:hover décale verticallement (translateY)", () => {
    expect(css).toContain("translateY(-1px)");
  });

  // ── AC-5 : Classe .gradient-text ─────────────────────────────────────

  it("TU-107-5 : .gradient-text est définie", () => {
    expect(css).toContain(".gradient-text");
  });

  it("TU-107-5b : .gradient-text masque le texte avec -webkit-text-fill-color", () => {
    expect(css).toContain("-webkit-text-fill-color: transparent");
  });

  it("TU-107-5c : .gradient-text utilise background-clip: text", () => {
    expect(css).toContain("background-clip: text");
  });

  // ── QA Gaps — compléments AC-3 / AC-4 / AC-5 ─────────────────────────

  // GAP-107-A : border de .glass-panel (AC-3 complet)
  it("QA-107-A : .glass-panel a un border rgba(255,255,255,0.5)", () => {
    expect(css).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.5\)/);
  });

  // GAP-107-B : background de .btn-premium (AC-4 complet)
  it("QA-107-B : .btn-premium a background #4848e5", () => {
    expect(css).toContain("background: #4848e5");
  });

  // GAP-107-C : transition de .btn-premium (AC-4 complet)
  it("QA-107-C : .btn-premium a une transition définie", () => {
    expect(css).toContain("transition: all 0.3s ease");
  });

  // GAP-107-D : couleurs du gradient de .gradient-text (AC-5 complet)
  it("QA-107-D : .gradient-text contient la couleur de départ #1e293b", () => {
    expect(css).toContain("#1e293b");
  });

  it("QA-107-D2 : .gradient-text contient la couleur cible #4848e5", () => {
    expect(css).toContain("#4848e5");
  });
});
