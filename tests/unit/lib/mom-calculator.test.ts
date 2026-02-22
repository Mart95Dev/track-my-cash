import { describe, it, expect } from "vitest";
import { computeMoMVariation } from "@/lib/mom-calculator";

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
