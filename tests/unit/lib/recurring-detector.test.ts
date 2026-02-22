import { describe, it, expect } from "vitest";
import { detectRecurringPatterns, normalizeDescription } from "@/lib/recurring-detector";

const orange = (id: number, date: string) => ({
  id,
  description: "ORANGE SA FRANCE",
  amount: 29.99,
  type: "expense" as const,
  date,
  category: "Abonnements",
});

describe("recurring-detector — STORY-042", () => {
  it("TU-1-1 : 3 transactions mensuelle régulières → 1 suggestion fréquence 'monthly'", () => {
    const result = detectRecurringPatterns({
      transactions: [
        orange(1, "2025-11-05"),
        orange(2, "2025-12-05"),
        orange(3, "2026-01-06"),
      ],
      existingRecurrings: [],
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.frequency).toBe("monthly");
    expect(result[0]!.avgAmount).toBeCloseTo(29.99, 2);
    expect(result[0]!.occurrences).toBe(3);
  });

  it("TU-1-2 : seulement 2 occurrences → 0 suggestions (seuil minimum 3)", () => {
    const result = detectRecurringPatterns({
      transactions: [
        orange(1, "2025-11-05"),
        orange(2, "2025-12-05"),
      ],
      existingRecurrings: [],
    });
    expect(result).toHaveLength(0);
  });

  it("TU-1-3 : montants qui varient de plus de 10% → suggestion non retournée", () => {
    const result = detectRecurringPatterns({
      transactions: [
        { id: 1, description: "ELECTRICITE EDF", amount: 80, type: "expense", date: "2025-11-01", category: "Logement" },
        { id: 2, description: "ELECTRICITE EDF", amount: 150, type: "expense", date: "2025-12-01", category: "Logement" },
        { id: 3, description: "ELECTRICITE EDF", amount: 200, type: "expense", date: "2026-01-01", category: "Logement" },
      ],
      existingRecurrings: [],
    });
    expect(result).toHaveLength(0);
  });

  it("TU-1-4 : description déjà couverte par récurrent existant → exclue", () => {
    const result = detectRecurringPatterns({
      transactions: [
        orange(1, "2025-11-05"),
        orange(2, "2025-12-05"),
        orange(3, "2026-01-06"),
      ],
      existingRecurrings: [{ name: "ORANGE SA FRANCE", amount: 29.99, frequency: "monthly" }],
    });
    expect(result).toHaveLength(0);
  });

  it("TU-1-5 : normalizeDescription supprime les séquences de 4+ chiffres (références)", () => {
    // "2026" (4 chiffres) est supprimé, "01" (2 chiffres) reste
    expect(normalizeDescription("VIR LOYER 01/2026 DUPONT")).toBe("vir loyer 01/ dupont");
    // "20260115" (8 chiffres) est supprimé entièrement
    expect(normalizeDescription("VIR LOYER 20260115 DUPONT")).toBe("vir loyer dupont");
    // Espaces multiples normalisés
    expect(normalizeDescription("NETFLIX  ABONNEMENT")).toBe("netflix abonnement");
  });

  it("TU-1-6 : transactions hebdomadaires régulières → fréquence 'weekly'", () => {
    const result = detectRecurringPatterns({
      transactions: [
        { id: 1, description: "SPORT CLUB", amount: 15, type: "expense", date: "2026-01-05", category: "Loisirs" },
        { id: 2, description: "SPORT CLUB", amount: 15, type: "expense", date: "2026-01-12", category: "Loisirs" },
        { id: 3, description: "SPORT CLUB", amount: 15, type: "expense", date: "2026-01-19", category: "Loisirs" },
      ],
      existingRecurrings: [],
    });
    expect(result).toHaveLength(1);
    expect(result[0]!.frequency).toBe("weekly");
  });
});
