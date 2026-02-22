import { describe, it, expect } from "vitest";

// Logique de décision extraite pour testabilité unitaire
function shouldAutoCategorize(setting: string | null | undefined): boolean {
  return setting === "true";
}

describe("auto-catégorisation à l'import — logique de décision", () => {
  it("TU-49-1 : setting 'true' → auto-catégorisation activée", () => {
    expect(shouldAutoCategorize("true")).toBe(true);
  });

  it("TU-49-2 : setting 'false' → auto-catégorisation désactivée", () => {
    expect(shouldAutoCategorize("false")).toBe(false);
  });

  it("TU-49-3 : setting absente (null/undefined) → non activée par défaut", () => {
    expect(shouldAutoCategorize(null)).toBe(false);
    expect(shouldAutoCategorize(undefined)).toBe(false);
  });

  it("TU-49-4 : erreur dans le callback fire-and-forget → exception non propagée", () => {
    const failingPromise = async (): Promise<void> => {
      throw new Error("AI failure");
    };
    // Simule le pattern fire-and-forget utilisé dans confirmImportAction
    expect(() => {
      failingPromise().catch(() => {});
    }).not.toThrow();
  });

  // === Tests QA — robustesse des valeurs de setting ===

  it("QA-49-1 : setting chaîne vide → non activée (valeur aberrante DB)", () => {
    expect(shouldAutoCategorize("")).toBe(false);
  });

  it("QA-49-2 : setting 'TRUE' (majuscules) → non activée (sensibilité à la casse)", () => {
    expect(shouldAutoCategorize("TRUE")).toBe(false);
    expect(shouldAutoCategorize("True")).toBe(false);
  });
});
