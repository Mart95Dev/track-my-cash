/**
 * TU-93-5 à TU-93-8 — STORY-093
 * Tests unitaires : CoupleOnboardingWizard component
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

// ─── TU-93-5 : Rendu step 1 par défaut ───────────────────────────────────────

describe("CoupleOnboardingWizard — step 1 (STORY-093)", () => {
  it("TU-93-5 : affiche le step 1 Bienvenue avec texte 'couple'", () => {
    render(<CoupleOnboardingWizard locale="fr" />);
    // Le contenu step 1 mentionne "couple"
    const content = document.body.textContent ?? "";
    expect(content.toLowerCase()).toContain("couple");
  });

  it("TU-93-8 : indicateur de progression affiche '1 / 4' ou l'étape 1", () => {
    render(<CoupleOnboardingWizard locale="fr" />);
    const content = document.body.textContent ?? "";
    // Doit mentionner l'étape 1 sur 4
    expect(content).toMatch(/1\s*[/|sur]\s*4/i);
  });
});

// ─── TU-93-6 : Navigation entre étapes ───────────────────────────────────────

describe("CoupleOnboardingWizard — navigation (STORY-093)", () => {
  it("TU-93-6 : clic 'Suivant' depuis step 1 avance au step 2", () => {
    render(<CoupleOnboardingWizard locale="fr" />);
    const nextBtn = screen.getByRole("button", { name: /commencer|suivant/i });
    fireEvent.click(nextBtn);
    // Step 2 contient "créer" ou "rejoindre"
    const content = document.body.textContent ?? "";
    expect(content.toLowerCase()).toMatch(/créer|rejoindre/);
  });
});

// ─── TU-93-7 : Bouton Passer appelle markOnboardingCompleteAction ─────────────

describe("CoupleOnboardingWizard — bouton Passer (STORY-093)", () => {
  it("TU-93-7 : clic 'Passer' appelle markOnboardingCompleteAction", async () => {
    const { markOnboardingCompleteAction } = await import(
      "@/app/actions/couple-actions"
    );
    render(<CoupleOnboardingWizard locale="fr" />);
    const skipBtn = screen.getByRole("button", { name: /passer/i });
    fireEvent.click(skipBtn);
    // L'action est appelée de manière asynchrone — on vérifie après un tick
    await new Promise((r) => setTimeout(r, 10));
    expect(markOnboardingCompleteAction).toHaveBeenCalled();
  });
});
