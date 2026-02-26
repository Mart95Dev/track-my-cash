/**
 * Tests QA — STORY-115 (forge-verify)
 * Comble les gaps identifiés lors de l'audit :
 *
 *  GAP-115-A : AC-1 — "Budgets" texte du titre h1 non testé
 *  GAP-115-B : AC-3 — Seuils 80/100 de getBudgetColor non vérifiés
 *  GAP-115-C : AC-4 — BudgetProgress montant "sur" (dépensé/total) non testé
 *  GAP-115-D : AC-5 — "Objectifs" texte du titre objectifs/page.tsx non testé
 *  GAP-115-E : AC-7 — GoalList progress bar (role=progressbar) non testée
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

// ── GAP-115-A : AC-1 — "Budgets" texte titre ──────────────────────────────────

describe("STORY-115 QA — Titre Budgets (AC-1, GAP-A)", () => {
  it("QA-115-A : budgets contient 'Budgets' (texte du h1 AC-1)", () => {
    expect(budgetsSrc).toContain("Budgets");
  });
});

// ── GAP-115-B : AC-3 — Seuils 80/100 getBudgetColor ──────────────────────────

describe("STORY-115 QA — Seuils progress bar (AC-3, GAP-B)", () => {
  it("QA-115-B : budget-progress contient seuil '>= 100' (danger AC-3)", () => {
    expect(budgetProgressSrc).toContain(">= 100");
  });

  it("QA-115-B2 : budget-progress contient seuil '>= 80' (warning AC-3)", () => {
    expect(budgetProgressSrc).toContain(">= 80");
  });
});

// ── GAP-115-C : AC-4 — BudgetProgress montant dépensé/total ──────────────────

describe("STORY-115 QA — BudgetProgress montant (AC-4, GAP-C)", () => {
  it("QA-115-C : budget-progress contient 'sur' (montant dépensé sur total AC-4)", () => {
    expect(budgetProgressSrc).toContain("sur");
  });

  it("QA-115-C2 : budget-progress contient 'Reste' (montant restant AC-4)", () => {
    expect(budgetProgressSrc).toContain("Reste");
  });
});

// ── GAP-115-D : AC-5 — "Objectifs" titre texte ────────────────────────────────

describe("STORY-115 QA — Titre Objectifs (AC-5, GAP-D)", () => {
  it("QA-115-D : objectifs contient 'Objectifs' (texte du titre h1 AC-5)", () => {
    expect(objectifsSrc).toContain("Objectifs");
  });

  it("QA-115-D2 : objectifs contient 'sticky' (header sticky AC-5)", () => {
    expect(objectifsSrc).toContain("sticky");
  });
});

// ── GAP-115-E : AC-7 — GoalList progress bar ─────────────────────────────────

describe("STORY-115 QA — GoalList progress bar (AC-7, GAP-E)", () => {
  it("QA-115-E : goal-list contient 'role=\"progressbar\"' (barre progression AC-7)", () => {
    expect(goalListSrc).toContain("role=\"progressbar\"");
  });
});
