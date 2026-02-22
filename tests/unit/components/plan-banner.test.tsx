import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { PlanBanner } from "@/components/plan-banner";

describe("PlanBanner — bannière upgrade contextuelle (AC-2 à AC-4)", () => {
  it("TU-60-1 : plan=free → message 'Passez Pro' présent", () => {
    render(<PlanBanner plan="free" />);
    expect(screen.getByText(/passez pro/i)).toBeDefined();
  });

  it("TU-60-2 : plan=free → lien /tarifs présent", () => {
    render(<PlanBanner plan="free" />);
    const links = screen.getAllByRole("link");
    const tarifsLink = links.find((l) => l.getAttribute("href") === "/tarifs");
    expect(tarifsLink).toBeDefined();
  });

  it("TU-60-3 : plan=pro, status=trialing, daysRemaining=5 → '5 jours' affiché", () => {
    render(<PlanBanner plan="pro" status="trialing" daysRemaining={5} />);
    expect(screen.getByText(/5 jours/i)).toBeDefined();
  });

  it("TU-60-4 : plan=pro, status=trialing → bouton 'Souscrire' présent", () => {
    render(<PlanBanner plan="pro" status="trialing" daysRemaining={5} />);
    expect(screen.getByText("Souscrire")).toBeDefined();
  });

  it("TU-60-5 : plan=premium → null (aucun rendu)", () => {
    const { container } = render(<PlanBanner plan="premium" />);
    expect(container.firstChild).toBeNull();
  });

  it("TU-60-6 : plan=pro, status=active → null (aucun rendu)", () => {
    const { container } = render(<PlanBanner plan="pro" status="active" />);
    expect(container.firstChild).toBeNull();
  });
});
