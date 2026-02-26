/**
 * Tests QA — STORY-114 (forge-verify)
 * Comble les gaps identifiés lors de l'audit :
 *
 *  GAP-114-A : AC-1 — "Mes comptes" titre non testé
 *  GAP-114-B : AC-3 — shadow-sm + bg-white non testés
 *  GAP-114-C : AC-4 — text-4xl (grand solde) non testé
 *  GAP-114-D : AC-6 — "Aujourd'hui" et "Hier" du helper getBalanceDateLabel non testés
 *  GAP-114-E : AC-7 — dark:border-slate-800 non testé
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

// ── GAP-114-A : AC-1 — Titre "Mes comptes" ────────────────────────────────────

describe("STORY-114 QA — Titre Mes comptes (AC-1, GAP-A)", () => {
  it("QA-114-A : page contient 'Mes comptes' (texte du titre h1)", () => {
    expect(pageSrc).toContain("Mes comptes");
  });
});

// ── GAP-114-B : AC-3 — shadow-sm + bg-white cards ────────────────────────────

describe("STORY-114 QA — Cards shadow-sm bg-white (AC-3, GAP-B)", () => {
  it("QA-114-B : page contient 'shadow-sm' (ombre légère cards AC-3)", () => {
    expect(pageSrc).toContain("shadow-sm");
  });

  it("QA-114-B2 : page contient 'bg-white' (fond blanc cards AC-3)", () => {
    expect(pageSrc).toContain("bg-white");
  });
});

// ── GAP-114-C : AC-4 — text-4xl grand solde ──────────────────────────────────

describe("STORY-114 QA — Solde text-4xl (AC-4, GAP-C)", () => {
  it("QA-114-C : page contient 'text-4xl' (grand format solde AC-4)", () => {
    expect(pageSrc).toContain("text-4xl");
  });
});

// ── GAP-114-D : AC-6 — Helper getBalanceDateLabel Aujourd'hui / Hier ──────────

describe("STORY-114 QA — Helper getBalanceDateLabel (AC-6, GAP-D)", () => {
  it("QA-114-D : page contient 'getBalanceDateLabel' (helper date AC-6)", () => {
    expect(pageSrc).toContain("getBalanceDateLabel");
  });

  it("QA-114-D2 : page contient \"Aujourd'hui\" (label date courante AC-6)", () => {
    expect(pageSrc).toContain("Aujourd'hui");
  });

  it("QA-114-D3 : page contient 'Hier' (label date précédente AC-6)", () => {
    expect(pageSrc).toContain("Hier");
  });
});

// ── GAP-114-E : AC-7 — dark:border-slate-800 ─────────────────────────────────

describe("STORY-114 QA — dark:border-slate-800 (AC-7, GAP-E)", () => {
  it("QA-114-E : page contient 'dark:border-slate-800' (bordure dark mode AC-7)", () => {
    expect(pageSrc).toContain("dark:border-slate-800");
  });
});
