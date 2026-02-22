import { describe, it, expect } from "vitest";
import { monzoParser } from "@/lib/parsers/monzo";

const MONZO_CSV = `Transaction ID,Date,Time,Type,Name,Emoji,Category,Amount,Currency
tx_1,2026-01-15,10:30:00,Debit,Sainsbury's,🛒,Groceries,-45.23,GBP
tx_2,2026-01-20,09:00:00,Credit,Employer,,Income,2500.00,GBP`;

const HSBC_CSV = `Date,Description,Amount
15/01/2026,SAINSBURYS SUPERMARKET,-45.23`;

describe("monzoParser — STORY-058", () => {
  it("TU-58-6 : canHandle sur CSV Monzo valide → true", () => {
    expect(monzoParser.canHandle("monzo-export.csv", MONZO_CSV)).toBe(true);
  });

  it("TU-58-7 : canHandle sur CSV HSBC → false", () => {
    expect(monzoParser.canHandle("hsbc.csv", HSBC_CSV)).toBe(false);
  });

  it("TU-58-8 : date déjà YYYY-MM-DD conservée telle quelle", () => {
    const result = monzoParser.parse(MONZO_CSV, null);
    expect(result.transactions[0]?.date).toBe("2026-01-15");
  });

  it("TU-58-9 : montant -45.23 → expense, amount 45.23", () => {
    const result = monzoParser.parse(MONZO_CSV, null);
    expect(result.transactions[0]).toMatchObject({
      description: "Sainsbury's",
      amount: 45.23,
      type: "expense",
    });
  });

  it("TU-58-10 : montant 2500.00 → income", () => {
    const result = monzoParser.parse(MONZO_CSV, null);
    expect(result.transactions[1]).toMatchObject({
      description: "Employer",
      amount: 2500,
      type: "income",
    });
  });

  it("TU-58-10b : bankName = 'Monzo', currency détectée = 'GBP'", () => {
    const result = monzoParser.parse(MONZO_CSV, null);
    expect(result.bankName).toBe("Monzo");
    expect(result.currency).toBe("GBP");
  });

  it("TU-58-10c : content null → 0 transactions", () => {
    const result = monzoParser.parse(null, null);
    expect(result.transactions).toHaveLength(0);
  });
});
