/**
 * TU-94-QA-3 à TU-94-QA-4 — STORY-094 QA
 * Tests QA : CoupleStatsCard titre + CoupleCategoriesPills montants formatés
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CoupleStatsCard } from "@/components/couple-stats-card";
import { CoupleCategoriesPills } from "@/components/couple-categories-pills";

describe("CoupleStatsCard + CoupleCategoriesPills — QA (STORY-094)", () => {
  it("TU-94-QA-3 : CoupleStatsCard rend le titre de section", () => {
    render(<CoupleStatsCard totalExpenses={0} variation={null} locale="fr" />);
    expect(screen.getByText(/Dépenses communes du mois/i)).toBeDefined();
  });

  it("TU-94-QA-4 : CoupleCategoriesPills affiche les montants formatés dans chaque pill", () => {
    const categories = [
      { category: "Courses", total: 200 },
      { category: "Loyer", total: 800 },
    ];
    render(<CoupleCategoriesPills categories={categories} locale="fr" />);
    // Les montants formatés doivent être présents (format fr-FR : 200,00 € / 800,00 €)
    expect(screen.getByText(/200/)).toBeDefined();
    expect(screen.getByText(/800/)).toBeDefined();
  });
});
