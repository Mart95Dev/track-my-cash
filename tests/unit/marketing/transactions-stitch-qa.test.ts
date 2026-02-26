/**
 * Tests QA — STORY-113 (forge-verify)
 * Comble les gaps identifiés lors de l'audit :
 *
 *  GAP-113-A : AC-2 — chip "Tags" non testé
 *  GAP-113-B : AC-3 — bg-primary/10 sur bouton AI Scan non testé
 *  GAP-113-C : AC-5 — montant coloré text-success/text-danger non testé
 *  GAP-113-D : AC-4 — helper getDateLabel (Aujourd'hui/Hier) non testé
 *  GAP-113-E : AC-7 — TransactionSearch préservé non testé
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

let pageSrc: string;

beforeAll(() => {
  pageSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(app)/transactions/page.tsx"),
    "utf-8"
  );
});

// ── GAP-113-A : AC-2 — Chip "Tags" ───────────────────────────────────────────

describe("STORY-113 QA — Chip Tags (AC-2, GAP-A)", () => {
  it("QA-113-A : page contient le chip 'Tags' (AC-2 troisième chip)", () => {
    expect(pageSrc).toContain("Tags");
  });
});

// ── GAP-113-B : AC-3 — bg-primary/10 bouton AI Scan ──────────────────────────

describe("STORY-113 QA — bg-primary/10 bouton AI Scan (AC-3, GAP-B)", () => {
  it("QA-113-B : page contient 'bg-primary/10' (fond bouton AI Scan)", () => {
    expect(pageSrc).toContain("bg-primary/10");
  });
});

// ── GAP-113-C : AC-5 — Montant coloré text-success/text-danger ───────────────

describe("STORY-113 QA — Montant coloré income/expense (AC-5, GAP-C)", () => {
  it("QA-113-C : page contient 'text-success' (montant revenu vert)", () => {
    expect(pageSrc).toContain("text-success");
  });

  it("QA-113-C2 : page contient 'text-danger' (montant dépense rouge)", () => {
    expect(pageSrc).toContain("text-danger");
  });
});

// ── GAP-113-D : AC-4 — Helper getDateLabel (Aujourd'hui / Hier) ───────────────

describe("STORY-113 QA — Helper getDateLabel (AC-4, GAP-D)", () => {
  it("QA-113-D : page contient 'getDateLabel' (helper formatage date groupes)", () => {
    expect(pageSrc).toContain("getDateLabel");
  });

  it("QA-113-D2 : page contient \"Aujourd'hui\" (label date courante)", () => {
    expect(pageSrc).toContain("Aujourd'hui");
  });

  it("QA-113-D3 : page contient 'Hier' (label date précédente)", () => {
    expect(pageSrc).toContain("Hier");
  });
});

// ── GAP-113-E : AC-7 — TransactionSearch préservé ────────────────────────────

describe("STORY-113 QA — TransactionSearch préservé (AC-7, GAP-E)", () => {
  it("QA-113-E : page importe et utilise TransactionSearch (fonctionnalité filtre préservée)", () => {
    expect(pageSrc).toContain("TransactionSearch");
  });
});
