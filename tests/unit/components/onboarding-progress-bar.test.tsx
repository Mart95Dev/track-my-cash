/**
 * TU-105-7 à TU-105-9 — STORY-105
 * Tests unitaires : OnboardingProgressBar component
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OnboardingProgressBar } from "@/components/onboarding-progress-bar";
import { computeOnboardingProgress } from "@/lib/onboarding-progress";

describe("OnboardingProgressBar (STORY-105)", () => {
  it("TU-105-7 : affiche '1 / 4 complétées' si 1/4", () => {
    const progress = computeOnboardingProgress({
      hasTransactions: false,
      hasPartner: false,
      hasCoupleBudget: false,
    });
    render(<OnboardingProgressBar progress={progress} locale="fr" />);
    expect(screen.getByText(/1\s*\/\s*4/)).toBeTruthy();
  });

  it("TU-105-8 : affiche '4 / 4 complétées' si tout complété", () => {
    const progress = computeOnboardingProgress({
      hasTransactions: true,
      hasPartner: true,
      hasCoupleBudget: true,
    });
    render(<OnboardingProgressBar progress={progress} locale="fr" />);
    expect(screen.getByText(/4\s*\/\s*4/)).toBeTruthy();
  });

  it("TU-105-9 : affiche les 4 labels d’étapes", () => {
    const progress = computeOnboardingProgress({
      hasTransactions: false,
      hasPartner: false,
      hasCoupleBudget: false,
    });
    render(<OnboardingProgressBar progress={progress} locale="fr" />);
    expect(screen.getByText("Compte créé")).toBeTruthy();
    expect(screen.getByText("1ère transaction")).toBeTruthy();
    expect(screen.getByText("Partenaire invité")).toBeTruthy();
    expect(screen.getByText("Budget commun")).toBeTruthy();
  });
});
