/**
 * Tests QA — STORY-111 (forge-verify)
 * Comble les gaps identifiés lors de l'audit :
 *
 *  GAP-111-A : AC-1 — Design bg-[#FAFAF9] et logo bg-primary sur inscription
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

// ── GAP-111-A : AC-1 — Design bg-[#FAFAF9] et logo bg-primary ──────────────

describe("STORY-111 QA — Design inscription bg-[#FAFAF9] + logo (AC-1, GAP-A)", () => {
  it("QA-111-A : inscription contient 'bg-[#FAFAF9]' (fond page)", () => {
    expect(inscriptionSrc).toContain("bg-[#FAFAF9]");
  });

  it("QA-111-A2 : inscription contient le logo SVG Koupli", () => {
    expect(inscriptionSrc).toContain("koupli-logo-horizontal.svg");
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

// ── GAP-111-D : AC-2 — Apple retiré, seul Google reste ──────────────────────

describe("STORY-111 QA — Apple retiré de la page connexion (AC-2, GAP-D)", () => {
  it("QA-111-D : connexion ne contient plus Apple OAuth", () => {
    expect(connexionSrc).not.toContain('provider: "apple"');
    expect(connexionSrc).toContain('provider: "google"');
  });
});
