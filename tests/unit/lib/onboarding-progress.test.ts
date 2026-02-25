/**
 * TU-105-1 à TU-105-6 — STORY-105
 * Tests unitaires : computeOnboardingProgress (logique pure)
 */
import { describe, it, expect } from "vitest";
import { computeOnboardingProgress } from "@/lib/onboarding-progress";

describe("computeOnboardingProgress (STORY-105)", () => {
  it("TU-105-2 : 'Compte créé' toujours complété — minimum 1/4", () => {
    const result = computeOnboardingProgress({
      hasTransactions: false,
      hasPartner: false,
      hasCoupleBudget: false,
    });
    expect(result.completed).toBe(1);
    expect(result.steps[0].completed).toBe(true);
    expect(result.steps[0].label).toBe("Compte créé");
  });

  it("TU-105-1 : 1/4 si aucune condition supplémentaire remplie", () => {
    const result = computeOnboardingProgress({
      hasTransactions: false,
      hasPartner: false,
      hasCoupleBudget: false,
    });
    expect(result.completed).toBe(1);
    expect(result.total).toBe(4);
  });

  it("TU-105-3 : 2/4 si hasTransactions=true", () => {
    const result = computeOnboardingProgress({
      hasTransactions: true,
      hasPartner: false,
      hasCoupleBudget: false,
    });
    expect(result.completed).toBe(2);
  });

  it("TU-105-4 : 3/4 si hasTransactions + hasPartner", () => {
    const result = computeOnboardingProgress({
      hasTransactions: true,
      hasPartner: true,
      hasCoupleBudget: false,
    });
    expect(result.completed).toBe(3);
  });

  it("TU-105-5 : 4/4 si tout complété", () => {
    const result = computeOnboardingProgress({
      hasTransactions: true,
      hasPartner: true,
      hasCoupleBudget: true,
    });
    expect(result.completed).toBe(4);
    expect(result.total).toBe(4);
  });

  it("TU-105-6 : percentage = completed/total*100", () => {
    const result = computeOnboardingProgress({
      hasTransactions: true,
      hasPartner: true,
      hasCoupleBudget: true,
    });
    expect(result.percentage).toBe(100);

    const partial = computeOnboardingProgress({
      hasTransactions: false,
      hasPartner: false,
      hasCoupleBudget: false,
    });
    expect(partial.percentage).toBe(25);
  });
});
