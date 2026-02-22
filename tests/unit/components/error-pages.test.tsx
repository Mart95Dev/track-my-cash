import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mocks next-intl/server (composant serveur not-found.tsx)
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => {
    const map: Record<string, string> = {
      title: "Page introuvable",
      description: "Cette page n'existe pas ou a été déplacée.",
      backHome: "Retour à l'accueil",
      dashboard: "Tableau de bord",
    };
    return map[key] ?? key;
  }),
}));

// Mocks next-intl (composant client error.tsx)
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      title: "Une erreur est survenue",
      description: "Quelque chose s'est mal passé. Veuillez réessayer.",
      retry: "Réessayer",
    };
    return map[key] ?? key;
  },
}));

// Mocks navigation et composants UI
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    asChild,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    variant?: string;
  }) => {
    if (asChild) return <>{children}</>;
    return (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    );
  },
}));

vi.mock("lucide-react", () => ({
  FileQuestion: () => <svg data-testid="icon-file-question" />,
  AlertTriangle: () => <svg data-testid="icon-alert-triangle" />,
}));

import NotFound from "@/app/[locale]/not-found";
import ErrorPage from "@/app/[locale]/error";

describe("Pages d'erreur — rendu et comportement", () => {
  it("TU-57-1 : <NotFoundPage /> rend sans erreur", async () => {
    const element = await NotFound();
    expect(() => render(element)).not.toThrow();
  });

  it("TU-57-2 : <NotFoundPage /> contient un lien vers l'accueil (/)", async () => {
    const element = await NotFound();
    render(element);
    const link = screen.getByRole("link", { name: /accueil/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/");
  });

  it("TU-57-3 : <ErrorPage error reset /> rend sans erreur", () => {
    const mockReset = vi.fn();
    expect(() =>
      render(<ErrorPage error={new Error("test")} reset={mockReset} />)
    ).not.toThrow();
  });

  it("TU-57-4 : clic sur 'Réessayer' appelle reset()", () => {
    const mockReset = vi.fn();
    render(<ErrorPage error={new Error("oops")} reset={mockReset} />);
    const btn = screen.getByRole("button", { name: /réessayer/i });
    fireEvent.click(btn);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
