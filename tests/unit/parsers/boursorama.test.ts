import { describe, it, expect } from "vitest";
import { boursoramaParser } from "@/lib/parsers/boursorama";

// Format Boursorama : CSV séparateur ; colonnes dateOp;dateVal;label;category;amount
const BOURSORAMA_CSV = `dateOp;dateVal;label;category;amount
15/01/2026;17/01/2026;AUCHAN MONTROUGE;Alimentation;-45,30
20/01/2026;20/01/2026;VIR SALAIRE ENTREPRISE;Revenus;+2 500,00
22/01/2026;23/01/2026;NETFLIX;Abonnements;-13,99`;

const BOURSORAMA_CSV_QUOTES = `dateOp;dateVal;label;category;amount
15/01/2026;17/01/2026;"AMAZON PRIME";"Achats en ligne";"-23,50"`;

const OTHER_CSV = `Date,Description,Amount
15/01/2026,TESCO,-45.23`;

describe("boursoramaParser — STORY-067", () => {
  it("TU-67-9 : canHandle sur CSV Boursorama → true", () => {
    expect(boursoramaParser.canHandle("boursorama-export.csv", BOURSORAMA_CSV)).toBe(true);
  });

  it("TU-67-10 : canHandle sur CSV non-Boursorama → false", () => {
    expect(boursoramaParser.canHandle("export.csv", OTHER_CSV)).toBe(false);
  });

  it("TU-67-11 : parse retourne 3 transactions", () => {
    const result = boursoramaParser.parse(BOURSORAMA_CSV, null);
    expect(result.transactions).toHaveLength(3);
  });

  it("TU-67-12 : montant négatif avec virgule → expense + date convertie", () => {
    const result = boursoramaParser.parse(BOURSORAMA_CSV, null);
    expect(result.transactions[0]).toMatchObject({
      date: "2026-01-15",
      description: "AUCHAN MONTROUGE",
      amount: 45.30,
      type: "expense",
    });
  });

  it("TU-67-13 : montant positif avec espaces milliers → income", () => {
    const result = boursoramaParser.parse(BOURSORAMA_CSV, null);
    expect(result.transactions[1]).toMatchObject({
      description: "VIR SALAIRE ENTREPRISE",
      amount: 2500,
      type: "income",
    });
  });

  it("TU-67-14 : montants entre guillemets sont bien parsés", () => {
    const result = boursoramaParser.parse(BOURSORAMA_CSV_QUOTES, null);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toMatchObject({
      amount: 23.50,
      type: "expense",
    });
  });

  it("TU-67-15 : bankName = 'Boursorama', currency = 'EUR'", () => {
    const result = boursoramaParser.parse(BOURSORAMA_CSV, null);
    expect(result.bankName).toBe("Boursorama");
    expect(result.currency).toBe("EUR");
  });

  it("TU-67-16 : content null → 0 transactions", () => {
    const result = boursoramaParser.parse(null, null);
    expect(result.transactions).toHaveLength(0);
  });
});
