/**
 * Tests Dev — STORY-112
 * Refonte Dashboard App — maquette /app/dashboard.html
 *
 *  TU-112-1  : BalanceCard contient text-4xl (AC-3)
 *  TU-112-2  : KpiCards expose props revenue/expenses/recurring (AC-4)
 *  TU-112-3  : Dashboard limite à 5 transactions récentes (AC-6)
 *  TU-112-4  : Dashboard contient dark:bg-background-dark (AC-8)
 *  TU-112-5  : CoupleDashboard et CoupleChoiceModal toujours importés (AC-10)
 *  TU-112-6  : BalanceCard contient dark:bg-card-dark (AC-8)
 *  TU-112-7  : KpiCards contient dark:border-gray-800 (AC-8)
 *  TU-112-8  : BalanceCard contient "Solde total" (AC-3)
 *  TU-112-9  : Dashboard contient "Dernières transactions" (AC-6)
 *  TU-112-10 : Dashboard header contient h-12 w-12 (avatar 48px) (AC-1)
 *  TU-112-11 : KpiCards contient "Entrées" "Sorties" "Fixes" (AC-4)
 *  TU-112-12 : Dashboard contient max-w-md (AC-9)
 *  TU-112-13 : Dashboard contient badge statut vert (bg-success) (AC-1)
 *  TU-112-14 : Dashboard contient chips All/Personal/Couple (AC-2)
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

// ── TU-112-1 : AC-3 — BalanceCard text-4xl ───────────────────────────────────

describe("STORY-112 — BalanceCard montant en grand (AC-3)", () => {
  it("TU-112-1 : balance-card contient 'text-4xl' ou 'text-3xl' ou 'text-5xl'", () => {
    const hasLargeText =
      balanceCardSrc.includes("text-4xl") ||
      balanceCardSrc.includes("text-3xl") ||
      balanceCardSrc.includes("text-5xl");
    expect(hasLargeText).toBe(true);
  });
});

// ── TU-112-2 : AC-4 — KpiCards props revenue/expenses/recurring ──────────────

describe("STORY-112 — KpiCards props (AC-4)", () => {
  it("TU-112-2 : kpi-cards contient prop 'revenue'", () => {
    expect(kpiCardsSrc).toContain("revenue");
  });

  it("TU-112-2b : kpi-cards contient prop 'expenses'", () => {
    expect(kpiCardsSrc).toContain("expenses");
  });

  it("TU-112-2c : kpi-cards contient prop 'recurring'", () => {
    expect(kpiCardsSrc).toContain("recurring");
  });
});

// ── TU-112-3 : AC-6 — 5 transactions max ─────────────────────────────────────

describe("STORY-112 — 5 transactions récentes max (AC-6)", () => {
  it("TU-112-3 : dashboard source contient 'getTransactions' avec limite", () => {
    expect(dashboardSrc).toContain("getTransactions");
  });

  it("TU-112-3b : dashboard contient la valeur limite '5' pour les transactions", () => {
    // getTransactions(db, accountId, 5) OR .slice(0, 5)
    const hasLimit =
      dashboardSrc.includes("getTransactions(db, accountId, 5)") ||
      dashboardSrc.includes("getTransactions(db, undefined, 5)") ||
      dashboardSrc.includes(", 5)") ||
      dashboardSrc.includes(".slice(0, 5)");
    expect(hasLimit).toBe(true);
  });
});

// ── TU-112-4 : AC-8 — Dark mode background ───────────────────────────────────

describe("STORY-112 — Dark mode fond (AC-8)", () => {
  it("TU-112-4 : dashboard contient 'dark:bg-background-dark'", () => {
    expect(dashboardSrc).toContain("dark:bg-background-dark");
  });
});

// ── TU-112-5 : AC-10 — Composants couple préservés ───────────────────────────

describe("STORY-112 — Composants couple préservés (AC-10)", () => {
  it("TU-112-5 : dashboard importe CoupleDashboard", () => {
    expect(dashboardSrc).toContain("CoupleDashboard");
  });

  it("TU-112-5b : dashboard importe CoupleChoiceModal", () => {
    expect(dashboardSrc).toContain("CoupleChoiceModal");
  });

  it("TU-112-5c : dashboard importe OnboardingWizard", () => {
    expect(dashboardSrc).toContain("OnboardingWizard");
  });
});

// ── TU-112-6 : AC-8 — BalanceCard dark mode ──────────────────────────────────

describe("STORY-112 — BalanceCard dark mode (AC-8)", () => {
  it("TU-112-6 : balance-card contient 'dark:bg-card-dark'", () => {
    expect(balanceCardSrc).toContain("dark:bg-card-dark");
  });
});

// ── TU-112-7 : AC-8 — KpiCards dark mode ─────────────────────────────────────

describe("STORY-112 — KpiCards dark mode (AC-8)", () => {
  it("TU-112-7 : kpi-cards contient 'dark:border-gray-800'", () => {
    expect(kpiCardsSrc).toContain("dark:border-gray-800");
  });
});

// ── TU-112-8 : AC-3 — BalanceCard label Solde total ──────────────────────────

describe("STORY-112 — BalanceCard label (AC-3)", () => {
  it("TU-112-8 : balance-card contient 'Solde total'", () => {
    expect(balanceCardSrc).toContain("Solde total");
  });
});

// ── TU-112-9 : AC-6 — Section Dernières transactions ─────────────────────────

describe("STORY-112 — Section transactions récentes (AC-6)", () => {
  it("TU-112-9 : dashboard contient 'Dernières transactions' ou 'dernières'", () => {
    const hasTxSection =
      dashboardSrc.includes("Dernières transactions") ||
      dashboardSrc.toLowerCase().includes("dernières transactions");
    expect(hasTxSection).toBe(true);
  });
});

// ── TU-112-10 : AC-1 — Header avatar 48px ────────────────────────────────────

describe("STORY-112 — Header avatar 48px (AC-1)", () => {
  it("TU-112-10 : dashboard header contient 'h-12 w-12' ou 'w-12 h-12' (48px)", () => {
    const has48 =
      dashboardSrc.includes("h-12 w-12") ||
      dashboardSrc.includes("w-12 h-12") ||
      dashboardSrc.includes("size-12");
    expect(has48).toBe(true);
  });
});

// ── TU-112-11 : AC-4 — KpiCards labels Entrées/Sorties/Fixes ─────────────────

describe("STORY-112 — KpiCards labels français (AC-4)", () => {
  it("TU-112-11 : kpi-cards contient 'Entrées'", () => {
    expect(kpiCardsSrc).toContain("Entrées");
  });

  it("TU-112-11b : kpi-cards contient 'Sorties'", () => {
    expect(kpiCardsSrc).toContain("Sorties");
  });

  it("TU-112-11c : kpi-cards contient 'Fixes'", () => {
    expect(kpiCardsSrc).toContain("Fixes");
  });
});

// ── TU-112-12 : AC-9 — max-w-md mobile-first ─────────────────────────────────

describe("STORY-112 — Mobile-first max-w-md (AC-9)", () => {
  it("TU-112-12 : dashboard contient 'max-w-md'", () => {
    expect(dashboardSrc).toContain("max-w-md");
  });
});

// ── TU-112-13 : AC-1 — Badge statut vert ─────────────────────────────────────

describe("STORY-112 — Badge statut vert (AC-1)", () => {
  it("TU-112-13 : dashboard contient un badge bg-success (statut vert)", () => {
    expect(dashboardSrc).toContain("bg-success");
  });
});

// ── TU-112-14 : AC-2 — Chips All / Personal / Couple ─────────────────────────

describe("STORY-112 — Chips filtre (AC-2)", () => {
  it("TU-112-14 : dashboard contient chip 'Couple' (view=couple)", () => {
    expect(dashboardSrc).toContain("Couple");
  });

  it("TU-112-14b : dashboard contient chip 'Personnel' ou 'Personal'", () => {
    const hasPersonal =
      dashboardSrc.includes("Personnel") || dashboardSrc.includes("Personal");
    expect(hasPersonal).toBe(true);
  });
});
