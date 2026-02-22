import { describe, it, expect } from "vitest";
import { computeMoMVariation, computeYoYComparison } from "@/lib/mom-calculator";

describe("computeMoMVariation — STORY-041", () => {
  it("TU-1-1 : dépenses en hausse 20% → direction 'up', percentChange 20", () => {
    const result = computeMoMVariation(1200, 1000);
    expect(result.percentChange).toBeCloseTo(20, 1);
    expect(result.direction).toBe("up");
    expect(result.current).toBe(1200);
    expect(result.previous).toBe(1000);
  });

  it("TU-1-2 : dépenses en baisse 20% → direction 'down', percentChange -20", () => {
    const result = computeMoMVariation(800, 1000);
    expect(result.percentChange).toBeCloseTo(-20, 1);
    expect(result.direction).toBe("down");
  });

  it("TU-1-3 : variation < 0.5% → direction 'stable'", () => {
    const result = computeMoMVariation(1003, 1000);
    expect(result.direction).toBe("stable");
    expect(result.percentChange).not.toBeNull();
  });

  it("TU-1-4 : mois précédent null → percentChange null, direction 'no_previous'", () => {
    const result = computeMoMVariation(500, null);
    expect(result.percentChange).toBeNull();
    expect(result.direction).toBe("no_previous");
  });

  it("TU-1-5 : mois précédent à 0 → division par zéro évitée, direction 'no_previous'", () => {
    const result = computeMoMVariation(500, 0);
    expect(result.percentChange).toBeNull();
    expect(result.direction).toBe("no_previous");
  });
});

// === STORY-064 — computeYoYComparison ===

describe("computeYoYComparison (STORY-064, AC-3)", () => {
  const CURRENT = [
    { category: "Alimentation", total: 600 },
    { category: "Transport", total: 200 },
    { category: "Loisirs", total: 100 },
  ];
  const PREVIOUS = [
    { category: "Alimentation", total: 500 },
    { category: "Transport", total: 250 },
    { category: "Loisirs", total: 102 },
  ];

  it("TU-64-1 : catégorie en hausse >10% → trend 'up'", () => {
    const result = computeYoYComparison(CURRENT, PREVIOUS);
    const alim = result.find((r) => r.category === "Alimentation")!;
    expect(alim.trend).toBe("up");
    expect(alim.deltaPercent).toBeCloseTo(20, 1);
    expect(alim.currentAmount).toBe(600);
    expect(alim.previousAmount).toBe(500);
    expect(alim.delta).toBe(100);
  });

  it("TU-64-2 : catégorie en baisse >10% → trend 'down'", () => {
    const result = computeYoYComparison(CURRENT, PREVIOUS);
    const transport = result.find((r) => r.category === "Transport")!;
    expect(transport.trend).toBe("down");
    expect(transport.deltaPercent).toBeCloseTo(-20, 1);
  });

  it("TU-64-3 : variation ≤ 10% → trend 'stable'", () => {
    const result = computeYoYComparison(CURRENT, PREVIOUS);
    const loisirs = result.find((r) => r.category === "Loisirs")!;
    expect(loisirs.trend).toBe("stable");
  });

  it("TU-64-4 : catégorie absente en N-1 → previousAmount=0, trend='up'", () => {
    const current = [{ category: "Santé", total: 150 }];
    const previous: { category: string; total: number }[] = [];
    const result = computeYoYComparison(current, previous);
    expect(result).toHaveLength(1);
    expect(result[0].previousAmount).toBe(0);
    expect(result[0].trend).toBe("up");
    expect(result[0].deltaPercent).toBe(100);
  });

  it("TU-64-5 : liste courante vide → retourne []", () => {
    const result = computeYoYComparison([], PREVIOUS);
    expect(result).toHaveLength(0);
  });

  it("TU-64-6 : catégorie présente en N-1 seulement → absente du résultat", () => {
    const current = [{ category: "Alimentation", total: 400 }];
    const previous = [
      { category: "Alimentation", total: 500 },
      { category: "Santé", total: 200 }, // N-1 only
    ];
    const result = computeYoYComparison(current, previous);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("Alimentation");
  });
});
