/**
 * TU-101-1 à TU-101-3 — STORY-101
 * Tests unitaires : CoupleInviteBanner component
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

import { CoupleInviteBanner } from "@/components/couple-invite-banner";

// ─── TU-101-1 : Affiche le code d'invitation ──────────────────────────────────

describe("CoupleInviteBanner — STORY-101", () => {
  it("TU-101-1 : affiche le code d'invitation dans le banner", () => {
    render(<CoupleInviteBanner inviteCode="ABC123" locale="fr" />);
    expect(screen.getByText("ABC123")).toBeDefined();
  });

  // ─── TU-101-2 : Lien vers /couple ─────────────────────────────────────────

  it("TU-101-2 : contient un lien href vers /fr/couple", () => {
    render(<CoupleInviteBanner inviteCode="XYZ789" locale="fr" />);
    const link = screen.getByRole("link");
    const href = link.getAttribute("href");
    expect(href).toBe("/fr/couple");
  });

  // ─── TU-101-3 : Pas de bouton de fermeture ────────────────────────────────

  it("TU-101-3 : ne contient pas de bouton de fermeture (non-dismissable)", () => {
    render(<CoupleInviteBanner inviteCode="ABC123" locale="fr" />);

    // Aucun bouton avec aria-label "fermer" ou "close"
    const closeByAriaFermer = screen.queryByLabelText(/fermer/i);
    const closeByAriaClose = screen.queryByLabelText(/close/i);

    expect(closeByAriaFermer).toBeNull();
    expect(closeByAriaClose).toBeNull();

    // Aucun bouton du tout (la bannière n'a que des liens, pas de boutons)
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(0);
  });
});
