import { describe, it, expect } from "vitest";
import { societeGeneraleParser } from "@/lib/parsers/societe-generale";

const SG_FIXTURE = `Date;Libellé;Référence;Débit euros;Crédit euros
2026-01-15;VIR SALAIRE;;;2 500,00
2026-01-18;FNAC PARIS;ABC123;42,90;
2026-01-22;ABONNEMENT SPOTIFY;XYZ;9,99;`;

describe("societeGeneraleParser — STORY-039", () => {
  it("TU-2-1 : canHandle avec header SG → true", () => {
    expect(societeGeneraleParser.canHandle("releve-sg.csv", SG_FIXTURE)).toBe(true);
  });

  it("TU-2-2 : canHandle sans extension csv → false", () => {
    expect(societeGeneraleParser.canHandle("releve-sg.txt", SG_FIXTURE)).toBe(false);
  });

  it("TU-2-3 : parse → colonne Débit → expense, colonne Crédit → income", () => {
    const result = societeGeneraleParser.parse(SG_FIXTURE, null);
    expect(result.transactions).toHaveLength(3);

    // VIR SALAIRE → Crédit → income
    expect(result.transactions[0]).toMatchObject({
      description: "VIR SALAIRE",
      amount: 2500,
      type: "income",
    });

    // FNAC → Débit → expense
    expect(result.transactions[1]).toMatchObject({
      description: "FNAC PARIS",
      amount: 42.9,
      type: "expense",
    });
  });

  it("TU-2-4 : parse → dates ISO YYYY-MM-DD conservées", () => {
    const result = societeGeneraleParser.parse(SG_FIXTURE, null);
    expect(result.transactions[0].date).toBe("2026-01-15");
  });

  it("TU-2-5 : bankName = 'Société Générale'", () => {
    const result = societeGeneraleParser.parse(SG_FIXTURE, null);
    expect(result.bankName).toBe("Société Générale");
    expect(result.currency).toBe("EUR");
  });
});
