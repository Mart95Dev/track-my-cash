import type { BankParser, ParseResult } from "./types";

function parseN26Amount(str: string): number {
  // Gère "2500.00", "- 85.30" (espace après le signe)
  return parseFloat(str.replace(/\s/g, ""));
}

export const n26Parser = {
  name: "N26",

  canHandle(filename: string, content?: string): boolean {
    if (!filename.toLowerCase().endsWith(".csv")) return false;
    if (!content) return false;
    const header = content.split("\n")[0] ?? "";
    return (
      header.includes("Payee") &&
      header.includes("Transaction type") &&
      header.includes("Amount")
    );
  },

  parse(content: string | null, _buffer: Buffer | null): ParseResult {
    if (!content) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "N26", currency: "EUR" };
    }

    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    const headerIdx = lines.findIndex(
      (l) => l.includes("Payee") && l.includes("Transaction type")
    );
    if (headerIdx === -1) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "N26", currency: "EUR" };
    }

    // Trouver l'index de la colonne Amount (chercher "Amount (EUR)" ou "Amount")
    const headers = lines[headerIdx]!.split(",");
    const amountIdx = headers.findIndex((h) => h.trim().startsWith("Amount"));
    const payeeIdx = headers.findIndex((h) => h.trim() === "Payee");
    const dateIdx = 0; // Date est toujours la première colonne

    const transactions = [];

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const parts = lines[i]!.split(",");
      if (parts.length < 3) continue;

      const rawDate = (parts[dateIdx] ?? "").trim();
      const description = (parts[payeeIdx] ?? "").replace(/^"|"$/g, "").trim();
      const rawAmount = (parts[amountIdx] ?? "").replace(/^"|"$/g, "").trim();

      if (!rawDate || !description || !rawAmount) continue;

      // Date déjà en ISO YYYY-MM-DD
      const date = rawDate;
      const amount = parseN26Amount(rawAmount);
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
      bankName: "N26",
      currency: "EUR",
    };
  },
} satisfies BankParser;
