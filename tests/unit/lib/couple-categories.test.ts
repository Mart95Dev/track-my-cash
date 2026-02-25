import { describe, it, expect } from "vitest";
import { COUPLE_CATEGORIES, isCategoryEmpty } from "@/lib/couple-categories";

describe("couple-categories (STORY-099)", () => {
  it("TU-99-1 : COUPLE_CATEGORIES contient au moins 6 catégories", () => {
    expect(COUPLE_CATEGORIES.length).toBeGreaterThanOrEqual(6);
  });

  it("TU-99-2 : chaque catégorie est une string non vide", () => {
    for (const cat of COUPLE_CATEGORIES) {
      expect(typeof cat).toBe("string");
      expect(cat.trim().length).toBeGreaterThan(0);
    }
  });

  it("TU-99-3 : isCategoryEmpty('') → true", () => {
    expect(isCategoryEmpty("")).toBe(true);
  });

  it("TU-99-4 : isCategoryEmpty('Autre') → true", () => {
    expect(isCategoryEmpty("Autre")).toBe(true);
  });

  it("TU-99-5 : isCategoryEmpty('Courses') → false", () => {
    expect(isCategoryEmpty("Courses")).toBe(false);
  });

  it("TU-99-6 : isCategoryEmpty(undefined) → true", () => {
    expect(isCategoryEmpty(undefined)).toBe(true);
  });
});
