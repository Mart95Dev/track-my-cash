/**
 * Tests QA — STORY-116 (forge-verify)
 * Comble les gaps identifiés lors de l'audit :
 *
 *  GAP-116-A : AC-1 — Sections iOS (abonnement, données, catégorisation) non testées
 *  GAP-116-B : AC-2 — Composants toggle réels (AutoCategorizeToggle, WeeklyEmailToggle) non testés
 *  GAP-116-C : AC-5 — Texte "Suggestions IA" card insight recurrents non testé
 *  GAP-116-D : AC-6 — Labels fréquence (Hebdo, Mensuel) et icône autorenew non testés
 *  GAP-116-E : AC-7 — RecurringForm (bouton Ajouter) non testé
 *  GAP-116-F : AC-8 — Prévisions : paramètre accountId dans ForecastControls non testé
 *  GAP-116-G : AC-9 — AccountFilter (chips comptes) dans recurrents non testé
 *  GAP-116-H : AC-10 — bg-background-light dans recurrents non testé
 *  GAP-116-I : AC-11 — Fonctions critiques préservées (getRecurringPayments, ForecastTable) non testées
 *  GAP-116-J : AC-10 — Prévisions cas empty state dark mode non testé
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

let paramsSrc: string;
let recurrentsSrc: string;
let previsionsSrc: string;

beforeAll(() => {
  paramsSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(app)/parametres/page.tsx"),
    "utf-8"
  );
  recurrentsSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(app)/recurrents/page.tsx"),
    "utf-8"
  );
  previsionsSrc = readFileSync(
    join(process.cwd(), "src/app/[locale]/(app)/previsions/page.tsx"),
    "utf-8"
  );
});

// ── GAP-116-A : AC-1 — Sections iOS Paramètres ───────────────────────────────

describe("STORY-116 QA — Sections iOS Paramètres (AC-1, GAP-A)", () => {
  it("QA-116-A1 : parametres contient 'Abonnement' (section abonnement AC-1)", () => {
    expect(paramsSrc).toContain("Abonnement");
  });

  it("QA-116-A2 : parametres contient 'Mes données' (section données AC-1)", () => {
    expect(paramsSrc).toContain("Mes données");
  });

  it("QA-116-A3 : parametres contient 'Règles de catégorisation' (section catégorisation AC-1)", () => {
    expect(paramsSrc).toContain("Règles de catégorisation");
  });

  it("QA-116-A4 : parametres contient 'SettingsCard' (composant grouped-list AC-1)", () => {
    expect(paramsSrc).toContain("SettingsCard");
  });

  it("QA-116-A5 : parametres contient 'rounded-2xl' (cards iOS style AC-1)", () => {
    expect(paramsSrc).toContain("rounded-2xl");
  });
});

// ── GAP-116-B : AC-2 — Toggles switches iOS ──────────────────────────────────

describe("STORY-116 QA — Toggle switches iOS (AC-2, GAP-B)", () => {
  it("QA-116-B1 : parametres contient 'AutoCategorizeToggle' (toggle IA AC-2)", () => {
    expect(paramsSrc).toContain("AutoCategorizeToggle");
  });

  it("QA-116-B2 : parametres contient 'WeeklyEmailToggle' (toggle email AC-2)", () => {
    expect(paramsSrc).toContain("WeeklyEmailToggle");
  });

  it("QA-116-B3 : parametres contient 'toggleAutoCategorizationAction' (action toggle AC-2)", () => {
    expect(paramsSrc).toContain("toggleAutoCategorizationAction");
  });
});

// ── GAP-116-C : AC-5 — Texte "Suggestions IA" recurrents ─────────────────────

describe("STORY-116 QA — Card Suggestions IA recurrents (AC-5, GAP-C)", () => {
  it("QA-116-C1 : recurrents contient 'Suggestions IA' (texte card insight AC-5)", () => {
    expect(recurrentsSrc).toContain("Suggestions IA");
  });

  it("QA-116-C2 : recurrents contient 'RecurringSuggestions' (composant insight AC-5)", () => {
    expect(recurrentsSrc).toContain("RecurringSuggestions");
  });

  it("QA-116-C3 : recurrents contient 'border-primary/20' (bordure card insight AC-5)", () => {
    expect(recurrentsSrc).toContain("border-primary/20");
  });
});

// ── GAP-116-D : AC-6 — Labels fréquence et icône autorenew ───────────────────

describe("STORY-116 QA — Labels fréquence récurrents (AC-6, GAP-D)", () => {
  it("QA-116-D1 : recurrents contient 'Hebdo' (label fréquence hebdomadaire AC-6)", () => {
    expect(recurrentsSrc).toContain("Hebdo");
  });

  it("QA-116-D2 : recurrents contient 'Mensuel' (label fréquence mensuelle AC-6)", () => {
    expect(recurrentsSrc).toContain("Mensuel");
  });

  it("QA-116-D3 : recurrents contient 'autorenew' (icône paiement récurrent AC-6)", () => {
    expect(recurrentsSrc).toContain("autorenew");
  });

  it("QA-116-D4 : recurrents contient 'formatCurrency' (montant formaté AC-6)", () => {
    expect(recurrentsSrc).toContain("formatCurrency");
  });
});

// ── GAP-116-E : AC-7 — RecurringForm (bouton Ajouter) ────────────────────────

describe("STORY-116 QA — Bouton Ajouter récurrents (AC-7, GAP-E)", () => {
  it("QA-116-E1 : recurrents contient 'RecurringForm' (formulaire ajout AC-7)", () => {
    expect(recurrentsSrc).toContain("RecurringForm");
  });

  it("QA-116-E2 : recurrents contient 'Nouveau paiement récurrent' (titre formulaire AC-7)", () => {
    expect(recurrentsSrc).toContain("Nouveau paiement récurrent");
  });

  it("QA-116-E3 : recurrents contient 'add_circle' (icône bouton ajouter AC-7)", () => {
    expect(recurrentsSrc).toContain("add_circle");
  });
});

// ── GAP-116-F : AC-8 — Prévisions ForecastControls + accountId ───────────────

describe("STORY-116 QA — ForecastControls avec filtres (AC-8/9, GAP-F)", () => {
  it("QA-116-F1 : previsions contient 'currentAccountId' (filtre compte AC-9)", () => {
    expect(previsionsSrc).toContain("currentAccountId");
  });

  it("QA-116-F2 : previsions contient 'currentMonths' (navigation mois AC-8)", () => {
    expect(previsionsSrc).toContain("currentMonths");
  });

  it("QA-116-F3 : previsions contient 'months' comme searchParam (navigation mois AC-8)", () => {
    expect(previsionsSrc).toContain("months");
  });
});

// ── GAP-116-G : AC-9 — AccountFilter chips comptes recurrents ─────────────────

describe("STORY-116 QA — AccountFilter recurrents (AC-9, GAP-G)", () => {
  it("QA-116-G1 : recurrents contient 'AccountFilter' (chips comptes AC-9)", () => {
    expect(recurrentsSrc).toContain("AccountFilter");
  });

  it("QA-116-G2 : recurrents contient 'accountId' (filtre par compte AC-9)", () => {
    expect(recurrentsSrc).toContain("accountId");
  });
});

// ── GAP-116-H : AC-10 — Dark mode recurrents bg-background-light ──────────────

describe("STORY-116 QA — Recurrents bg-background-light (AC-10, GAP-H)", () => {
  it("QA-116-H1 : recurrents contient 'bg-background-light' (fond clair AC-10)", () => {
    expect(recurrentsSrc).toContain("bg-background-light");
  });

  it("QA-116-H2 : recurrents contient 'backdrop-blur-md' (header blur AC-10)", () => {
    expect(recurrentsSrc).toContain("backdrop-blur-md");
  });
});

// ── GAP-116-I : AC-11 — Fonctionnalités existantes préservées ─────────────────

describe("STORY-116 QA — Fonctionnalités préservées (AC-11, GAP-I)", () => {
  it("QA-116-I1 : recurrents contient 'getRecurringPayments' (query récurrents AC-11)", () => {
    expect(recurrentsSrc).toContain("getRecurringPayments");
  });

  it("QA-116-I2 : recurrents contient 'detectRecurringSuggestionsAction' (action IA AC-11)", () => {
    expect(recurrentsSrc).toContain("detectRecurringSuggestionsAction");
  });

  it("QA-116-I3 : previsions contient 'ForecastTable' (tableau prévisions AC-11)", () => {
    expect(previsionsSrc).toContain("ForecastTable");
  });

  it("QA-116-I4 : previsions contient 'ScenarioSimulator' (simulateur AC-11)", () => {
    expect(previsionsSrc).toContain("ScenarioSimulator");
  });

  it("QA-116-I5 : previsions contient 'computeForecast' (calcul prévisions AC-11)", () => {
    expect(previsionsSrc).toContain("computeForecast");
  });

  it("QA-116-I6 : parametres contient 'getCategorizationRules' (règles catégorisation AC-11)", () => {
    expect(paramsSrc).toContain("getCategorizationRules");
  });

  it("QA-116-I7 : parametres contient 'getUserSubscription' (abonnement AC-11)", () => {
    expect(paramsSrc).toContain("getUserSubscription");
  });
});

// ── GAP-116-J : AC-10 — Prévisions empty state dark mode ─────────────────────

describe("STORY-116 QA — Prévisions empty state dark mode (AC-10, GAP-J)", () => {
  it("QA-116-J1 : previsions contient 'bg-background-light dark:bg-background-dark' dans les retours vides (AC-10)", () => {
    // Le composant a 2 early returns avec dark mode sur les états vides
    const occurrences = (previsionsSrc.match(/bg-background-light dark:bg-background-dark/g) ?? []).length;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });

  it("QA-116-J2 : previsions contient 'EmptyState' (composant état vide AC-11)", () => {
    expect(previsionsSrc).toContain("EmptyState");
  });
});
