import { describe, it, expect } from "vitest";
import { bnpParser } from "@/lib/parsers/bnp-paribas";

const BNP_FIXTURE = `Date;Libellé simplifié;Référence;Montant en euros;Devise
15/01/2026;VIR SALAIRE;12345;2500.00;EUR
18/01/2026;CARREFOUR MARKET;67890;-85,30;EUR
22/01/2026;NETFLIX;11111;-15,99;EUR`;

describe("bnpParser — STORY-039", () => {
  it("TU-1-1 : canHandle avec header BNP → true", () => {
    expect(bnpParser.canHandle("export.csv", BNP_FIXTURE)).toBe(true);
  });

  it("TU-1-2 : canHandle avec extension .xlsx → false", () => {
    expect(bnpParser.canHandle("export.xlsx", BNP_FIXTURE)).toBe(false);
  });

  it("TU-1-3 : parse → 3 transactions avec date, description et montant corrects", () => {
    const result = bnpParser.parse(BNP_FIXTURE, null);
    expect(result.transactions).toHaveLength(3);
    expect(result.transactions[0]).toMatchObject({
      date: "2026-01-15",
      description: "VIR SALAIRE",
      amount: 2500,
      type: "income",
    });
    expect(result.bankName).toBe("BNP Paribas");
    expect(result.currency).toBe("EUR");
  });

  it("TU-1-4 : montant négatif → type expense", () => {
    const result = bnpParser.parse(BNP_FIXTURE, null);
    expect(result.transactions[1]).toMatchObject({
      description: "CARREFOUR MARKET",
      amount: 85.3,
      type: "expense",
    });
    expect(result.transactions[2]).toMatchObject({
      description: "NETFLIX",
      amount: 15.99,
      type: "expense",
    });
  });

  it("TU-1-5 : parse avec contenu null → tableau vide", () => {
    const result = bnpParser.parse(null, null);
    expect(result.transactions).toHaveLength(0);
  });
});
