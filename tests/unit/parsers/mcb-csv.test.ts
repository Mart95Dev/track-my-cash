import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import type { ParseResult } from "@/lib/parsers/types";
import { mcbCsvParser } from "@/lib/parsers/mcb-csv";

const FIXTURE_PATH = resolve(__dirname, "../../fixtures/mcb.csv");
const FIXTURE_CONTENT = readFileSync(FIXTURE_PATH, "utf-8");

describe("MCB CSV parser — canHandle", () => {
  it("TU-3-1 : canHandle détecte 'Date de la transaction' dans le contenu", () => {
    expect(mcbCsvParser.canHandle("releve.csv", "Date de la transaction,Ref,Date")).toBe(true);
  });

  it("TU-3-1b : canHandle détecte 'Devise du compte MGA' dans le contenu", () => {
    expect(mcbCsvParser.canHandle("releve.csv", "Devise du compte MGA")).toBe(true);
  });
});

describe("MCB CSV parser — parse", () => {
  it("TU-3-2 : parse retourne currency = 'MGA'", () => {
    const result = mcbCsvParser.parse(FIXTURE_CONTENT, null) as ParseResult;
    expect(result.currency).toBe("MGA");
  });

  it("TU-3-3 : parse traite les montants sans espaces milliers", () => {
    const result = mcbCsvParser.parse(FIXTURE_CONTENT, null) as ParseResult;
    // Salary = 150000 MGA
    const salary = result.transactions.find((t) => t.description === "Salary");
    expect(salary?.amount).toBe(150000);
  });

  it("TU-3-4 : parse retourne des transactions avec type income/expense correct", () => {
    const result = mcbCsvParser.parse(FIXTURE_CONTENT, null) as ParseResult;
    const salary = result.transactions.find((t) => t.description === "Salary");
    const electricity = result.transactions.find((t) => t.description === "Electricity");
    expect(salary?.type).toBe("income");
    expect(electricity?.type).toBe("expense");
  });
});
