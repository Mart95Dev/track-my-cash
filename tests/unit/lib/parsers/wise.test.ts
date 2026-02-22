import { describe, it, expect } from "vitest";
import { wiseParser } from "@/lib/parsers/wise";

const WISE_FIXTURE = `TransferWise ID,Date,Amount,Currency,Description,Payment Reference,Running Balance
12345,15-01-2026,2500.00,EUR,Salary transfer,,3200.00
67890,18-01-2026,-85.30,EUR,Amazon purchase,,3114.70
11111,22-01-2026,-15.99,USD,Netflix subscription,,3098.71`;

describe("wiseParser — STORY-043", () => {
  it("TU-2-1 : canHandle avec header Wise → true", () => {
    expect(wiseParser.canHandle("wise-statement.csv", WISE_FIXTURE)).toBe(true);
  });

  it("TU-2-2 : parse → date '15-01-2026' convertie en '2026-01-15'", () => {
    const result = wiseParser.parse(WISE_FIXTURE, null);
    expect(result.transactions).toHaveLength(3);
    expect(result.transactions[0]!.date).toBe("2026-01-15");
    expect(result.transactions[0]!.type).toBe("income");
    expect(result.transactions[0]!.amount).toBe(2500);
  });

  it("TU-2-3 : colonne Currency 'USD' → devise retournée correctement", () => {
    const wiseFx = `TransferWise ID,Date,Amount,Currency,Description
12345,15-01-2026,-100.00,USD,Test
67890,18-01-2026,-50.00,USD,Test2
11111,22-01-2026,-30.00,USD,Test3`;
    const result = wiseParser.parse(wiseFx, null);
    expect(result.currency).toBe("USD");
  });

  it("TU-2-4 : bankName = 'Wise'", () => {
    const result = wiseParser.parse(WISE_FIXTURE, null);
    expect(result.bankName).toBe("Wise");
  });
});
