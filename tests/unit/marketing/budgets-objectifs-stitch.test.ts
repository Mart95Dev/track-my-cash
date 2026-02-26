/**
 * Tests Dev — STORY-115
 * Refonte Budgets & Objectifs App — maquettes budgets-1.html / objectifs-1.html
 *
 *  TU-115-1  : AC-2 — Card Suggestions IA avec auto_awesome (AC-2)
 *  TU-115-1b : AC-2 — Effet glass (backdrop-blur ou glass-panel) (AC-2)
 *  TU-115-1c : AC-1 — Header Budgets text-3xl font-extrabold tracking-tight (AC-1)
 *  TU-115-1d : AC-1 — Bouton add bg-primary rounded-full (AC-1)
 *  TU-115-1e : AC-1 — Header sticky (AC-1)
 *  TU-115-2  : AC-3 — Progress bars colorées primary/warning/danger (AC-3)
 *  TU-115-3  : AC-6 — Stats "Total épargné" (AC-6)
 *  TU-115-3b : AC-6 — Compteur "projets actifs" (AC-6)
 *  TU-115-4  : AC-7 — Badge "J-" jours restants dans GoalList (AC-7)
 *  TU-115-5  : AC-9 — bg-background-light budgets (AC-9)
 *  TU-115-5b : AC-8 — dark:bg-background-dark budgets (AC-8)
 *  TU-115-6  : AC-9 — bg-background-light objectifs (AC-9)
 *  TU-115-6b : AC-8 — dark:bg-background-dark objectifs (AC-8)
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

let budgetsSrc: string;
let objectifsSrc: string;
let budgetProgressSrc: string;
let goalListSrc: string;

beforeAll(() => {
  budgetsSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(app)/budgets/page.tsx"),
    "utf-8"
  );
  objectifsSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(app)/objectifs/page.tsx"),
    "utf-8"
  );
  budgetProgressSrc = readFileSync(
    join(process.cwd(), "src/components/budget-progress.tsx"),
    "utf-8"
  );
  goalListSrc = readFileSync(
    join(process.cwd(), "src/components/goal-list.tsx"),
    "utf-8"
  );
});

// ── TU-115-1 : AC-2 — Card Suggestions IA ────────────────────────────────────

describe("STORY-115 — Suggestions IA card (AC-2)", () => {
  it("TU-115-1 : budgets contient 'auto_awesome' et 'Suggestions' (icône + label AC-2)", () => {
    expect(budgetsSrc).toContain("auto_awesome");
    const hasSuggestion =
      budgetsSrc.includes("Suggestions IA") ||
      budgetsSrc.includes("BudgetSuggestions") ||
      budgetsSrc.includes("Suggestion");
    expect(hasSuggestion).toBe(true);
  });

  it("TU-115-1b : budgets contient 'backdrop-blur' ou 'glass-panel' (effet glass AC-2)", () => {
    const hasGlass =
      budgetsSrc.includes("backdrop-blur") ||
      budgetsSrc.includes("glass-panel") ||
      budgetsSrc.includes("bg-white/");
    expect(hasGlass).toBe(true);
  });
});

// ── TU-115-1c : AC-1 — Header Budgets text-3xl ────────────────────────────────

describe("STORY-115 — Header Budgets (AC-1)", () => {
  it("TU-115-1c : budgets contient 'text-3xl' et 'font-extrabold' et 'tracking-tight' (titre AC-1)", () => {
    expect(budgetsSrc).toContain("text-3xl");
    expect(budgetsSrc).toContain("font-extrabold");
    expect(budgetsSrc).toContain("tracking-tight");
  });

  it("TU-115-1d : budgets contient 'bg-primary' et 'rounded-full' (bouton add AC-1)", () => {
    expect(budgetsSrc).toContain("bg-primary");
    expect(budgetsSrc).toContain("rounded-full");
  });

  it("TU-115-1e : budgets contient 'sticky' (header sticky AC-1)", () => {
    expect(budgetsSrc).toContain("sticky");
  });
});

// ── TU-115-2 : AC-3 — Progress bars colorées ─────────────────────────────────

describe("STORY-115 — Progress bars colorées (AC-3)", () => {
  it("TU-115-2 : budget-progress contient 'bg-primary' + 'bg-warning' + 'bg-danger' (3 états AC-3)", () => {
    expect(budgetProgressSrc).toContain("bg-primary");
    expect(budgetProgressSrc).toContain("bg-warning");
    expect(budgetProgressSrc).toContain("bg-danger");
  });

  it("TU-115-2b : budget-progress contient 'role=\"progressbar\"' (progress bar accessible AC-3)", () => {
    expect(budgetProgressSrc).toContain("role=\"progressbar\"");
  });
});

// ── TU-115-3 : AC-6 — Stats objectifs ────────────────────────────────────────

describe("STORY-115 — Stats objectifs (AC-6)", () => {
  it("TU-115-3 : objectifs contient 'Total' et 'épargné' (total épargné AC-6)", () => {
    expect(objectifsSrc).toContain("Total");
    expect(objectifsSrc).toContain("épargné");
  });

  it("TU-115-3b : objectifs contient 'actifs' (compteur projets actifs AC-6)", () => {
    const hasActifs =
      objectifsSrc.includes("actifs") ||
      objectifsSrc.includes("projets actifs");
    expect(hasActifs).toBe(true);
  });
});

// ── TU-115-4 : AC-7 — Badge jours restants ───────────────────────────────────

describe("STORY-115 — Badge jours restants GoalList (AC-7)", () => {
  it("TU-115-4 : goal-list contient 'J-' (badge jours restants AC-7)", () => {
    expect(goalListSrc).toContain("J-");
  });
});

// ── TU-115-5/6 : AC-8/9 — Dark mode + bg-background-light ────────────────────

describe("STORY-115 — Dark mode + bg-background-light Budgets (AC-8/9)", () => {
  it("TU-115-5 : budgets contient 'bg-background-light' (AC-9)", () => {
    expect(budgetsSrc).toContain("bg-background-light");
  });

  it("TU-115-5b : budgets contient 'dark:bg-background-dark' (AC-8)", () => {
    expect(budgetsSrc).toContain("dark:bg-background-dark");
  });
});

describe("STORY-115 — Dark mode + bg-background-light Objectifs (AC-8/9)", () => {
  it("TU-115-6 : objectifs contient 'bg-background-light' (AC-9)", () => {
    expect(objectifsSrc).toContain("bg-background-light");
  });

  it("TU-115-6b : objectifs contient 'dark:bg-background-dark' (AC-8)", () => {
    expect(objectifsSrc).toContain("dark:bg-background-dark");
  });
});
