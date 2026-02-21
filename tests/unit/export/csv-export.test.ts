import { describe, it, expect } from "vitest";
import { generateTransactionsCsv, type TransactionCsvRow } from "@/lib/csv-export";

function makeRow(overrides: Partial<TransactionCsvRow> = {}): TransactionCsvRow {
  return {
    date: "2026-01-15",
    description: "Supermarché",
    category: "Alimentation",
    subcategory: "courses",
    type: "expense",
    amount: 42.5,
    currency: "EUR",
    account_name: "Compte principal",
    ...overrides,
  };
}

describe("generateTransactionsCsv", () => {
  it("TU-1-1 : tableau vide → contient uniquement les headers CSV", () => {
    const csv = generateTransactionsCsv([]);
    expect(csv).toContain("Date");
    expect(csv).toContain("Description");
    expect(csv).toContain("Catégorie");
    expect(csv).toContain("Sous-catégorie");
    expect(csv).toContain("Type");
    expect(csv).toContain("Montant");
    expect(csv).toContain("Devise");
    expect(csv).toContain("Compte");
  });

  it("TU-1-2 : une transaction → une ligne avec les 8 champs dans l'ordre", () => {
    const csv = generateTransactionsCsv([makeRow()]);
    const lines = csv.split("\n");
    // ligne 0 = BOM + headers, ligne 1 = donnée
    expect(lines).toHaveLength(2);
    const dataLine = lines[1];
    expect(dataLine).toContain("2026-01-15");
    expect(dataLine).toContain("Supermarché");
    expect(dataLine).toContain("Alimentation");
    expect(dataLine).toContain("courses");
    expect(dataLine).toContain("Dépense");
    expect(dataLine).toContain("42.50");
    expect(dataLine).toContain("EUR");
    expect(dataLine).toContain("Compte principal");
  });

  it("TU-1-3 : BOM UTF-8 \\uFEFF présent au début du fichier", () => {
    const csv = generateTransactionsCsv([]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("TU-1-4 : champ avec virgule → entouré de guillemets doubles", () => {
    const csv = generateTransactionsCsv([makeRow({ description: "Leclerc, Drive" })]);
    expect(csv).toContain('"Leclerc, Drive"');
  });

  it("TU-1-5 : champ avec guillemet → guillemet doublé (RFC 4180)", () => {
    const csv = generateTransactionsCsv([makeRow({ description: 'Café "Le Central"' })]);
    expect(csv).toContain('"Café ""Le Central"""');
  });
});
