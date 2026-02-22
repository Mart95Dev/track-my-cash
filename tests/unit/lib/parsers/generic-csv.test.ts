import { describe, it, expect } from "vitest";
import { genericCsvParser } from "@/lib/parsers/generic-csv";
import type { ColumnMapping } from "@/lib/parsers/generic-csv";

const GENERIC_CSV_SEMICOLON = `Date;Libellé;Montant;Solde
2026-01-15;Virement salaire;2500.00;3200.00
2026-01-18;Carrefour;-85.30;3114.70
2026-01-22;Abonnement Netflix;-15.99;3098.71`;

const GENERIC_CSV_COMMA = `Date,Label,Amount,Balance
2026-01-15,Salary,2500.00,3200.00
2026-01-18,Supermarket,-85.30,3114.70`;

const GENERIC_CSV_DEBIT_CREDIT = `Date;Libellé;Débit;Crédit
2026-01-18;Carrefour;85.30;
2026-01-15;Virement salaire;;2500.00`;

const MAPPING_SIMPLE: ColumnMapping = {
  dateColumn: "Date",
  amountColumn: "Montant",
  descriptionColumn: "Libellé",
  separator: ";",
  dateFormat: "YYYY-MM-DD",
};

const MAPPING_DEBIT_CREDIT: ColumnMapping = {
  dateColumn: "Date",
  debitColumn: "Débit",
  creditColumn: "Crédit",
  descriptionColumn: "Libellé",
  separator: ";",
  dateFormat: "YYYY-MM-DD",
};

describe("genericCsvParser", () => {
  describe("canHandle", () => {
    it("TU-1-1 : retourne true pour .csv", () => {
      expect(genericCsvParser.canHandle("releve.csv")).toBe(true);
    });

    it("TU-1-2 : retourne false pour .xlsx", () => {
      expect(genericCsvParser.canHandle("releve.xlsx")).toBe(false);
    });
  });

  describe("detectHeaders", () => {
    it("TU-1-3 : détecte les headers et retourne jusqu'à 5 lignes de preview", () => {
      const { headers, preview, fingerprint } = genericCsvParser.detectHeaders(GENERIC_CSV_SEMICOLON);
      expect(headers).toEqual(["Date", "Libellé", "Montant", "Solde"]);
      expect(preview.length).toBeLessThanOrEqual(5);
      expect(preview.length).toBeGreaterThan(0);
      expect(preview[0]).toContain("2026-01-15");
      expect(fingerprint).toBeTruthy();
    });

    it("TU-1-6 : détecte automatiquement le séparateur ; vs ,", () => {
      const resultSemicolon = genericCsvParser.detectHeaders(GENERIC_CSV_SEMICOLON);
      const resultComma = genericCsvParser.detectHeaders(GENERIC_CSV_COMMA);
      expect(resultSemicolon.headers).toHaveLength(4);
      expect(resultComma.headers).toHaveLength(4);
      // Fingerprints différents car headers différents
      expect(resultSemicolon.fingerprint).not.toBe(resultComma.fingerprint);
    });
  });

  describe("parseWithMapping", () => {
    it("TU-1-4 : parse 3 transactions avec mapping simple (séparateur ;)", () => {
      const result = genericCsvParser.parseWithMapping(GENERIC_CSV_SEMICOLON, MAPPING_SIMPLE);
      expect(result.transactions).toHaveLength(3);
      expect(result.transactions[0]).toMatchObject({
        date: "2026-01-15",
        description: "Virement salaire",
        amount: 2500,
        type: "income",
      });
      expect(result.transactions[1]).toMatchObject({
        date: "2026-01-18",
        description: "Carrefour",
        amount: 85.3,
        type: "expense",
      });
      expect(result.bankName).toBe("CSV générique");
    });

    it("TU-1-5 : colonnes Débit/Crédit séparées → type expense/income correct", () => {
      const result = genericCsvParser.parseWithMapping(GENERIC_CSV_DEBIT_CREDIT, MAPPING_DEBIT_CREDIT);
      expect(result.transactions).toHaveLength(2);
      const expense = result.transactions.find((t) => t.type === "expense");
      const income = result.transactions.find((t) => t.type === "income");
      expect(expense?.amount).toBeCloseTo(85.3);
      expect(income?.amount).toBeCloseTo(2500);
    });
  });
});
