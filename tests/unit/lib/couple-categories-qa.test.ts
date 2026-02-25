/**
 * STORY-099 — Catégories prédéfinies couple
 * QA tests complémentaires écrits par le QA Agent (TEA).
 * Ne réécrit pas les tests TU-99-1 à TU-99-10 déjà couverts par le Dev.
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { COUPLE_CATEGORIES, isCategoryEmpty } from "@/lib/couple-categories";

// ---------------------------------------------------------------------------
// TU-99-QA-1 à TU-99-QA-4 : isCategoryEmpty — cas limites non couverts
// ---------------------------------------------------------------------------

describe("isCategoryEmpty — cas limites QA (STORY-099)", () => {
  it("TU-99-QA-1 : isCategoryEmpty(null) → true", () => {
    // La signature accepte null mais aucun test Dev ne couvre ce cas
    expect(isCategoryEmpty(null)).toBe(true);
  });

  it("TU-99-QA-2 : isCategoryEmpty('autre') (minuscules) → true", () => {
    // L'implémentation inclut 'autre' dans EMPTY_CATEGORY_VALUES mais ce n'est pas testé
    expect(isCategoryEmpty("autre")).toBe(true);
  });

  it("TU-99-QA-3 : isCategoryEmpty('   ') (espaces seulement) → true", () => {
    // L'implémentation appelle category.trim() === '' — cas non testé
    expect(isCategoryEmpty("   ")).toBe(true);
  });

  it("TU-99-QA-4 : isCategoryEmpty('Loyer / charges') → false (catégorie couple valide)", () => {
    // Vérifie qu'une catégorie provenant de COUPLE_CATEGORIES n'est pas considérée vide
    expect(isCategoryEmpty("Loyer / charges")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// TU-99-QA-5 : COUPLE_CATEGORIES — contenu exact conforme à la story
// ---------------------------------------------------------------------------

describe("COUPLE_CATEGORIES — contenu exact (STORY-099)", () => {
  it("TU-99-QA-5 : COUPLE_CATEGORIES contient exactement les 8 catégories définies dans la story", () => {
    const expected = [
      "Loyer / charges",
      "Courses alimentaires",
      "Restaurants & sorties",
      "Voyages",
      "Factures communes",
      "Loisirs communs",
      "Santé commune",
      "Éducation",
    ];
    expect(COUPLE_CATEGORIES).toHaveLength(8);
    expected.forEach((cat) => {
      expect(COUPLE_CATEGORIES).toContain(cat);
    });
  });
});
