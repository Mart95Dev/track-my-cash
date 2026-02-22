import type { BankParser, ParseResult } from "./types";
import { parseDateFR, parseFRAmount } from "./utils";

export const bnpParser = {
  name: "BNP Paribas",

  canHandle(filename: string, content?: string): boolean {
    if (!filename.toLowerCase().endsWith(".csv")) return false;
    if (!content) return false;
    const header = content.split("\n")[0] ?? "";
    return (
      header.includes("Libellé simplifié") ||
      header.includes("Montant en euros")
    );
  },

  parse(content: string | null, _buffer: Buffer | null): ParseResult {
    if (!content) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "BNP Paribas", currency: "EUR" };
    }

    const lines = content.split(/\r?\n/).filter((l) => l.trim());

    // Trouver le header
    const headerIdx = lines.findIndex(
      (l) => l.includes("Libellé simplifié") || l.includes("Montant en euros")
    );
    if (headerIdx === -1) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "BNP Paribas", currency: "EUR" };
    }

    const transactions = [];

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const parts = lines[i].split(";");
      if (parts.length < 4) continue;

      const rawDate = parts[0].replace(/^"|"$/g, "").trim();
      const description = parts[1].replace(/^"|"$/g, "").trim();
      const rawAmount = parts[3].replace(/^"|"$/g, "").trim();

      if (!rawDate || !description || !rawAmount) continue;

      const date = parseDateFR(rawDate);
      const amount = parseFRAmount(rawAmount);
      if (isNaN(amount) || amount === 0) continue;

      transactions.push({
        date,
        description,
        amount: Math.abs(amount),
        type: amount < 0 ? ("expense" as const) : ("income" as const),
      });
    }

    return {
      transactions,
      detectedBalance: null,
      detectedBalanceDate: null,
      bankName: "BNP Paribas",
      currency: "EUR",
    };
  },
} satisfies BankParser;
