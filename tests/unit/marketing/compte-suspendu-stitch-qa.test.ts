/**
 * Tests QA — STORY-118 (forge-verify)
 * Comble les gaps identifiés lors de l'audit :
 *
 *  GAP-118-A : AC-2 — Balise <h1> avec le titre complet "Compte Suspendu" non testée
 *  GAP-118-B : AC-2 — Icône material-symbols-outlined "lock" effective non vérifiée
 *  GAP-118-C : AC-3 — Délai "5 jours" dans la card warning non testé
 *  GAP-118-D : AC-3 — Mention "définitivement" (gravité suppression) non testée
 *  GAP-118-E : AC-5 — Lien retour à l'accueil ("Retour") non testé
 *  GAP-118-F : AC-6 — Absence de bottom nav / <nav> confirmée (design épuré)
 *  GAP-118-G : AC-6 — Wrapper <main> présent (mise en page épurée)
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

let src: string;

beforeAll(() => {
  src = readFileSync(
    join(process.cwd(), "src/app/[locale]/compte-suspendu/page.tsx"),
    "utf-8"
  );
});

// ── GAP-118-A : AC-2 — Balise h1 + titre complet ─────────────────────────────

describe("STORY-118 QA — Titre h1 complet (AC-2, GAP-A)", () => {
  it("QA-118-A : page contient '<h1' (balise titre principale AC-2)", () => {
    expect(src).toContain("<h1");
  });

  it("QA-118-A2 : page contient 'Compte Suspendu' (titre complet AC-2)", () => {
    expect(src).toContain("Compte Suspendu");
  });
});

// ── GAP-118-B : AC-2 — Icône lock material-symbols ───────────────────────────

describe("STORY-118 QA — Icône lock material-symbols (AC-2, GAP-B)", () => {
  it("QA-118-B : page contient 'material-symbols-outlined' (composant icône AC-2)", () => {
    expect(src).toContain("material-symbols-outlined");
  });

  it("QA-118-B2 : page contient '>lock<' (valeur icône lock AC-2)", () => {
    expect(src).toContain(">lock<");
  });
});

// ── GAP-118-C : AC-3 — Délai 5 jours avant suppression ───────────────────────

describe("STORY-118 QA — Délai suppression (AC-3, GAP-C)", () => {
  it("QA-118-C : page contient '5 jours' (délai avant suppression AC-3)", () => {
    expect(src).toContain("5 jours");
  });
});

// ── GAP-118-D : AC-3 — Gravité suppression définitive ────────────────────────

describe("STORY-118 QA — Suppression définitive (AC-3, GAP-D)", () => {
  it("QA-118-D : page contient 'définitivement' (caractère irrévocable AC-3)", () => {
    expect(src).toContain("définitivement");
  });
});

// ── GAP-118-E : AC-5 — Lien retour à l'accueil ───────────────────────────────

describe("STORY-118 QA — Retour accueil (AC-5, GAP-E)", () => {
  it("QA-118-E : page contient 'Retour' (bouton/lien retour AC-5)", () => {
    expect(src).toContain("Retour");
  });

  it('QA-118-E2 : page contient href="/" (lien vers accueil AC-5)', () => {
    expect(src).toContain('href="/"');
  });
});

// ── GAP-118-F : AC-6 — Absence de bottom nav (design épuré) ──────────────────

describe("STORY-118 QA — Pas de bottom nav (AC-6, GAP-F)", () => {
  it("QA-118-F : page ne contient pas '<nav' (pas de navigation AC-6)", () => {
    expect(src).not.toContain("<nav");
  });

  it("QA-118-F2 : page ne contient pas 'bottom-nav' (pas de barre inférieure AC-6)", () => {
    expect(src).not.toContain("bottom-nav");
  });
});

// ── GAP-118-G : AC-6 — Wrapper main présent ──────────────────────────────────

describe("STORY-118 QA — Wrapper main (AC-6, GAP-G)", () => {
  it("QA-118-G : page contient '<main' (mise en page épurée sans nav AC-6)", () => {
    expect(src).toContain("<main");
  });
});
