import { describe, it, expect } from "vitest";
import {
  genericCsvParser,
  detectSeparatorExported,
  detectColumnsExported,
} from "@/lib/parsers/generic-csv";
import type { ParseResult } from "@/lib/parsers/types";

// ---------------------------------------------------------------------------
// TU-123-1 — Détection de séparateur
// ---------------------------------------------------------------------------
describe("TU-123-1 : Détection de séparateur automatique", () => {
  it("CSV avec virgule → séparateur détecté = ','", () => {
    const result = detectSeparatorExported("Date,Libellé,Montant");
    expect(result).toBe(",");
  });

  it("CSV avec point-virgule → séparateur détecté = ';'", () => {
    const result = detectSeparatorExported("Date;Libellé;Montant");
    expect(result).toBe(";");
  });

  it("CSV avec tabulation → séparateur détecté = '\\t'", () => {
    const result = detectSeparatorExported("Date\tLibellé\tMontant");
    expect(result).toBe("\t");
  });
});

// ---------------------------------------------------------------------------
// TU-123-2 — Scoring de colonnes par heuristic
// ---------------------------------------------------------------------------
describe("TU-123-2 : Scoring de colonnes par heuristic", () => {
  it("Headers ['Date', 'Libellé', 'Montant'] → confiance >= 70 et colonnes correctes", () => {
    const headers = ["Date", "Libellé", "Montant"];
    const firstRows = [
      ["15/01/2024", "Virement salaire", "2000.00"],
      ["20/01/2024", "EDF électricité", "-120.50"],
    ];
    const score = detectColumnsExported(headers, firstRows);
    expect(score.confidence).toBeGreaterThanOrEqual(70);
    expect(score.dateCol).toBe(0);
    expect(score.labelCol).toBe(1);
    expect(score.amountCol).toBe(2);
  });

  it("Headers anglais ['date', 'description', 'amount'] → confiance >= 70", () => {
    const headers = ["date", "description", "amount"];
    const firstRows = [
      ["2024-01-15", "Salary", "2000.00"],
    ];
    const score = detectColumnsExported(headers, firstRows);
    expect(score.confidence).toBeGreaterThanOrEqual(70);
    expect(score.dateCol).toBe(0);
    expect(score.labelCol).toBe(1);
    expect(score.amountCol).toBe(2);
  });

  it("Headers ['jour', 'opération', 'somme'] → confiance >= 70 (synonymes)", () => {
    const headers = ["jour", "opération", "somme"];
    const firstRows = [
      ["15/01/2024", "Loyer janvier", "800.00"],
    ];
    const score = detectColumnsExported(headers, firstRows);
    expect(score.confidence).toBeGreaterThanOrEqual(70);
  });

  it("Headers non reconnaissables ['col1', 'col2', 'col3'] → confiance < 70", () => {
    const headers = ["col1", "col2", "col3"];
    const firstRows = [
      ["données1", "données2", "données3"],
    ];
    const score = detectColumnsExported(headers, firstRows);
    expect(score.confidence).toBeLessThan(70);
  });
});

// ---------------------------------------------------------------------------
// TU-123-3 — Formats de date supportés (auto-détection)
// ---------------------------------------------------------------------------
describe("TU-123-3 : Formats de date supportés", () => {
  it("'15/01/2024' (DD/MM/YYYY) → '2024-01-15'", () => {
    const csv = "Date,Libellé,Montant\n15/01/2024,Virement,-100.00\n";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions[0]?.date).toBe("2024-01-15");
  });

  it("'2024-01-15' (YYYY-MM-DD) → '2024-01-15'", () => {
    const csv = "Date,Libellé,Montant\n2024-01-15,Virement,-100.00\n";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions[0]?.date).toBe("2024-01-15");
  });

  it("'15-01-2024' (DD-MM-YYYY) → '2024-01-15'", () => {
    const csv = "Date,Libellé,Montant\n15-01-2024,Virement,-100.00\n";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions[0]?.date).toBe("2024-01-15");
  });

  it("'15.01.2024' (DD.MM.YYYY) → '2024-01-15'", () => {
    const csv = "Date,Libellé,Montant\n15.01.2024,Virement,-100.00\n";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions[0]?.date).toBe("2024-01-15");
  });

  it("'15-Jan-2024' (DD-Mon-YYYY) → '2024-01-15'", () => {
    const csv = "Date,Libellé,Montant\n15-Jan-2024,Virement,-100.00\n";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions[0]?.date).toBe("2024-01-15");
  });
});

