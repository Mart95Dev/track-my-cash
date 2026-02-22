import { describe, it, expect } from "vitest";
import { caisseEpargneParser } from "@/lib/parsers/caisse-epargne";

const CE_FIXTURE = `Numéro;Date opération;Libellé;Débit;Crédit
1234;15/01/2026;Virement salaire janvier;;2500,00
5678;18/01/2026;Achat Monoprix;67,50;
9012;22/01/2026;Abonnement Free;29,99;`;

describe("caisseEpargneParser — STORY-039", () => {
  it("TU-3-1 : canHandle avec header CE → true", () => {
    expect(caisseEpargneParser.canHandle("CE.csv", CE_FIXTURE)).toBe(true);
  });

  it("TU-3-2 : canHandle sans header 'Numéro' → false", () => {
    const autreContent = `Date;Libellé;Montant\n15/01/2026;Test;100`;
    expect(caisseEpargneParser.canHandle("autre.csv", autreContent)).toBe(false);
  });

  it("TU-3-3 : parse → 3 transactions avec date, description, montant corrects", () => {
    const result = caisseEpargneParser.parse(CE_FIXTURE, null);
    expect(result.transactions).toHaveLength(3);
    expect(result.transactions[0]).toMatchObject({
      date: "2026-01-15",
      description: "Virement salaire janvier",
      amount: 2500,
      type: "income",
    });
  });

  it("TU-3-4 : colonne Débit → expense, colonne Crédit → income", () => {
    const result = caisseEpargneParser.parse(CE_FIXTURE, null);
    expect(result.transactions[1]).toMatchObject({
      description: "Achat Monoprix",
      amount: 67.5,
      type: "expense",
    });
    expect(result.transactions[0]).toMatchObject({
      type: "income",
    });
  });

  it("TU-3-5 : bankName = \"Caisse d'Épargne\"", () => {
    const result = caisseEpargneParser.parse(CE_FIXTURE, null);
    expect(result.bankName).toBe("Caisse d'Épargne");
    expect(result.currency).toBe("EUR");
  });

  it("TU-3-6 : parse avec contenu null → tableau vide", () => {
    const result = caisseEpargneParser.parse(null, null);
    expect(result.transactions).toHaveLength(0);
  });
});
