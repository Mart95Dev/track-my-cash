/**
 * TU-95-9 à TU-95-10 — STORY-095
 * Tests unitaires : BottomNav badge notifications
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/fr/dashboard",
  useParams: () => ({ locale: "fr" }),
}));

import { BottomNav } from "@/components/bottom-nav";

describe("BottomNav — badge notifications (STORY-095)", () => {
  it("TU-95-9 : unreadCount=3 → badge '3' visible dans le DOM", () => {
    render(<BottomNav unreadCount={3} />);
    const badges = screen.getAllByText("3");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("TU-95-10 : unreadCount=0 → aucun badge dans le DOM", () => {
    render(<BottomNav unreadCount={0} />);
    // Vérifie qu'aucun badge avec aria-label "notifications non lues" n'est présent
    const badges = screen.queryAllByLabelText(/notifications non lues/i);
    expect(badges).toHaveLength(0);
  });
});
