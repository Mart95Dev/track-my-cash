import { describe, it, expect } from "vitest";
import { detectAnomalies } from "@/lib/anomaly-detector";

const expenseTx = (id: number, amount: number, category: string, description = "Test") => ({
  id,
  description,
  amount,
  category,
  type: "expense" as const,
});

const incomeTx = (id: number, amount: number, category: string) => ({
  id,
  description: "Virement",
  amount,
  category,
  type: "income" as const,
});

describe("detectAnomalies — STORY-045", () => {
  it("TU-1-1 : dépense 3.1× la moyenne → 1 anomalie avec ratio 3.1", () => {
    const result = detectAnomalies(
      [expenseTx(1, 250, "Loisirs")],
      { Loisirs: 80 }
    );
    expect(result).toHaveLength(1);
    expect(result[0].ratio).toBe(3.1);
    expect(result[0].transactionId).toBe(1);
    expect(result[0].category).toBe("Loisirs");
  });

  it("TU-1-2 : dépense inférieure au seuil (threshold 2.0) → 0 anomalie", () => {
    // 100 < 80 × 2.0 = 160
    const result = detectAnomalies(
      [expenseTx(1, 100, "Loisirs")],
      { Loisirs: 80 }
    );
    expect(result).toHaveLength(0);
  });

  it("TU-1-3 : transaction de type income → ignorée même si montant élevé", () => {
    const result = detectAnomalies(
      [incomeTx(1, 300, "Abonnements")],
      { Abonnements: 50 }
    );
    expect(result).toHaveLength(0);
  });

  it("TU-1-4 : montant < minAmount (50€) → ignoré même si ratio élevé", () => {
    // 30 > 10 × 2 = 20, mais montant < 50€
    const result = detectAnomalies(
      [expenseTx(1, 30, "Loisirs")],
      { Loisirs: 10 }
    );
    expect(result).toHaveLength(0);
  });

  it("TU-1-5 : catégorie sans historique → aucune anomalie", () => {
    const result = detectAnomalies(
      [expenseTx(1, 250, "Nouvelle")],
      {}
    );
    expect(result).toHaveLength(0);
  });

  it("TU-1-6 : threshold custom 1.5 → anomalie détectée avec seuil plus bas", () => {
    // 130 > 80 × 1.5 = 120 → anomalie
    const result = detectAnomalies(
      [expenseTx(1, 130, "Loisirs")],
      { Loisirs: 80 },
      { threshold: 1.5 }
    );
    expect(result).toHaveLength(1);
    expect(result[0].historicalAvg).toBe(80);
  });
});
