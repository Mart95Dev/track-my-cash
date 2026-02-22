import { describe, it, expect } from "vitest";
import { n26Parser } from "@/lib/parsers/n26";

const N26_FIXTURE = `Date,Payee,Account number,Transaction type,Payment reference,Category,Amount (EUR),Amount (Foreign Currency),Type Foreign Currency,Exchange Rate
2026-01-15,Employer GmbH,,Incoming Transfer,Salary,,2500.00,,,
2026-01-18,REWE Berlin,,MasterCard,,,- 85.30,,,
2026-01-22,Netflix,,Direct Debit,,,- 15.99,,,`;

describe("n26Parser — STORY-043", () => {
  it("TU-1-1 : canHandle avec header N26 → true", () => {
    expect(n26Parser.canHandle("n26-export.csv", N26_FIXTURE)).toBe(true);
  });

  it("TU-1-2 : canHandle avec header SG → false", () => {
    const sgHeader = "Date;Libellé;Référence;Débit euros;Crédit euros\n";
    expect(n26Parser.canHandle("releve.csv", sgHeader)).toBe(false);
  });

  it("TU-1-3 : parse → 3 transactions avec income/expense corrects", () => {
    const result = n26Parser.parse(N26_FIXTURE, null);
    expect(result.transactions).toHaveLength(3);
    expect(result.transactions[0]).toMatchObject({
      date: "2026-01-15",
      description: "Employer GmbH",
      amount: 2500,
      type: "income",
    });
    expect(result.bankName).toBe("N26");
    expect(result.currency).toBe("EUR");
  });

  it("TU-1-4 : montant '- 85.30' avec espace → expense de 85.30", () => {
    const result = n26Parser.parse(N26_FIXTURE, null);
    expect(result.transactions[1]).toMatchObject({
      description: "REWE Berlin",
      amount: 85.3,
      type: "expense",
    });
    expect(result.transactions[2]).toMatchObject({
      amount: 15.99,
      type: "expense",
    });
  });
});
