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

const GENERIC_CSV_DATE_FR = `Date;Libellé;Montant
15/01/2026;Virement salaire;2500.00
18/01/2026;Carrefour;-85.30`;

const GENERIC_CSV_DATE_DASH = `Date;Libellé;Montant
15-01-2026;Virement salaire;2500.00
18-01-2026;Carrefour;-85.30`;

const GENERIC_CSV_DATE_MMM = `Date;Libellé;Montant
15-Jan-2026;Virement salaire;2500.00
18-Mar-2026;Carrefour;-85.30`;

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

    it("QA-1 : insensible à la casse du nom de fichier (.CSV majuscules)", () => {
      expect(genericCsvParser.canHandle("RELEVE.CSV")).toBe(true);
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

    it("QA-2 : contenu vide → headers=[], preview=[], fingerprint='empty'", () => {
      const result = genericCsvParser.detectHeaders("");
      expect(result.headers).toHaveLength(0);
      expect(result.preview).toHaveLength(0);
      expect(result.fingerprint).toBe("empty");
    });

    it("QA-3 : le même format de headers produit toujours le même fingerprint", () => {
      const r1 = genericCsvParser.detectHeaders(GENERIC_CSV_SEMICOLON);
      const r2 = genericCsvParser.detectHeaders(`Date;Libellé;Montant;Solde\n2026-02-01;Test;100;500`);
      expect(r1.fingerprint).toBe(r2.fingerprint);
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

    it("QA-4 : format date DD/MM/YYYY converti correctement en YYYY-MM-DD", () => {
      const mapping: ColumnMapping = { ...MAPPING_SIMPLE, dateColumn: "Date", dateFormat: "DD/MM/YYYY" };
      const result = genericCsvParser.parseWithMapping(GENERIC_CSV_DATE_FR, mapping);
      expect(result.transactions).toHaveLength(2);
      expect(result.transactions[0]?.date).toBe("2026-01-15");
      expect(result.transactions[1]?.date).toBe("2026-01-18");
    });

    it("QA-5 : format date DD-MM-YYYY converti correctement en YYYY-MM-DD", () => {
      const mapping: ColumnMapping = { ...MAPPING_SIMPLE, dateColumn: "Date", dateFormat: "DD-MM-YYYY" };
      const result = genericCsvParser.parseWithMapping(GENERIC_CSV_DATE_DASH, mapping);
      expect(result.transactions).toHaveLength(2);
      expect(result.transactions[0]?.date).toBe("2026-01-15");
    });

    it("QA-6 : format date DD-MMM-YYYY (15-Jan-2026) converti correctement", () => {
      const mapping: ColumnMapping = { ...MAPPING_SIMPLE, dateColumn: "Date", dateFormat: "DD-MMM-YYYY" };
      const result = genericCsvParser.parseWithMapping(GENERIC_CSV_DATE_MMM, mapping);
      expect(result.transactions).toHaveLength(2);
      expect(result.transactions[0]?.date).toBe("2026-01-15");
      expect(result.transactions[1]?.date).toBe("2026-03-18");
    });

    it("QA-7 : contenu vide → 0 transactions", () => {
      const result = genericCsvParser.parseWithMapping("", MAPPING_SIMPLE);
      expect(result.transactions).toHaveLength(0);
    });

    it("QA-8 : header seul sans données → 0 transactions", () => {
      const result = genericCsvParser.parseWithMapping("Date;Libellé;Montant", MAPPING_SIMPLE);
      expect(result.transactions).toHaveLength(0);
    });

    it("QA-9 : montant avec virgule décimale (format européen) parsé correctement", () => {
      const csv = `Date;Libellé;Montant\n2026-01-15;Loyer;-850,00\n2026-01-20;Salaire;2 500,00`;
      const result = genericCsvParser.parseWithMapping(csv, MAPPING_SIMPLE);
      expect(result.transactions).toHaveLength(2);
      expect(result.transactions[0]?.amount).toBeCloseTo(850);
      expect(result.transactions[0]?.type).toBe("expense");
      expect(result.transactions[1]?.amount).toBeCloseTo(2500);
    });
  });
});
