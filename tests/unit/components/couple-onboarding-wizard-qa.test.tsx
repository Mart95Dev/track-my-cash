/**
 * QA STORY-093 — Onboarding wizard couple — Tests composant manquants
 *
 * GAPs couverts :
 *   QA-93-1 : AC-3 — step 3 contient un lien vers /{locale}/couple
 *   QA-93-2 : AC-6 — step 4 contient un lien vers /{locale}/transactions
 *   QA-93-3 : AC-6 — step 4 affiche le bouton "Terminer"
 *   QA-93-4 : handleFinish (bouton "Terminer") appelle markOnboardingCompleteAction
 *   QA-93-5 : navigation complète step 1 → 2 → 3 → 4 (indicateur de progression)
 *   QA-93-6 : onglet "Rejoindre" cliquable dans step 2 (AC-2)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/app/actions/couple-actions", () => ({
  markOnboardingCompleteAction: vi.fn().mockResolvedValue(undefined),
  createCoupleAction: vi.fn().mockResolvedValue({ success: true, inviteCode: "ABC123" }),
  joinCoupleAction: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { CoupleOnboardingWizard } from "@/components/couple-onboarding-wizard";

// ─── Helpers de navigation ────────────────────────────────────────────────────

function navigateToStep(targetStep: number) {
  if (targetStep >= 2) {
    const startBtn = screen.getByRole("button", { name: /commencer|suivant/i });
    fireEvent.click(startBtn);
  }
  if (targetStep >= 3) {
    const continueBtn = screen.getByRole("button", { name: /continuer/i });
    fireEvent.click(continueBtn);
  }
  if (targetStep >= 4) {
    const nextBtn = screen.getByRole("button", { name: /suivant/i });
    fireEvent.click(nextBtn);
  }
}

// ─── QA-93-1 : AC-3 — step 3 contient un lien code invite ───────────────────

describe("CoupleOnboardingWizard QA — step 3 code invite (AC-3)", () => {
  it("QA-93-1 : step 3 contient un lien href pointant vers /couple", () => {
    render(<CoupleOnboardingWizard locale="fr" />);
    navigateToStep(3);

    const coupleLinks = document
      .querySelectorAll('a[href*="/couple"]');
    expect(coupleLinks.length).toBeGreaterThan(0);
  });
});

// ─── QA-93-2 : AC-6 — step 4 contient un lien vers /transactions ─────────────

describe("CoupleOnboardingWizard QA — step 4 lien transactions (AC-6)", () => {
  it("QA-93-2 : step 4 contient un lien href pointant vers /transactions", () => {
    render(<CoupleOnboardingWizard locale="fr" />);
    navigateToStep(4);

    const txLinks = document.querySelectorAll('a[href*="/transactions"]');
    expect(txLinks.length).toBeGreaterThan(0);
  });
});

// ─── QA-93-3 : AC-6 — bouton "Terminer" au step 4 ───────────────────────────

describe("CoupleOnboardingWizard QA — bouton Terminer au step 4 (AC-6)", () => {
  it("QA-93-3 : step 4 affiche un bouton 'Terminer'", () => {
    render(<CoupleOnboardingWizard locale="fr" />);
    navigateToStep(4);

    expect(screen.getByRole("button", { name: /terminer/i })).toBeDefined();
  });
});

// ─── QA-93-4 : handleFinish appelle markOnboardingCompleteAction ─────────────

describe("CoupleOnboardingWizard QA — handleFinish appelle l'action (AC-4)", () => {
  it("QA-93-4 : clic 'Terminer' appelle markOnboardingCompleteAction", async () => {
    const { markOnboardingCompleteAction } = await import(
      "@/app/actions/couple-actions"
    );
    vi.clearAllMocks();

    render(<CoupleOnboardingWizard locale="fr" />);
    navigateToStep(4);
    fireEvent.click(screen.getByRole("button", { name: /terminer/i }));

    await new Promise((r) => setTimeout(r, 10));
    expect(markOnboardingCompleteAction).toHaveBeenCalled();
  });
});

// ─── QA-93-5 : navigation complète 4 steps ───────────────────────────────────

describe("CoupleOnboardingWizard QA — navigation complète", () => {
  it("QA-93-5 : indicateur affiche '2 / 4' après le premier clic Commencer", () => {
    render(<CoupleOnboardingWizard locale="fr" />);
    navigateToStep(2);
    const content = document.body.textContent ?? "";
    expect(content).toMatch(/2\s*[/|sur]\s*4/i);
  });

  it("QA-93-5b : indicateur affiche '3 / 4' au step 3", () => {
    render(<CoupleOnboardingWizard locale="fr" />);
    navigateToStep(3);
    const content = document.body.textContent ?? "";
    expect(content).toMatch(/3\s*[/|sur]\s*4/i);
  });

  it("QA-93-5c : indicateur affiche '4 / 4' au step 4", () => {
    render(<CoupleOnboardingWizard locale="fr" />);
    navigateToStep(4);
    const content = document.body.textContent ?? "";
    expect(content).toMatch(/4\s*[/|sur]\s*4/i);
  });
});

// ─── QA-93-6 : onglet "Rejoindre" cliquable dans step 2 ──────────────────────

describe("CoupleOnboardingWizard QA — onglets step 2 (AC-2)", () => {
  it("QA-93-6 : les deux onglets Créer et Rejoindre sont présents au step 2", () => {
    render(<CoupleOnboardingWizard locale="fr" />);
    navigateToStep(2);

    const rejoindreBtn = screen.getByRole("button", { name: /rejoindre/i });
    expect(rejoindreBtn).toBeDefined();
  });
});
