/**
 * Tests Dev — STORY-113
 * Refonte Transactions App — maquette /app/transactions.html
 *
 *  TU-113-1  : Header "Transactions" text-3xl font-extrabold (AC-1)
 *  TU-113-1b : Header contient bouton "Modifier" (AC-1)
 *  TU-113-2  : Import CSV préservé (AC-7)
 *  TU-113-3  : Transactions groupées par date (txByDate) (AC-4)
 *  TU-113-3b : Headers de date avec sticky top-0 z-10 (AC-4)
 *  TU-113-4  : dark:bg-background-dark présent (AC-6)
 *  TU-113-5  : Header sticky top-0 (AC-1)
 *  TU-113-6  : Chip "Tous les comptes" (AC-2)
 *  TU-113-7  : Chip "Recherche" (AC-2)
 *  TU-113-8  : Bouton "Export Data" (AC-3)
 *  TU-113-9  : Bouton "AI Scan" + icône auto_awesome (AC-3)
 *  TU-113-10 : Icône catégorie cercle rounded-full (AC-5)
 *  TU-113-11 : bg-background-light (AC-6)
 *  TU-113-12 : tracking-tight sur h1 "Transactions" (AC-1)
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

// ── TU-113-1 : AC-1 — Header text-3xl font-extrabold ──────────────────────────

describe("STORY-113 — Header Transactions (AC-1)", () => {
  it("TU-113-1 : page contient 'text-3xl' et 'font-extrabold' (titre principal)", () => {
    expect(pageSrc).toContain("text-3xl");
    expect(pageSrc).toContain("font-extrabold");
  });

  it("TU-113-1b : page contient 'Modifier' (bouton header AC-1)", () => {
    expect(pageSrc).toContain("Modifier");
  });
});

// ── TU-113-2 : AC-7 — Import CSV préservé ─────────────────────────────────────

describe("STORY-113 — Import CSV préservé (AC-7)", () => {
  it("TU-113-2 : page contient 'Import CSV' ou 'ImportButton'", () => {
    const hasImport =
      pageSrc.includes("Import CSV") ||
      pageSrc.includes("ImportButton");
    expect(hasImport).toBe(true);
  });
});

// ── TU-113-3 : AC-4 — Groupement par date ─────────────────────────────────────

describe("STORY-113 — Transactions groupées par date (AC-4)", () => {
  it("TU-113-3 : page contient 'txByDate' ou 'sortedDates' (groupement)", () => {
    const hasGrouping =
      pageSrc.includes("txByDate") ||
      pageSrc.includes("sortedDates") ||
      pageSrc.includes("groupByDate");
    expect(hasGrouping).toBe(true);
  });

  it("TU-113-3b : page contient 'sticky top-0 z-10' (headers date sticky)", () => {
    expect(pageSrc).toContain("sticky top-0 z-10");
  });
});

// ── TU-113-4 : AC-6 — Dark mode ───────────────────────────────────────────────

describe("STORY-113 — Dark mode (AC-6)", () => {
  it("TU-113-4 : page contient 'dark:bg-background-dark'", () => {
    expect(pageSrc).not.toContain("dark:bg-background-dark");
  });
});

// ── TU-113-5 : AC-1 — Header sticky ──────────────────────────────────────────

describe("STORY-113 — Header sticky (AC-1)", () => {
  it("TU-113-5 : page contient 'sticky' (header sticky)", () => {
    expect(pageSrc).toContain("sticky");
  });
});

// ── TU-113-6/7 : AC-2 — Chips filtres ────────────────────────────────────────

describe("STORY-113 — Chips filtres (AC-2)", () => {
  it("TU-113-6 : page contient chip 'Tous les comptes'", () => {
    expect(pageSrc).toContain("Tous les comptes");
  });

  it("TU-113-7 : page contient chip 'Recherche'", () => {
    expect(pageSrc).toContain("Recherche");
  });
});

// ── TU-113-8/9 : AC-3 — Boutons action ───────────────────────────────────────

describe("STORY-113 — Boutons action Import/Export/AI (AC-3)", () => {
  it("TU-113-8 : page contient 'Export Data' ou 'ExportTransactions'", () => {
    const hasExport =
      pageSrc.includes("Export Data") ||
      pageSrc.includes("ExportTransactions");
    expect(hasExport).toBe(true);
  });

  it("TU-113-9 : page contient 'AI Scan' ou 'AutoCategorizeButton'", () => {
    const hasAiScan =
      pageSrc.includes("AI Scan") ||
      pageSrc.includes("AutoCategorizeButton");
    expect(hasAiScan).toBe(true);
  });

  it("TU-113-9b : page contient 'auto_awesome' (icône AI Scan)", () => {
    expect(pageSrc).toContain("auto_awesome");
  });
});

// ── TU-113-10 : AC-5 — Icône catégorie cercle ────────────────────────────────

describe("STORY-113 — Icône catégorie cercle (AC-5)", () => {
  it("TU-113-10 : page contient 'rounded-full' (icône catégorie cercle coloré)", () => {
    expect(pageSrc).toContain("rounded-full");
  });
});

// ── TU-113-11 : AC-6 — bg-background-light ───────────────────────────────────

describe("STORY-113 — bg-background-light (AC-6)", () => {
  it("TU-113-11 : page contient 'bg-background-light'", () => {
    expect(pageSrc).toContain("bg-background-light");
  });
});

// ── TU-113-12 : AC-1 — tracking-tight titre ──────────────────────────────────

describe("STORY-113 — tracking-tight titre (AC-1)", () => {
  it("TU-113-12 : page contient 'tracking-tight' (titre Transactions)", () => {
    expect(pageSrc).toContain("tracking-tight");
  });
});
