import { describe, it, expect } from "vitest";
import { hsbcParser } from "@/lib/parsers/hsbc";

const HSBC_CSV = `Date,Description,Amount
15/01/2026,SAINSBURYS SUPERMARKET,-45.23
20/01/2026,SALARY PAYMENT,2500.00
22/01/2026,AMAZON.CO.UK,-23.99`;

const BANQUE_POP_CSV = `Date;Libellé;Débit;Crédit
15/01/2026;CARTE AUCHAN;-32,50;
20/01/2026;VIREMENT SALAIRE;;2500,00`;

describe("hsbcParser — STORY-058", () => {
  it("TU-58-1 : canHandle sur CSV HSBC valide → true", () => {
    expect(hsbcParser.canHandle("hsbc-export.csv", HSBC_CSV)).toBe(true);
  });

  it("TU-58-2 : canHandle sur CSV Banque Populaire → false", () => {
    expect(hsbcParser.canHandle("releve.csv", BANQUE_POP_CSV)).toBe(false);
  });

  it("TU-58-3 : parse retourne 3 transactions", () => {
    const result = hsbcParser.parse(HSBC_CSV, null);
    expect(result.transactions).toHaveLength(3);
  });

  it("TU-58-4 : ligne dépense 45.23 → expense + date 2026-01-15", () => {
    const result = hsbcParser.parse(HSBC_CSV, null);
    expect(result.transactions[0]).toMatchObject({
      date: "2026-01-15",
      description: "SAINSBURYS SUPERMARKET",
      amount: 45.23,
      type: "expense",
    });
  });

  it("TU-58-5 : SALARY PAYMENT 2500.00 → income", () => {
    const result = hsbcParser.parse(HSBC_CSV, null);
    expect(result.transactions[1]).toMatchObject({
      description: "SALARY PAYMENT",
      amount: 2500,
      type: "income",
    });
  });

  it("TU-58-5b : bankName = 'HSBC UK', currency = 'GBP'", () => {
    const result = hsbcParser.parse(HSBC_CSV, null);
    expect(result.bankName).toBe("HSBC UK");
    expect(result.currency).toBe("GBP");
  });

  it("TU-58-5c : content null → 0 transactions", () => {
    const result = hsbcParser.parse(null, null);
    expect(result.transactions).toHaveLength(0);
  });
});
