/**
 * Tests Dev — STORY-110
 * Refonte Page Fonctionnalités + Import Relevés (maquette 03-features.html)
 *
 *  TU-110-1 : Aucune mention "Safe Connect" / "connexion directe" (AC-3)
 *  TU-110-2 : Page contient "CSV" et "XLSX" (AC-4)
 *  TU-110-3 : Page mentionne "couple" ou "partenaire" (AC-2)
 *  TU-110-4 : Registry parsers contient Banque Populaire + Revolut (AC-7)
 *  TU-110-5 : Héro contient "enfin clarifié" (AC-1)
 *  TU-110-6 : IMPORT_FORMATS exporte CSV, XLSX, PDF (AC-4)
 *  TU-110-7 : CTA contient "gratuit" (AC-6)
 *  TU-110-8 : Section IA présente (AC-5)
 */
import { describe, it, expect, vi, beforeAll } from "vitest";

// Mock pour le Server Component (i18n/navigation)
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children }: { children: unknown }) => children,
}));
import { readFileSync } from "fs";
import { join } from "path";

let pageSrc: string;
let registrySrc: string;

beforeAll(() => {
  pageSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(marketing)/fonctionnalites/page.tsx"),
    "utf-8"
  );
  registrySrc = readFileSync(
    join(process.cwd(), "src/lib/parsers/registry.ts"),
    "utf-8"
  );
});

// ── TU-110-1 : AC-3 — Aucune mention connexion directe ───────────────────────

describe("STORY-110 — Absence connexion bancaire directe (AC-3)", () => {
  it("TU-110-1 : page ne contient pas 'Safe Connect'", () => {
    expect(pageSrc).not.toContain("Safe Connect");
  });

  it("TU-110-1b : page ne contient pas 'connexion directe'", () => {
    expect(pageSrc.toLowerCase()).not.toContain("connexion directe");
  });

  it("TU-110-1c : page ne contient pas 'connexion bancaire'", () => {
    expect(pageSrc.toLowerCase()).not.toContain("connexion bancaire");
  });
});

// ── TU-110-2 : AC-4 — Formats CSV et XLSX ────────────────────────────────────

describe("STORY-110 — Formats d'import (AC-4)", () => {
  it("TU-110-2 : page contient 'CSV'", () => {
    expect(pageSrc).toContain("CSV");
  });

  it("TU-110-2b : page contient 'XLSX'", () => {
    expect(pageSrc).toContain("XLSX");
  });
});

// ── TU-110-3 : AC-2 — Section Mode Couple ────────────────────────────────────

describe("STORY-110 — Section couple (AC-2)", () => {
  it("TU-110-3 : page mentionne 'couple' ou 'partenaire'", () => {
    const mentionsCouple =
      pageSrc.toLowerCase().includes("couple") ||
      pageSrc.toLowerCase().includes("partenaire");
    expect(mentionsCouple).toBe(true);
  });
});

// ── TU-110-4 : AC-7 — Parsers Banque Populaire + Revolut ─────────────────────

describe("STORY-110 — Parsers documentés (AC-7)", () => {
  it("TU-110-4 : parsers/registry.ts référence Banque Populaire", () => {
    const hasBP =
      registrySrc.includes("banquePopulaire") ||
      registrySrc.toLowerCase().includes("banque-populaire") ||
      registrySrc.toLowerCase().includes("banque populaire");
    expect(hasBP).toBe(true);
  });

  it("TU-110-4b : parsers/registry.ts référence Revolut", () => {
    const hasRevolut =
      registrySrc.includes("revolut") ||
      registrySrc.includes("Revolut");
    expect(hasRevolut).toBe(true);
  });
});

// ── TU-110-5 : AC-1 — Héro "enfin clarifié" ──────────────────────────────────

describe("STORY-110 — Héro (AC-1)", () => {
  it("TU-110-5 : page contient 'enfin clarifié' (AC-1)", () => {
    expect(pageSrc).toContain("enfin clarifi");
  });
});

// ── TU-110-6 : AC-4 — Export IMPORT_FORMATS ──────────────────────────────────

describe("STORY-110 — IMPORT_FORMATS export (AC-4)", () => {
  it("TU-110-6 : IMPORT_FORMATS est exporté et contient CSV, XLSX, PDF", async () => {
    const { IMPORT_FORMATS } = await import(
      "@/app/[locale]/(marketing)/fonctionnalites/page"
    );
    expect(IMPORT_FORMATS).toContain("CSV");
    expect(IMPORT_FORMATS).toContain("XLSX");
    expect(IMPORT_FORMATS).toContain("PDF");
  });
});

// ── TU-110-7 : AC-6 — CTA Essai gratuit ──────────────────────────────────────

describe("STORY-110 — CTA Essai gratuit (AC-6)", () => {
  it("TU-110-7 : page contient un CTA avec 'gratuit'", () => {
    expect(pageSrc.toLowerCase()).toContain("gratuit");
  });
});

// ── TU-110-8 : AC-5 — Section IA Assistant ───────────────────────────────────

describe("STORY-110 — Section IA (AC-5)", () => {
  it("TU-110-8 : page contient une section IA", () => {
    const hasIA =
      pageSrc.includes("Intelligence Artificielle") ||
      pageSrc.includes("Conseiller IA") ||
      pageSrc.includes("IA") ||
      pageSrc.includes("smart_toy");
    expect(hasIA).toBe(true);
  });
});
