import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  CheckCircle: () => <span data-testid="check-icon" />,
  RefreshCw: () => <span data-testid="refresh-icon" />,
}));

import { ToolResultCard } from "@/components/tool-result-card";

describe("ToolResultCard — variant recurring (STORY-062, AC-4)", () => {
  const recurringResult = {
    success: true,
    type: "recurring" as const,
    name: "Netflix",
    amount: 17.99,
    frequency: "monthly",
    message: 'Récurrent "Netflix" créé : 17.99€/mois',
  };

  it("TU-62-7 : rendu recurring → affiche le nom (AC-4)", () => {
    render(<ToolResultCard result={recurringResult} />);
    expect(screen.getByText(/Netflix/)).toBeDefined();
  });

  it("TU-62-8 : rendu recurring → affiche le montant (AC-4)", () => {
    render(<ToolResultCard result={recurringResult} />);
    expect(screen.getByText(/17/)).toBeDefined();
  });

  it("TU-62-9 : rendu recurring → affiche la fréquence (AC-4)", () => {
    render(<ToolResultCard result={recurringResult} />);
    const text = document.body.textContent ?? "";
    expect(text.toLowerCase()).toContain("mois");
  });

  it("TU-62-10 : rendu recurring → contient 'Récurrent créé' (AC-4)", () => {
    render(<ToolResultCard result={recurringResult} />);
    expect(screen.getByText(/Récurrent créé/i)).toBeDefined();
  });
});

describe("ToolResultCard — non-régression budget & goal", () => {
  it("TU-62-11 : type budget → affiche 'Budget créé'", () => {
    render(
      <ToolResultCard
        result={{
          success: true,
          type: "budget",
          category: "Restaurants",
          amount_limit: 300,
          message: "Budget Restaurants créé",
        }}
      />
    );
    expect(screen.getByText(/Budget créé/i)).toBeDefined();
  });

  it("TU-62-12 : type goal → affiche 'Objectif créé'", () => {
    render(
      <ToolResultCard
        result={{
          success: true,
          type: "goal",
          name: "Vacances",
          target_amount: 2000,
          message: "Objectif Vacances créé",
        }}
      />
    );
    expect(screen.getByText(/Objectif créé/i)).toBeDefined();
  });
});
