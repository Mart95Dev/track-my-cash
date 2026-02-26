/**
 * Tests QA — STORY-110 (forge-verify)
 * Comble les gaps identifiés lors de l'audit :
 *
 *  GAP-110-A : AC-7 — parsers/registry.ts référence MCB (absent de TU-110-4)
 *  GAP-110-B : AC-1 — Début de phrase "votre couple" + "enfin clarifi" complets
 *  GAP-110-C : AC-2 — Label "Mode Couple" présent dans la section
 *  GAP-110-D : AC-6 — CTA pointe vers "/inscription"
 *  GAP-110-E : Design — bg-[#FAFAFA] wrapper page (cohérence design system)
 */
import { describe, it, expect, beforeAll } from "vitest";
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

// ── GAP-110-A : AC-7 — Parser MCB ────────────────────────────────────────────

describe("STORY-110 QA — Parser MCB (AC-7, GAP-A)", () => {
  it("QA-110-A : parsers/registry.ts référence MCB", () => {
    const hasMCB =
      registrySrc.includes("mcbCsvParser") ||
      registrySrc.includes("mcbPdfParser") ||
      registrySrc.toLowerCase().includes("mcb");
    expect(hasMCB).toBe(true);
  });
});

// ── GAP-110-B : AC-1 — Phrase héro complète ──────────────────────────────────

describe("STORY-110 QA — Phrase héro complète (AC-1, GAP-B)", () => {
  it("QA-110-B : page contient 'votre couple' (première partie du héro)", () => {
    expect(pageSrc.toLowerCase()).toContain("votre couple");
  });

  it("QA-110-B2 : page contient 'enfin clarifi' (fin du héro)", () => {
    expect(pageSrc).toContain("enfin clarifi");
  });
});

// ── GAP-110-C : AC-2 — Label "Mode Couple" ───────────────────────────────────

describe("STORY-110 QA — Label section Mode Couple (AC-2, GAP-C)", () => {
  it("QA-110-C : page contient le label 'Mode Couple'", () => {
    expect(pageSrc).toContain("Mode Couple");
  });
});

// ── GAP-110-D : AC-6 — CTA lien /inscription ─────────────────────────────────

describe("STORY-110 QA — CTA lien /inscription (AC-6, GAP-D)", () => {
  it("QA-110-D : page contient href='/inscription'", () => {
    expect(pageSrc).toContain("/inscription");
  });
});

// ── GAP-110-E : Design — bg-[#FAFAFA] wrapper ────────────────────────────────

describe("STORY-110 QA — Fond page bg-[#FAFAFA] (Design, GAP-E)", () => {
  it("QA-110-E : page wrapper utilise 'bg-[#FAFAFA]' (cohérence design system)", () => {
    expect(pageSrc).toContain("bg-[#FAFAFA]");
  });
});
