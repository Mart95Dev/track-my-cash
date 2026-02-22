import type { BankParser, ParseResult } from "./types";

function parseWiseDate(str: string): string {
  // Convertit "DD-MM-YYYY" en "YYYY-MM-DD"
  const parts = str.split("-");
  if (parts.length === 3 && parts[2]!.length === 4) {
    return `${parts[2]}-${parts[1]!.padStart(2, "0")}-${parts[0]!.padStart(2, "0")}`;
  }
  // Déjà en ISO YYYY-MM-DD
  return str;
}

export const wiseParser = {
  name: "Wise",

  canHandle(filename: string, content?: string): boolean {
    if (!filename.toLowerCase().endsWith(".csv")) return false;
    if (!content) return false;
    const header = content.split("\n")[0] ?? "";
    return (
      header.toLowerCase().includes("transferwise") ||
      header.includes("TransferWise ID")
    );
  },

  parse(content: string | null, _buffer: Buffer | null): ParseResult {
    if (!content) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Wise", currency: "EUR" };
    }

    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    const headerIdx = lines.findIndex((l) => l.toLowerCase().includes("transferwise"));
    if (headerIdx === -1) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Wise", currency: "EUR" };
    }

    const headers = lines[headerIdx]!.split(",").map((h) => h.trim());
    const dateIdx = headers.indexOf("Date");
    const amountIdx = headers.indexOf("Amount");
    const currencyIdx = headers.indexOf("Currency");
    const descIdx = headers.indexOf("Description");

    if (amountIdx === -1) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Wise", currency: "EUR" };
    }

    const transactions = [];
    const currencyCounts = new Map<string, number>();

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const parts = lines[i]!.split(",");
      if (parts.length < 3) continue;

      const rawDate = dateIdx >= 0 ? (parts[dateIdx] ?? "").replace(/^"|"$/g, "").trim() : "";
      const rawAmount = (parts[amountIdx] ?? "").replace(/^"|"$/g, "").trim();
      const currency = currencyIdx >= 0 ? (parts[currencyIdx] ?? "EUR").replace(/^"|"$/g, "").trim() : "EUR";
      const description = descIdx >= 0 ? (parts[descIdx] ?? "").replace(/^"|"$/g, "").trim() : "";

      if (!rawDate || !rawAmount) continue;

      const date = parseWiseDate(rawDate);
      const amount = parseFloat(rawAmount);
      if (isNaN(amount) || amount === 0) continue;

      currencyCounts.set(currency, (currencyCounts.get(currency) ?? 0) + 1);

      transactions.push({
        date,
        description,
        amount: Math.abs(amount),
        type: amount < 0 ? ("expense" as const) : ("income" as const),
      });
    }

    // Devise majoritaire
    const mainCurrency = [...currencyCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "EUR";

    return {
      transactions,
      detectedBalance: null,
      detectedBalanceDate: null,
      bankName: "Wise",
      currency: mainCurrency,
    };
  },
} satisfies BankParser;
