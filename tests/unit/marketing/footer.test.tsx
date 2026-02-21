import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock du Link i18n
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("Footer", () => {
  it("TU-2-1 : contient '©' et l'année courante", async () => {
    const { Footer } = await import("@/components/marketing/footer");
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText((content) => content.includes("©"))).toBeDefined();
    expect(
      screen.getByText((content) => content.includes(year))
    ).toBeDefined();
  });

  it("TU-2-2 : contient un lien 'CGU'", async () => {
    const { Footer } = await import("@/components/marketing/footer");
    render(<Footer />);
    const cguLink = screen
      .getAllByRole("link")
      .find((el) => el.textContent === "CGU");
    expect(cguLink).toBeDefined();
    expect(cguLink?.getAttribute("href")).toBe("/cgu");
  });

  it("TU-2-3 : contient un lien 'Politique de confidentialité'", async () => {
    const { Footer } = await import("@/components/marketing/footer");
    render(<Footer />);
    const privacyLink = screen
      .getAllByRole("link")
      .find((el) => el.textContent === "Politique de confidentialité");
    expect(privacyLink).toBeDefined();
    expect(privacyLink?.getAttribute("href")).toBe(
      "/politique-confidentialite"
    );
  });
});
