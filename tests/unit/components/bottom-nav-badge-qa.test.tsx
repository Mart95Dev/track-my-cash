/**
 * TU-95-QA-3 à TU-95-QA-4 — STORY-095 QA
 * Tests QA : BottomNav badge — edge cases accessibilité
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/fr/dashboard",
  useParams: () => ({ locale: "fr" }),
}));

import { BottomNav } from "@/components/bottom-nav";

describe("BottomNav — badge QA (STORY-095)", () => {
  it("TU-95-QA-3 : unreadCount=10 → badge affiche '10' (nombre à deux chiffres)", () => {
    render(<BottomNav unreadCount={10} />);
    expect(screen.getByText("10")).toBeDefined();
  });

  it("TU-95-QA-4 : unreadCount=1 → aria-label contient '1 notifications non lues' (accessibilité)", () => {
    render(<BottomNav unreadCount={1} />);
    const badge = screen.queryByLabelText(/1 notifications non lues/i);
    expect(badge).not.toBeNull();
  });
});
