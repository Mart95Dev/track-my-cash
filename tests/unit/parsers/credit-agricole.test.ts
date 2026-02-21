import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import type { ParseResult } from "@/lib/parsers/types";
import { creditAgricoleParser } from "@/lib/parsers/credit-agricole";

const fixture = readFileSync(join(__dirname, "../../fixtures/credit-agricole.csv"), "utf-8");

describe("creditAgricoleParser", () => {
  describe("canHandle", () => {
    it("TU-1-1 : accepte un CSV contenant 'Débit euros'", () => {
      expect(creditAgricoleParser.canHandle("releve.csv", "Date;Libellé;Débit euros;Crédit euros")).toBe(true);
    });

    it("TU-1-2 : accepte un CSV contenant 'Crédit euros'", () => {
      expect(creditAgricoleParser.canHandle("releve.csv", "Crédit euros")).toBe(true);
    });

    it("TU-1-3 : refuse un CSV sans ces colonnes", () => {
      expect(creditAgricoleParser.canHandle("releve.csv", "Date;Libellé;Montant(EUROS)")).toBe(false);
    });

    it("TU-1-4 : refuse si content est undefined", () => {
      expect(creditAgricoleParser.canHandle("releve.csv", undefined)).toBe(false);
    });
  });

  describe("parse", () => {
    it("TU-1-5 : retourne 5 transactions depuis le fixture", () => {
      const result = creditAgricoleParser.parse(fixture, null) as ParseResult;
      expect(result.transactions).toHaveLength(5);
    });

    it("TU-1-6 : les débits sont des dépenses (expense)", () => {
      const result = creditAgricoleParser.parse(fixture, null) as ParseResult;
      const expenses = result.transactions.filter((t) => t.type === "expense");
      expect(expenses).toHaveLength(3);
      expect(expenses[0].amount).toBeCloseTo(87.5);
    });

    it("TU-1-7 : les crédits sont des revenus (income)", () => {
      const result = creditAgricoleParser.parse(fixture, null) as ParseResult;
      const incomes = result.transactions.filter((t) => t.type === "income");
      expect(incomes).toHaveLength(2);
      expect(incomes[0].amount).toBeCloseTo(2500);
    });

    it("TU-1-8 : bankName = 'Crédit Agricole', currency = 'EUR'", () => {
      const result = creditAgricoleParser.parse(fixture, null) as ParseResult;
      expect(result.bankName).toBe("Crédit Agricole");
      expect(result.currency).toBe("EUR");
    });
  });
});