// ---------------------------------------------------------------------------
// TU-123-4 — Parse automatique si confidence >= 70%
// ---------------------------------------------------------------------------
describe("TU-123-4 : Parse automatique si confidence >= 70%", () => {
  it("CSV standard → transactions parsées correctement", () => {
    const csv = [
      "Date,Libellé,Montant",
      "15/01/2024,Virement salaire,2000.00",
      "20/01/2024,EDF électricité,-120.50",
      "25/01/2024,Courses supermarché,-85.30",
    ].join("\n");

    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions).toHaveLength(3);
    expect(result.transactions[0]?.date).toBe("2024-01-15");
    expect(result.transactions[0]?.description).toBe("Virement salaire");
    expect(result.transactions[0]?.amount).toBe(2000.00);
    expect(result.transactions[0]?.type).toBe("income");
    expect(result.transactions[1]?.amount).toBe(120.50);
    expect(result.transactions[1]?.type).toBe("expense");
  });

  it("CSV avec séparateur ';' → parsé automatiquement", () => {
    const csv = [
      "Date;Libellé;Montant",
      "15/01/2024;Loyer;-800.00",
      "20/01/2024;Salaire;2500.00",
    ].join("\n");

    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0]?.amount).toBe(800.00);
    expect(result.transactions[0]?.type).toBe("expense");
  });

  it("CSV avec tabulation → parsé automatiquement", () => {
    const csv = ["Date\tDescription\tAmount", "2024-01-15\tRent\t-800.00"].join("\n");
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]?.amount).toBe(800.00);
  });

  it("bankName = 'CSV auto-détecté' quand confidence >= 70, currency = 'EUR'", () => {
    const csv = "Date,Libellé,Montant\n15/01/2024,Test,-10.00\n";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.bankName).toBe("CSV auto-détecté");
    expect(result.currency).toBe("EUR");
  });
});

