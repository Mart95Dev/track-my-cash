/**
 * TU-94-6 à TU-94-9 — STORY-094
 * Tests unitaires : CoupleStatsCard
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CoupleStatsCard } from "@/components/couple-stats-card";

describe("CoupleStatsCard — dépenses communes (STORY-094)", () => {
  it("TU-94-6 : rend le total formaté en euros", () => {
    render(<CoupleStatsCard totalExpenses={342} variation={null} locale="fr" />);
    expect(screen.getByText(/342/)).toBeDefined();
  });

  it("TU-94-7 : variation positive → classe text-success", () => {
    const { container } = render(
      <CoupleStatsCard totalExpenses={500} variation={12.5} locale="fr" />
    );
    const el = container.querySelector(".text-success");
    expect(el).not.toBeNull();
  });

  it("TU-94-8 : variation négative → classe text-danger", () => {
    const { container } = render(
      <CoupleStatsCard totalExpenses={400} variation={-8.3} locale="fr" />
    );
    const el = container.querySelector(".text-danger");
    expect(el).not.toBeNull();
  });

  it("TU-94-9 : variation null → aucun élément de variation", () => {
    const { container } = render(
      <CoupleStatsCard totalExpenses={300} variation={null} locale="fr" />
    );
    const el = container.querySelector(".text-success, .text-danger");
    expect(el).toBeNull();
  });
});
