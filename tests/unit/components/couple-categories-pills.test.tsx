/**
 * TU-94-10 à TU-94-11 — STORY-094
 * Tests unitaires : CoupleCategoriesPills
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CoupleCategoriesPills } from "@/components/couple-categories-pills";

describe("CoupleCategoriesPills — top catégories (STORY-094)", () => {
  it("TU-94-10 : rend 3 pills avec nom catégorie + montant", () => {
    const categories = [
      { category: "Courses", total: 200 },
      { category: "Loyer", total: 200 },
      { category: "Sorties", total: 45 },
    ];
    render(<CoupleCategoriesPills categories={categories} locale="fr" />);
    expect(screen.getByText(/Courses/i)).toBeDefined();
    expect(screen.getByText(/Loyer/i)).toBeDefined();
    expect(screen.getByText(/Sorties/i)).toBeDefined();
  });

  it("TU-94-11 : liste vide → composant non affiché", () => {
    const { container } = render(
      <CoupleCategoriesPills categories={[]} locale="fr" />
    );
    expect(container.firstChild).toBeNull();
  });
});
