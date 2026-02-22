import type { BankParser, ParseResult } from "./types";
import { parseFRAmount } from "./utils";

function parseSGDate(str: string): string {
  // Gère YYYY-MM-DD (ISO) et DD/MM/YYYY (FR)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str.trim())) return str.trim();
  const parts = str.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return str.trim();
}

export const societeGeneraleParser = {
  name: "Société Générale",

  canHandle(filename: string, content?: string): boolean {
    if (!filename.toLowerCase().endsWith(".csv")) return false;
    if (!content) return false;
    const header = content.split("\n")[0] ?? "";
    // SG : présence de "Référence" ET ("Débit euros" ou "Crédit euros")
    return (
      header.includes("Référence") &&
      (header.includes("Débit euros") || header.includes("Crédit euros"))
    );
  },

  parse(content: string | null, _buffer: Buffer | null): ParseResult {
    if (!content) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Société Générale", currency: "EUR" };
    }

    const lines = content.split(/\r?\n/).filter((l) => l.trim());

    const headerIdx = lines.findIndex(
      (l) => l.includes("Référence") && (l.includes("Débit euros") || l.includes("Crédit euros"))
    );
    if (headerIdx === -1) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Société Générale", currency: "EUR" };
    }

    const transactions = [];

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const parts = lines[i].split(";");
      if (parts.length < 4) continue;

      // Colonnes : Date(0) | Libellé(1) | Référence(2) | Débit euros(3) | Crédit euros(4)
      const rawDate = parts[0].replace(/^"|"$/g, "").trim();
      const description = parts[1].replace(/^"|"$/g, "").trim();
      const rawDebit = (parts[3] ?? "").replace(/^"|"$/g, "").trim();
      const rawCredit = (parts[4] ?? "").replace(/^"|"$/g, "").trim();

      if (!rawDate || !description) continue;

      const date = parseSGDate(rawDate);

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
      bankName: "Société Générale",
      currency: "EUR",
    };
  },
} satisfies BankParser;