// ---------------------------------------------------------------------------
// TU-123-5 — suggestedMapping retourné si confidence < 70%
// ---------------------------------------------------------------------------
describe("TU-123-5 : suggestedMapping retourné si confidence < 70%", () => {
  it("CSV sans headers reconnaissables → suggestedMapping non-null", () => {
    const csv = [
      "col1,col2,col3",
      "données1,données2,données3",
      "donnees4,donnees5,donnees6",
    ].join("\n");

    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
    expect(result.suggestedMapping).not.toBeNull();
    expect(result.suggestedMapping).toBeDefined();
  });

  it("CSV vide → transactions vides et suggestedMapping null", () => {
    const result = genericCsvParser.parse("", null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
  });

  it("CSV avec seulement 1 ligne (pas de données) → transactions vides", () => {
    const csv = "Date,Libellé,Montant";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// TU-123-6 — Montants avec formats variés
// ---------------------------------------------------------------------------
describe("TU-123-6 : Montants avec formats variés", () => {
  it("'1 234,56' (FR avec espaces) → 1234.56", () => {
    const csv = "Date,Libellé,Montant\n15/01/2024,Test,\"1 234,56\"\n";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions[0]?.amount).toBeCloseTo(1234.56);
    expect(result.transactions[0]?.type).toBe("income");
  });

  it("'1,234.56' (EN avec séparateur milliers) → 1234.56", () => {
    const csv = "Date,Description,Amount\n2024-01-15,Test,1234.56\n";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions[0]?.amount).toBeCloseTo(1234.56);
  });

  it("'-50.00' (négatif standard) → amount=50, type=expense", () => {
    const csv = "Date,Libellé,Montant\n15/01/2024,Test,-50.00\n";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions[0]?.amount).toBe(50.00);
    expect(result.transactions[0]?.type).toBe("expense");
  });

  it("'(50.00)' (format comptable) → amount=50, type=expense", () => {
    const csv = "Date,Libellé,Montant\n15/01/2024,Test,\"(50.00)\"\n";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions[0]?.amount).toBe(50.00);
    expect(result.transactions[0]?.type).toBe("expense");
  });
});

// ---------------------------------------------------------------------------
// Rétrocompatibilité : parseWithMapping et detectHeaders toujours fonctionnels
// ---------------------------------------------------------------------------
describe("Rétrocompatibilité parseWithMapping", () => {
  it("parseWithMapping fonctionne toujours avec un mapping explicite", () => {
    const csv = "Date;Libellé;Montant\n15/01/2024;Test;-100.00\n";
    const result = genericCsvParser.parseWithMapping(csv, {
      dateColumn: "Date",
      amountColumn: "Montant",
      descriptionColumn: "Libellé",
      separator: ";",
      dateFormat: "DD/MM/YYYY",
    });
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]?.amount).toBe(100.00);
    expect(result.transactions[0]?.type).toBe("expense");
  });

  it("detectHeaders retourne les bons headers", () => {
    const csv = "Date;Libellé;Montant\n15/01/2024;Test;100\n";
    const { headers, preview, fingerprint } = genericCsvParser.detectHeaders(csv);
    expect(headers).toEqual(["Date", "Libellé", "Montant"]);
    expect(preview).toHaveLength(1);
    expect(typeof fingerprint).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// TU-123-AC-4 — Colonnes Débit/Crédit séparées auto-détectées
// ---------------------------------------------------------------------------
describe("TU-123-AC-4 : Colonnes Débit/Crédit séparées auto-détectées", () => {
  it("CSV avec colonnes 'Débit' et 'Crédit' séparées → auto-parsé si confidence >= 70", () => {
    const csv = "Date,Libellé,Débit,Crédit\n15/01/2024,LOYER,850.00,\n20/01/2024,SALAIRE,,2500.00\n";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0]?.amount).toBe(850.00);
    expect(result.transactions[0]?.type).toBe("expense");
    expect(result.transactions[1]?.amount).toBe(2500.00);
    expect(result.transactions[1]?.type).toBe("income");
  });

  it("CSV avec colonnes 'Debit' et 'Credit' (sans accents)", () => {
    const csv = "Date,Description,Debit,Credit\n2024-01-15,EDF,150.00,\n2024-01-20,VIREMENT,,1000.00\n";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0]?.amount).toBe(150.00);
    expect(result.transactions[0]?.type).toBe("expense");
    expect(result.transactions[1]?.amount).toBe(1000.00);
    expect(result.transactions[1]?.type).toBe("income");
  });

  it("CSV débit/crédit avec séparateur ';' → auto-parsé correctement", () => {
    const csv = [
      "Date;Description;Débit;Crédit",
      "15/01/2024;CARTE;50.00;",
      "02/01/2024;SALAIRE;;2500.00",
    ].join("\n");
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions).toHaveLength(2);
    const carte = result.transactions.find((t) => t.description === "CARTE");
    const salaire = result.transactions.find((t) => t.description === "SALAIRE");
    expect(carte?.amount).toBe(50.00);
    expect(carte?.type).toBe("expense");
    expect(salaire?.amount).toBe(2500.00);
    expect(salaire?.type).toBe("income");
  });

  it("detectColumnsExported : headers ['Date', 'Libellé', 'Débit', 'Crédit'] → debitCol et creditCol détectés", () => {
    const headers = ["Date", "Libellé", "Débit", "Crédit"];
    const firstRows = [
      ["15/01/2024", "CARTE", "50.00", ""],
      ["02/01/2024", "SALAIRE", "", "2500.00"],
    ];
    const score = detectColumnsExported(headers, firstRows);
    expect(score.confidence).toBeGreaterThanOrEqual(70);
    expect(score.debitCol).toBe(2);
    expect(score.creditCol).toBe(3);
    expect(score.amountCol).toBe(-1);
  });

  it("CSV débit/crédit avec keywords 'withdrawal'/'deposit' (anglais bancaire)", () => {
    const csv = "Date,Description,Withdrawal,Deposit\n2024-01-15,RENT,800.00,\n2024-01-20,SALARY,,3000.00\n";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0]?.amount).toBe(800.00);
    expect(result.transactions[0]?.type).toBe("expense");
    expect(result.transactions[1]?.amount).toBe(3000.00);
    expect(result.transactions[1]?.type).toBe("income");
  });

  it("bankName = 'CSV auto-détecté' pour format débit/crédit séparé", () => {
    const csv = "Date,Libellé,Débit,Crédit\n15/01/2024,LOYER,850.00,\n";
    const result = genericCsvParser.parse(csv, null) as ParseResult;
    expect(result.bankName).toBe("CSV auto-détecté");
    expect(result.currency).toBe("EUR");
  });
});
