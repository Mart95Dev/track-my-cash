import type { BankParser, ParseResult } from "./types";
import { parseDateFR, parseFRAmount, fixMojibake } from "./utils";

export const caisseEpargneParser = {
  name: "Caisse d'Épargne",

  canHandle(filename: string, content?: string): boolean {
    if (!filename.toLowerCase().endsWith(".csv")) return false;
    if (!content) return false;
    // Vérifier sur le contenu brut (UTF-8) et sur la version démoijibakée (ISO-8859-1 mal lu)
    const header = (content.split("\n")[0] ?? "").trim();
    const fixedHeader = (fixMojibake(content).split("\n")[0] ?? "").trim();
    const check = (h: string) =>
      (h.includes("Numéro") || h.startsWith("Num")) &&
      (h.includes("Date op") || h.includes("Date opération")) &&
      (h.includes("Débit") || h.includes("Crédit") || h.includes("bit"));
    return check(header) || check(fixedHeader);
  },

  parse(content: string | null, _buffer: Buffer | null): ParseResult {
    if (!content) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Caisse d'Épargne", currency: "EUR" };
    }

    // Essayer d'abord le contenu brut, puis la version démoijibakée
    const rawHeader = (content.split("\n")[0] ?? "").trim();
    const needsFix = !rawHeader.includes("Date op");
    const fixed = needsFix ? fixMojibake(content) : content;
    const lines = fixed.split(/\r?\n/).filter((l) => l.trim());

    // Trouver le header
    const headerIdx = lines.findIndex(
      (l) => l.includes("Date opération") && (l.includes("Débit") || l.includes("Crédit"))
    );
    if (headerIdx === -1) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Caisse d'Épargne", currency: "EUR" };
    }

    const transactions = [];

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const parts = lines[i].split(";");
      if (parts.length < 4) continue;

      // Colonnes : Numéro(0) | Date opération(1) | Libellé(2) | Débit(3) | Crédit(4)
      const rawDate = parts[1].replace(/^"|"$/g, "").trim();
      const description = parts[2].replace(/^"|"$/g, "").trim();
      const rawDebit = (parts[3] ?? "").replace(/^"|"$/g, "").trim();
      const rawCredit = (parts[4] ?? "").replace(/^"|"$/g, "").trim();

      if (!rawDate || !description) continue;

      const date = parseDateFR(rawDate);

      if (rawDebit && rawDebit !== "") {
        const amount = parseFRAmount(rawDebit);
        if (!isNaN(amount) && amount !== 0) {
          transactions.push({ date, description, amount: Math.abs(amount), type: "expense" as const });
        }
      } else if (rawCredit && rawCredit !== "") {
        const amount = parseFRAmount(rawCredit);
        if (!isNaN(amount) && amount !== 0) {
          transactions.push({ date, description, amount: Math.abs(amount), type: "income" as const });
        }
      }
    }

    return {
      transactions,
      detectedBalance: null,
      detectedBalanceDate: null,
      bankName: "Caisse d'Épargne",
      currency: "EUR",
    };
  },
} satisfies BankParser;
