import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CoupleBalanceCard } from "@/components/couple-balance-card";

describe("CoupleBalanceCard — balance couple (STORY-087)", () => {
  it("TU-87-3 : diff=40 → 'Partenaire vous doit' affiché", () => {
    render(
      <CoupleBalanceCard
        user1Paid={100}
        user2Paid={60}
        partnerName="Marie"
        diff={40}
        locale="fr"
      />
    );

    expect(screen.getByText(/Partenaire vous doit/i)).toBeDefined();
  });

  it("TU-87-4 : diff=-40 → 'Vous devez' affiché", () => {
    render(
      <CoupleBalanceCard
        user1Paid={60}
        user2Paid={100}
        partnerName="Marie"
        diff={-40}
        locale="fr"
      />
    );

    expect(screen.getByText(/Vous devez/i)).toBeDefined();
  });

  it("TU-87-3b : affiche le titre 'Balance couple'", () => {
    render(
      <CoupleBalanceCard
        user1Paid={50}
        user2Paid={50}
        partnerName="Marie"
        diff={0}
        locale="fr"
      />
    );

    expect(screen.getByText(/Balance couple/i)).toBeDefined();
  });

  it("TU-87-4b : diff=0 → 'Vous êtes à égalité' affiché", () => {
    render(
      <CoupleBalanceCard
        user1Paid={50}
        user2Paid={50}
        partnerName="Marie"
        diff={0}
        locale="fr"
      />
    );

    expect(screen.getByText(/égalité/i)).toBeDefined();
  });
});
