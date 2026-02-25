/**
 * TU-102-1 à TU-102-5 — STORY-102
 * Tests unitaires : BottomNav onglet Couple
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  usePathname: () => "/fr/dashboard",
  useParams: () => ({ locale: "fr" }),
}));

import { BottomNav } from "@/components/bottom-nav";

// ─── TU-102-1 : Onglet Couple présent ─────────────────────────────────────────

describe("BottomNav — onglet Couple (STORY-102)", () => {
  it("TU-102-1 : affiche un onglet 'Couple' dans la navigation", () => {
    render(<BottomNav />);
    expect(screen.getByText("Couple")).toBeDefined();
  });

  // ─── TU-102-2 : Href vers /couple ─────────────────────────────────────────

  it("TU-102-2 : le lien Couple contient '/couple' dans son href", () => {
    render(<BottomNav />);
    const links = screen.getAllByRole("link");
    const coupleLink = links.find((link) =>
      link.getAttribute("href")?.includes("/couple")
    );
    expect(coupleLink).toBeDefined();
    expect(coupleLink!.getAttribute("href")).toBe("/fr/couple");
  });

  // ─── TU-102-3 : Badge présent quand coupleIncomplete=true ────────────────

  it("TU-102-3 : badge rouge présent quand coupleIncomplete=true", () => {
    render(<BottomNav coupleIncomplete={true} />);
    const badge = screen.getByLabelText("couple incomplet");
    expect(badge).toBeDefined();
  });

  // ─── TU-102-4 : Pas de badge quand coupleIncomplete=false ────────────────

  it("TU-102-4 : pas de badge quand coupleIncomplete=false", () => {
    render(<BottomNav coupleIncomplete={false} />);
    const badge = screen.queryByLabelText("couple incomplet");
    expect(badge).toBeNull();
  });

  // ─── TU-102-5 : Exactement 5 onglets, Récurrents n'est plus là ───────────

  it("TU-102-5 : BottomNav contient exactement 5 items de navigation", () => {
    render(<BottomNav />);
    // Les 5 onglets : Dashboard, Comptes, Transactions, Couple, IA
    const navLinks = screen.getAllByRole("link");
    // Filtre uniquement les liens de nav (exclut le badge notifications s'il y en a)
    const navItems = navLinks.filter((link) => {
      const href = link.getAttribute("href") ?? "";
      return (
        href.includes("/dashboard") ||
        href.includes("/comptes") ||
        href.includes("/transactions") ||
        href.includes("/couple") ||
        href.includes("/conseiller")
      );
    });
    expect(navItems).toHaveLength(5);

    // Vérifie que 'Récurrents' n'est plus dans le DOM
    expect(screen.queryByText("Récurrents")).toBeNull();
  });
});
