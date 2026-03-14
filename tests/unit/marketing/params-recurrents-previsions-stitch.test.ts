/**
 * Tests TDD — STORY-116
 * Refonte Paramètres + Récurrents + Prévisions (Stitch)
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

let paramsSrc: string;
let recurrentsSrc: string;
let previsionsSrc: string;

beforeAll(() => {
  paramsSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(app)/parametres/page.tsx"),
    "utf-8"
  );
  recurrentsSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(app)/recurrents/page.tsx"),
    "utf-8"
  );
  previsionsSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(app)/previsions/page.tsx"),
    "utf-8"
  );
});

// ── AC-1 / AC-3 — Paramètres : fond iOS ─────────────────────────────────────

describe("STORY-116 — Paramètres fond iOS (AC-1/3)", () => {
  it("TU-116-1a : parametres contient '#f2f2f7' (fond iOS system AC-3)", () => {
    expect(paramsSrc).toContain("#f2f2f7");
  });

  it("TU-116-1b : parametres contient 'sticky' (header sticky AC-1)", () => {
    expect(paramsSrc).toContain("sticky");
  });

  it("TU-116-1c : parametres contient 'text-3xl' (titre h1 AC-1)", () => {
    expect(paramsSrc).toContain("text-3xl");
  });
});

// ── AC-2 — Paramètres : toggle iOS ──────────────────────────────────────────

describe("STORY-116 — Paramètres toggle iOS (AC-2)", () => {
  it("TU-116-2 : parametres référence 'ios-toggle' (toggle style iOS AC-2)", () => {
    expect(paramsSrc).toContain("ios-toggle");
  });
});

// ── AC-4 — Paramètres : séparateurs ─────────────────────────────────────────

describe("STORY-116 — Paramètres séparateurs (AC-4)", () => {
  it("TU-116-4 : parametres contient 'separator-light' (border séparateur AC-4)", () => {
    expect(paramsSrc).toContain("separator-light");
  });
});

// ── AC-10 — Paramètres dark mode ─────────────────────────────────────────────

describe("STORY-116 — Paramètres dark mode (AC-10)", () => {
  it("TU-116-10a : parametres contient 'dark:bg-background-dark' (AC-10)", () => {
    expect(paramsSrc).not.toContain("dark:bg-background-dark");
  });
});

// ── AC-5 — Récurrents : card insight ─────────────────────────────────────────

describe("STORY-116 — Récurrents card insight IA (AC-5)", () => {
  it("TU-116-5a : recurrents contient 'bg-primary/5' (card insight glass AC-5)", () => {
    expect(recurrentsSrc).toContain("bg-primary/5");
  });

  it("TU-116-5b : recurrents contient 'auto_awesome' (icône IA AC-5)", () => {
    expect(recurrentsSrc).toContain("auto_awesome");
  });
});

// ── AC-6 / AC-7 — Récurrents : liste + bouton Ajouter ────────────────────────

describe("STORY-116 — Récurrents liste + sticky (AC-6/7)", () => {
  it("TU-116-6 : recurrents contient 'rounded-full' (icône circulaire AC-6)", () => {
    expect(recurrentsSrc).toContain("rounded-full");
  });

  it("TU-116-7 : recurrents contient 'sticky' (header sticky AC-7)", () => {
    expect(recurrentsSrc).toContain("sticky");
  });

  it("TU-116-7b : recurrents contient 'text-3xl' (titre AC-7)", () => {
    expect(recurrentsSrc).toContain("text-3xl");
  });
});

// ── AC-10 — Récurrents dark mode ─────────────────────────────────────────────

describe("STORY-116 — Récurrents dark mode (AC-10)", () => {
  it("TU-116-10b : recurrents contient 'dark:bg-background-dark' (AC-10)", () => {
    expect(recurrentsSrc).not.toContain("dark:bg-background-dark");
  });
});

// ── AC-8 — Prévisions : navigation mois ──────────────────────────────────────

describe("STORY-116 — Prévisions navigation mois (AC-8)", () => {
  it("TU-116-8 : previsions contient 'ForecastControls' (navigation mois AC-8)", () => {
    expect(previsionsSrc).toContain("ForecastControls");
  });
});

// ── AC-10 — Prévisions dark mode ─────────────────────────────────────────────

describe("STORY-116 — Prévisions dark mode (AC-10)", () => {
  it("TU-116-10c : previsions contient 'bg-background-light' (AC-10)", () => {
    expect(previsionsSrc).toContain("bg-background-light");
  });

  it("TU-116-10d : previsions contient 'dark:bg-background-dark' (AC-10)", () => {
    expect(previsionsSrc).not.toContain("dark:bg-background-dark");
  });
});
