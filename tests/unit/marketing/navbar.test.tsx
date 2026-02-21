import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock du Link i18n
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    className,
    onClick,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

// Mock des composants shadcn/ui lourds
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  SheetTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
    className,
    ...props
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    className?: string;
    [key: string]: unknown;
  }) => {
    if (asChild) {
      return <>{children}</>;
    }
    return (
      <button className={className} {...props}>
        {children}
      </button>
    );
  },
}));

vi.mock("lucide-react", () => ({
  Menu: () => <span data-testid="menu-icon">menu</span>,
}));

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TU-1-1 : contient un lien vers /tarifs", async () => {
    const { Navbar } = await import("@/components/marketing/navbar");
    render(<Navbar />);
    const tarifLinks = screen
      .getAllByRole("link")
      .filter((el) => el.getAttribute("href") === "/tarifs");
    expect(tarifLinks.length).toBeGreaterThan(0);
  });

  it("TU-1-2 : contient un bouton 'Commencer' vers /inscription", async () => {
    const { Navbar } = await import("@/components/marketing/navbar");
    render(<Navbar />);
    const links = screen
      .getAllByRole("link")
      .filter((el) => el.getAttribute("href") === "/inscription");
    expect(links.length).toBeGreaterThan(0);
    expect(links[0].textContent).toContain("Commencer");
  });

  it("TU-1-3 : contient un bouton 'Connexion' vers /connexion", async () => {
    const { Navbar } = await import("@/components/marketing/navbar");
    render(<Navbar />);
    const links = screen
      .getAllByRole("link")
      .filter((el) => el.getAttribute("href") === "/connexion");
    expect(links.length).toBeGreaterThan(0);
    expect(links[0].textContent).toContain("Connexion");
  });

  it("TU-1-4 : le logo 'TrackMyCash' est présent", async () => {
    const { Navbar } = await import("@/components/marketing/navbar");
    render(<Navbar />);
    const logoLink = screen
      .getAllByRole("link")
      .find((el) => el.getAttribute("href") === "/");
    expect(logoLink).toBeDefined();
    expect(logoLink?.textContent).toContain("TrackMyCash");
  });
});
