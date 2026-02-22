import type { BankParser, ParseResult } from "./types";
import { parseAmount, parseCSVLine } from "./utils";

export const monzoParser = {
  name: "Monzo",

  canHandle(filename: string, content?: string): boolean {
    if (!filename.toLowerCase().endsWith(".csv")) return false;
    if (!content) return false;
    const header = content.split("\n")[0] ?? "";
    return header.includes("Transaction ID") && header.includes("Amount") && header.includes("Currency");
  },

  parse(content: string | null, _buffer: Buffer | null): ParseResult {
    const empty: ParseResult = {
      transactions: [],
      detectedBalance: null,
      detectedBalanceDate: null,
      bankName: "Monzo",
      currency: "GBP",
    };

    if (!content) return empty;

    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    const headerIdx = lines.findIndex(
      (l) => l.includes("Transaction ID") && l.includes("Amount")
    );
    if (headerIdx === -1) return empty;

    const headers = parseCSVLine(lines[headerIdx]!);
    const dateIdx = headers.findIndex((h) => h.trim() === "Date");
    const nameIdx = headers.findIndex((h) => h.trim() === "Name");
    const amountIdx = headers.findIndex((h) => h.trim() === "Amount");
    const currencyIdx = headers.findIndex((h) => h.trim() === "Currency");

    if (dateIdx === -1 || amountIdx === -1) return empty;

    const transactions = [];
    let detectedCurrency = "GBP";

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const parts = parseCSVLine(lines[i]!);
      if (parts.length <= amountIdx) continue;

      const date = (parts[dateIdx] ?? "").trim();
      const description = (parts[nameIdx] ?? "").trim();
      const rawAmount = (parts[amountIdx] ?? "").trim();
      const currency = currencyIdx !== -1 ? (parts[currencyIdx] ?? "").trim() : "GBP";

      if (!date || !rawAmount) continue;

      const amount = parseAmount(rawAmount);
      if (isNaN(amount) || amount === 0) continue;

      if (currency) detectedCurrency = currency;

      transactions.push({
        date,
        description,
        amount: Math.abs(amount),
        type: amount < 0 ? ("expense" as const) : ("income" as const),
      });
    }

    return { ...empty, transactions, currency: detectedCurrency };
  },
} satisfies BankParser;
