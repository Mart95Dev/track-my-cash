/**
 * TU-100-5 à TU-100-7 — STORY-100
 * Tests unitaires : CoupleChoiceModal component
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/app/actions/couple-actions", () => ({
  setOnboardingChoiceAction: vi.fn().mockResolvedValue(undefined),
  createCoupleAction: vi.fn().mockResolvedValue({ success: true, inviteCode: "TEST01" }),
  markOnboardingCompleteAction: vi.fn().mockResolvedValue(undefined),
}));

import { CoupleChoiceModal } from "@/components/couple-choice-modal";

// ─── TU-100-5 : Affichage des 2 cartes par défaut ────────────────────────────

describe("CoupleChoiceModal — choix initial (STORY-100)", () => {
  it("TU-100-5 : affiche les 2 cartes 'En couple' et 'Seul(e)'", () => {
    render(<CoupleChoiceModal open={true} />);
    const content = document.body.textContent ?? "";
    expect(content).toContain("En couple");
    expect(content).toContain("Seul(e)");
  });

  it("TU-100-5b : affiche le texte 'Gérez vos finances ensemble'", () => {
    render(<CoupleChoiceModal open={true} />);
    const content = document.body.textContent ?? "";
    expect(content.toLowerCase()).toContain("gérez vos finances ensemble");
  });

  it("TU-100-5c : affiche le texte 'Continuez en solo'", () => {
    render(<CoupleChoiceModal open={true} />);
    const content = document.body.textContent ?? "";
    expect(content.toLowerCase()).toContain("continuez en solo");
  });
});

// ─── TU-100-6 : Les cartes sont des boutons cliquables ────────────────────────

describe("CoupleChoiceModal — boutons cliquables (STORY-100)", () => {
  it("TU-100-6a : la carte 'En couple' est un bouton avec aria-label", () => {
    render(<CoupleChoiceModal open={true} />);
    const btn = screen.getByRole("button", { name: /en couple/i });
    expect(btn).toBeDefined();
  });

  it("TU-100-6b : la carte 'Seul(e)' est un bouton avec aria-label", () => {
    render(<CoupleChoiceModal open={true} />);
    const btn = screen.getByRole("button", { name: /seul/i });
    expect(btn).toBeDefined();
  });
});

// ─── TU-100-7 : prop inviteCode affiche le code ────────────────────────────

describe("CoupleChoiceModal — affichage code invite (STORY-100)", () => {
  it("TU-100-7 : prop inviteCode affiche le code dans l'interface", () => {
    render(<CoupleChoiceModal open={true} inviteCode="XYZ789" />);
    const content = document.body.textContent ?? "";
    expect(content).toContain("XYZ789");
  });

  it("TU-100-7b : affiche 'Code d'invitation' quand inviteCode est fourni", () => {
    render(<CoupleChoiceModal open={true} inviteCode="ABC123" />);
    const content = document.body.textContent ?? "";
    expect(content.toLowerCase()).toContain("code");
    expect(content).toContain("ABC123");
  });

  it("TU-100-7c : affiche les boutons Copier et Partager quand inviteCode est fourni", () => {
    render(<CoupleChoiceModal open={true} inviteCode="ABC123" />);
    const copyBtn = screen.getByRole("button", { name: /copier/i });
    const shareBtn = screen.getByRole("button", { name: /partager/i });
    expect(copyBtn).toBeDefined();
    expect(shareBtn).toBeDefined();
  });
});
