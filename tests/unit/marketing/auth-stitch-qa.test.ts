/**
 * Tests QA — STORY-111 (forge-verify)
 * Comble les gaps identifiés lors de l'audit :
 *
 *  GAP-111-A : AC-1 — 3ème blob bg-blue-200/10 non testé sur inscription
 *  GAP-111-B : AC-3 — Texte exact "Essai 14j offert" non testé
 *  GAP-111-C : AC-5 — "Bon retour !" (avec point d'exclamation) non testé
 *  GAP-111-D : AC-2 — SVG Apple non testé sur page connexion
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

let inscriptionSrc: string;
let connexionSrc: string;

beforeAll(() => {
  inscriptionSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(auth)/inscription/page.tsx"),
    "utf-8"
  );
  connexionSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(auth)/connexion/page.tsx"),
    "utf-8"
  );
});

// ── GAP-111-A : AC-1 — 3ème blob bg-blue-200/10 ─────────────────────────────

describe("STORY-111 QA — 3ème blob blue-200/10 inscription (AC-1, GAP-A)", () => {
  it("QA-111-A : inscription contient 'bg-blue-200/10' (3ème blur spot)", () => {
    expect(inscriptionSrc).toContain("bg-blue-200/10");
  });

  it("QA-111-A2 : inscription contient bien 3 classes 'rounded-full' de blur (3 blobs)", () => {
    // Les 3 blobs sont des rounded-full avec blur
    const matches = inscriptionSrc.match(/blur-\[\d+px\]/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });
});

// ── GAP-111-B : AC-3 — Texte exact badge "Essai 14j offert" ─────────────────

describe("STORY-111 QA — Badge exact 'Essai 14j offert' (AC-3, GAP-B)", () => {
  it("QA-111-B : inscription contient le texte exact 'Essai 14j offert'", () => {
    expect(inscriptionSrc).toContain("Essai 14j offert");
  });
});

// ── GAP-111-C : AC-5 — Titre "Bon retour !" avec exclamation ────────────────

describe("STORY-111 QA — Titre 'Bon retour !' avec point d'exclamation (AC-5, GAP-C)", () => {
  it("QA-111-C : connexion contient 'Bon retour !' (avec !)", () => {
    expect(connexionSrc).toContain("Bon retour !");
  });
});

// ── GAP-111-D : AC-2 — SVG Apple sur page connexion ─────────────────────────

describe("STORY-111 QA — SVG Apple sur page connexion (AC-2, GAP-D)", () => {
  it("QA-111-D : connexion contient le path SVG Apple (17.05 20.28)", () => {
    const hasAppleSvg =
      connexionSrc.includes("17.05 20.28") ||
      connexionSrc.includes("sr-only\">Apple");
    expect(hasAppleSvg).toBe(true);
  });
});
