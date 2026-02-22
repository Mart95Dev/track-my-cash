import { describe, it, expect } from "vitest";
import { ingParser } from "@/lib/parsers/ing";

// Format ING Direct : CSV tabulé, colonnes Date\tLibellé\tMontant\tSolde
const ING_CSV = `Date\tLibellé\tMontant\tSolde
15/01/2026\tAUCHAN MONTROUGE\t-45,30\t1254,70
20/01/2026\tSALAIRE JANVIER\t+2500,00\t3754,70
22/01/2026\tNETFLIX\t-13,99\t3740,71`;

const ING_CSV_WITH_BALANCE = `Date\tLibellé\tMontant\tSolde
15/01/2026\tAUCHAN\t-45,30\t1254,70`;

const OTHER_CSV = `Date,Description,Amount
15/01/2026,TESCO,-45.23`;

describe("ingParser — STORY-067", () => {
  it("TU-67-1 : canHandle sur CSV ING tabulé → true", () => {
    expect(ingParser.canHandle("releve-ing.csv", ING_CSV)).toBe(true);
  });

  it("TU-67-2 : canHandle sur CSV non-ING → false", () => {
    expect(ingParser.canHandle("export.csv", OTHER_CSV)).toBe(false);
  });

  it("TU-67-3 : parse retourne 3 transactions", () => {
    const result = ingParser.parse(ING_CSV, null);
    expect(result.transactions).toHaveLength(3);
  });

  it("TU-67-4 : montant négatif → expense, date DD/MM/YYYY convertie en YYYY-MM-DD", () => {
    const result = ingParser.parse(ING_CSV, null);
    expect(result.transactions[0]).toMatchObject({
      date: "2026-01-15",
      description: "AUCHAN MONTROUGE",
      amount: 45.30,
      type: "expense",
    });
  });

  it("TU-67-5 : montant positif → income", () => {
    const result = ingParser.parse(ING_CSV, null);
    expect(result.transactions[1]).toMatchObject({
      description: "SALAIRE JANVIER",
      amount: 2500,
      type: "income",
    });
  });

  it("TU-67-6 : bankName = 'ING Direct', currency = 'EUR'", () => {
    const result = ingParser.parse(ING_CSV, null);
    expect(result.bankName).toBe("ING Direct");
    expect(result.currency).toBe("EUR");
  });

  it("TU-67-7 : solde détecté depuis colonne Solde", () => {
    const result = ingParser.parse(ING_CSV_WITH_BALANCE, null);
    expect(result.detectedBalance).toBeCloseTo(1254.70);
  });

  it("TU-67-8 : content null → 0 transactions", () => {
    const result = ingParser.parse(null, null);
    expect(result.transactions).toHaveLength(0);
  });
});
