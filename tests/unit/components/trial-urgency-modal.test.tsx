import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

import { TrialUrgencyModal } from "@/components/trial-urgency-modal";

const TODAY = new Date().toISOString().slice(0, 10);

// happy-dom expose localStorage sans .clear() — on fournit un mock complet
const makeLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

describe("TrialUrgencyModal (STORY-081)", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", makeLocalStorageMock());
  });

  it("TU-81-1 : daysRemaining=3, status='trialing' → modale visible (AC-1)", () => {
    render(<TrialUrgencyModal daysRemaining={3} status="trialing" />);
    expect(screen.getByText(/votre essai expire bientôt/i)).toBeDefined();
  });

  it("TU-81-2 : daysRemaining=1 → affiche 'Dernier jour' (AC-1)", () => {
    render(<TrialUrgencyModal daysRemaining={1} status="trialing" />);
    expect(screen.getByText(/Dernier jour/)).toBeDefined();
  });

  it("TU-81-3 : daysRemaining=4 → ne rend rien (AC-5)", () => {
    const { container } = render(
      <TrialUrgencyModal daysRemaining={4} status="trialing" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("TU-81-4 : status='active' → ne rend rien (AC-6)", () => {
    const { container } = render(
      <TrialUrgencyModal daysRemaining={1} status="active" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("TU-81-5 : clic 'Plus tard' → localStorage contient la date du jour (AC-4)", () => {
    render(<TrialUrgencyModal daysRemaining={2} status="trialing" />);
    fireEvent.click(screen.getByText("Plus tard"));
    expect(localStorage.getItem("trial_modal_shown_date")).toBe(TODAY);
  });

  it("TU-81-6 : localStorage déjà = today → modale non visible (AC-2)", () => {
    localStorage.setItem("trial_modal_shown_date", TODAY);
    const { container } = render(
      <TrialUrgencyModal daysRemaining={2} status="trialing" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("TU-81-7 : modale affiche ≥ 3 features (AC-7)", () => {
    render(<TrialUrgencyModal daysRemaining={3} status="trialing" />);
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it("TU-81-8 : lien CTA pointe vers /tarifs (AC-3)", () => {
    render(<TrialUrgencyModal daysRemaining={3} status="trialing" />);
    const links = screen.getAllByRole("link");
    const tarifsLink = links.find((l) => l.getAttribute("href") === "/tarifs");
    expect(tarifsLink).toBeDefined();
  });
});
