import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { banquePopulaireParser } from "@/lib/parsers/banque-populaire";

const FIXTURE_PATH = resolve(__dirname, "../../fixtures/banque-populaire.csv");
const FIXTURE_CONTENT = readFileSync(FIXTURE_PATH, "utf-8");

describe("Banque Populaire parser — canHandle", () => {
  it("TU-1-1 : canHandle retourne true pour un CSV avec 'Montant(EUROS)'", () => {
    expect(banquePopulaireParser.canHandle("releve.csv", "Date;Libellé;Montant(EUROS)")).toBe(true);
  });

  it("TU-1-2 : canHandle retourne false si content est null (ex: XLSX)", () => {
    expect(banquePopulaireParser.canHandle("releve.xlsx", null)).toBe(false);
  });
});

describe("Banque Populaire parser — parse", () => {
  it("TU-1-3 : parse détecte le solde initial (1500.25) depuis 'Solde'", () => {
    const result = banquePopulaireParser.parse(FIXTURE_CONTENT);
    expect(result.detectedBalance).toBe(1500.25);
  });

  it("TU-1-4 : parse détecte la date du solde (2026-02-15)", () => {
    const result = banquePopulaireParser.parse(FIXTURE_CONTENT);
    expect(result.detectedBalanceDate).toBe("2026-02-15");
  });

  it("TU-1-5 : parse retourne 3 transactions depuis la fixture", () => {
    const result = banquePopulaireParser.parse(FIXTURE_CONTENT);
    expect(result.transactions).toHaveLength(3);
  });

  it("TU-1-6 : VIREMENT SALAIRE est de type 'income'", () => {
    const result = banquePopulaireParser.parse(FIXTURE_CONTENT);
    const salaire = result.transactions.find((t) => t.description.includes("SALAIRE"));
    expect(salaire?.type).toBe("income");
    expect(salaire?.amount).toBe(2000);
  });

  it("TU-1-7 : PRELEVEMENT EDF est de type 'expense' avec amount 120.50", () => {
    const result = banquePopulaireParser.parse(FIXTURE_CONTENT);
    const edf = result.transactions.find((t) => t.description.includes("EDF"));
    expect(edf?.type).toBe("expense");
    expect(edf?.amount).toBe(120.5);
  });

  it("TU-1-8 : bankName = 'Banque Populaire' et currency = 'EUR'", () => {
    const result = banquePopulaireParser.parse(FIXTURE_CONTENT);
    expect(result.bankName).toBe("Banque Populaire");
    expect(result.currency).toBe("EUR");
  });

  it("TU-1-9 : parse retourne [] si le CSV ne contient pas 'Date;Libellé'", () => {
    const result = banquePopulaireParser.parse("Solde;500,00\nDate;01/01/2026\n");
    expect(result.transactions).toHaveLength(0);
  });
});
