/**
 * Tests QA — STORY-112 (forge-verify)
 * Comble les gaps identifiés lors de l'audit :
 *
 *  GAP-112-A : AC-5 — BalanceEvolutionChart + "Historique" non testés
 *  GAP-112-B : AC-7 — bg-background-light non testé
 *  GAP-112-C : AC-3 — variation % colorée (bg-success/10, bg-danger/10) + tracking-tighter non testés
 *  GAP-112-D : AC-4 — grid-cols-3 dans kpi-cards non testé
 *  GAP-112-E : AC-1 — bouton cloche notifications non testé
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

let dashboardSrc: string;
let balanceCardSrc: string;
let kpiCardsSrc: string;

beforeAll(() => {
  dashboardSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(app)/dashboard/page.tsx"),
    "utf-8"
  );
  balanceCardSrc = readFileSync(
    join(process.cwd(), "src/components/balance-card.tsx"),
    "utf-8"
  );
  kpiCardsSrc = readFileSync(
    join(process.cwd(), "src/components/kpi-cards.tsx"),
    "utf-8"
  );
});

// ── GAP-112-A : AC-5 — Section Historique + BalanceEvolutionChart ─────────────

describe("STORY-112 QA — Section Historique (AC-5, GAP-A)", () => {
  it("QA-112-A : dashboard importe BalanceEvolutionChart", () => {
    expect(dashboardSrc).toContain("BalanceEvolutionChart");
  });

  it("QA-112-A2 : dashboard contient 'Historique' (label section)", () => {
    const hasHistorique =
      dashboardSrc.includes("Historique du solde") ||
      dashboardSrc.toLowerCase().includes("historique");
    expect(hasHistorique).toBe(true);
  });
});

// ── GAP-112-B : AC-7 — bg-background-light ───────────────────────────────────

describe("STORY-112 QA — bg-background-light (AC-7, GAP-B)", () => {
  it("QA-112-B : dashboard contient 'bg-background-light'", () => {
    expect(dashboardSrc).toContain("bg-background-light");
  });
});

// ── GAP-112-C : AC-3 — Variation % colorée + tracking-tighter ─────────────────

describe("STORY-112 QA — BalanceCard variation colorée (AC-3, GAP-C)", () => {
  it("QA-112-C : balance-card contient 'bg-success/10' (variation positive colorée)", () => {
    expect(balanceCardSrc).toContain("bg-success/10");
  });

  it("QA-112-C2 : balance-card contient 'bg-danger/10' (variation négative colorée)", () => {
    expect(balanceCardSrc).toContain("bg-danger/10");
  });

  it("QA-112-C3 : balance-card contient 'tracking-tighter'", () => {
    expect(balanceCardSrc).toContain("tracking-tighter");
  });
});

// ── GAP-112-D : AC-4 — grid-cols-3 ───────────────────────────────────────────

describe("STORY-112 QA — KpiCards grid-cols-3 (AC-4, GAP-D)", () => {
  it("QA-112-D : kpi-cards contient 'grid-cols-3'", () => {
    expect(kpiCardsSrc).toContain("grid-cols-3");
  });
});

// ── GAP-112-E : AC-1 — Bouton notifications (cloche) ─────────────────────────

describe("STORY-112 QA — Bouton notifications (AC-1, GAP-E)", () => {
  it("QA-112-E : dashboard contient le material-symbol 'notifications' (cloche)", () => {
    expect(dashboardSrc).toContain("notifications");
  });
});
