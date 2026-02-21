import type { BankParser, ParseResult } from "./types";
import { parseDateFR, parseAmount } from "./utils";

export const creditAgricoleParser: BankParser = {
  name: "Crédit Agricole",

  canHandle(_filename, content) {
    if (!content) return false;
    // Détection stricte : uniquement les colonnes spécifiques CA
    return content.includes("Débit euros") || content.includes("Crédit euros");
  },

  parse(content): ParseResult {
    if (!content) throw new Error("Contenu requis pour le parser Crédit Agricole");

    const lines = content.split(/\r?\n/).filter((l) => l.trim());

    // Trouver l'index du header
    const headerIdx = lines.findIndex(
      (l) => (l.includes("Débit euros") || l.includes("Crédit euros")) && l.includes("Libellé")
    );

    if (headerIdx === -1) {
      return {
        transactions: [],
        detectedBalance: null,
        detectedBalanceDate: null,
        bankName: "Crédit Agricole",
        currency: "EUR",
      };
    }

    const transactions = [];

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const parts = lines[i].split(";");
      if (parts.length < 5) continue;

      const date = parseDateFR(parts[0].trim());
      const description = parts[2].replace(/^"|"$/g, "").trim();
      const debit = parts[3].trim();
      const credit = parts[4].trim();

      if (!description) continue;

      if (debit && debit !== "0" && debit !== "") {
        const amount = parseAmount(debit);
        if (!isNaN(amount) && amount !== 0) {
          transactions.push({
            date,
            description,
            amount: Math.abs(amount),
            type: "expense" as const,
          });
        }
      } else if (credit && credit !== "0" && credit !== "") {
        const amount = parseAmount(credit);
        if (!isNaN(amount) && amount !== 0) {
          transactions.push({
            date,
            description,
            amount: Math.abs(amount),
            type: "income" as const,
          });
        }
      }
      // Si les deux sont vides → ignorer
    }

    return {
      transactions,
      detectedBalance: null,
      detectedBalanceDate: null,
      bankName: "Crédit Agricole",
      currency: "EUR",
    };
  },
};
