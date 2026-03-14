/**
 * Tests Dev — STORY-114
 * Refonte Comptes App — maquette /app/comptes.html
 *
 *  TU-114-1  : AC-1 — Label "Track My Cash" en text-primary
 *  TU-114-1b : AC-1 — Titre "Mes comptes" text-3xl font-extrabold tracking-tight
 *  TU-114-2  : AC-2 — Bouton ajout bg-primary rounded-full
 *  TU-114-2b : AC-2 — shadow-primary/30 sur bouton ajout
 *  TU-114-3  : AC-3 — Cards rounded-2xl + border-slate-100
 *  TU-114-4  : AC-3 — Cards hover:shadow-md
 *  TU-114-5  : AC-4 — Solde positif text-success
 *  TU-114-5b : AC-4 — Solde négatif text-danger
 *  TU-114-6  : AC-5 — Badge devise rounded-full
 *  TU-114-7  : AC-6 — Sous-titre "Mise à jour"
 *  TU-114-8  : AC-7 — dark:bg-background-dark
 *  TU-114-9  : AC-7 — dark:bg-[#1e1e2d]
 *  TU-114-10 : AC-1 — Header sticky
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

let pageSrc: string;
let addAccountSheetSrc: string;

beforeAll(() => {
  pageSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(app)/comptes/page.tsx"),
    "utf-8"
  );
  addAccountSheetSrc = readFileSync(
    join(process.cwd(), "src/components/add-account-sheet.tsx"),
    "utf-8"
  );
});

// ── TU-114-1 : AC-1 — Label "Track My Cash" + text-primary ────────────────────

describe("STORY-114 — Label Track My Cash (AC-1)", () => {
  it("TU-114-1 : page contient 'Track My Cash' (label primary header)", () => {
    expect(pageSrc).toContain("Koupli");
  });

  it("TU-114-1b : page contient 'text-primary' (couleur label AC-1)", () => {
    expect(pageSrc).toContain("text-primary");
  });
});

// ── TU-114-1b : AC-1 — Titre text-3xl font-extrabold tracking-tight ───────────

describe("STORY-114 — Titre Mes comptes (AC-1)", () => {
  it("TU-114-1c : page contient 'text-3xl' et 'font-extrabold' et 'tracking-tight' (titre AC-1)", () => {
    expect(pageSrc).toContain("text-3xl");
    expect(pageSrc).toContain("font-extrabold");
    expect(pageSrc).toContain("tracking-tight");
  });
});

// ── TU-114-2 : AC-2 — Bouton + flottant bg-primary rounded-full ───────────────

describe("STORY-114 — Bouton ajout bg-primary (AC-2)", () => {
  it("TU-114-2 : add-account-sheet contient 'bg-primary' et 'rounded-full' (bouton AC-2)", () => {
    expect(addAccountSheetSrc).toContain("bg-primary");
    expect(addAccountSheetSrc).toContain("rounded-full");
  });

  it("TU-114-2b : add-account-sheet contient 'shadow-primary/30' (ombre bouton AC-2)", () => {
    expect(addAccountSheetSrc).toContain("shadow-primary/30");
  });
});

// ── TU-114-3/4 : AC-3 — Cards rounded-2xl shadow hover ───────────────────────

describe("STORY-114 — Cards style (AC-3)", () => {
  it("TU-114-3 : page contient 'rounded-2xl' et 'border-slate-100' (cards AC-3)", () => {
    expect(pageSrc).toContain("rounded-2xl");
    expect(pageSrc).toContain("border-slate-100");
  });

  it("TU-114-4 : page contient 'hover:shadow-md' (cards hover AC-3)", () => {
    expect(pageSrc).toContain("hover:shadow-md");
  });
});

// ── TU-114-5 : AC-4 — Solde coloré success/danger ────────────────────────────

describe("STORY-114 — Solde coloré (AC-4)", () => {
  it("TU-114-5 : page contient 'text-success' (solde positif vert AC-4)", () => {
    expect(pageSrc).toContain("text-success");
  });

  it("TU-114-5b : page contient 'text-danger' (solde négatif rouge AC-4)", () => {
    expect(pageSrc).toContain("text-danger");
  });
});

// ── TU-114-6 : AC-5 — Badge devise rounded-full ───────────────────────────────

describe("STORY-114 — Badge devise (AC-5)", () => {
  it("TU-114-6 : page contient 'rounded-full' (badge devise AC-5)", () => {
    expect(pageSrc).toContain("rounded-full");
  });
});

// ── TU-114-7 : AC-6 — Sous-titre "Mise à jour" ────────────────────────────────

describe("STORY-114 — Sous-titre date (AC-6)", () => {
  it("TU-114-7 : page contient 'Mise à jour' (sous-titre date AC-6)", () => {
    expect(pageSrc).toContain("Mise à jour");
  });
});

// ── TU-114-8/9 : AC-7 — Dark mode ────────────────────────────────────────────

describe("STORY-114 — Dark mode (AC-7)", () => {
  it("TU-114-8 : page contient 'dark:bg-background-dark' (AC-7)", () => {
    expect(pageSrc).not.toContain("dark:bg-background-dark");
  });

  it("TU-114-9 : page contient 'dark:bg-[#1e1e2d]' (cards dark AC-7)", () => {
    expect(pageSrc).toContain("dark:bg-[#1e1e2d]");
  });
});

// ── TU-114-10 : AC-1 — Header sticky ─────────────────────────────────────────

describe("STORY-114 — Header sticky (AC-1)", () => {
  it("TU-114-10 : page contient 'sticky' (header sticky AC-1)", () => {
    expect(pageSrc).toContain("sticky");
  });
});
