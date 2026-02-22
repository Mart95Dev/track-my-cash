import type { BankParser, ParseResult } from "./types";
import { parseDateFR, parseAmount } from "./utils";

export const hsbcParser = {
  name: "HSBC UK",

  canHandle(filename: string, content?: string): boolean {
    if (!filename.toLowerCase().endsWith(".csv")) return false;
    if (!content) return false;
    const header = content.split("\n")[0] ?? "";
    return header.trim() === "Date,Description,Amount";
  },

  parse(content: string | null, _buffer: Buffer | null): ParseResult {
    const empty: ParseResult = {
      transactions: [],
      detectedBalance: null,
      detectedBalanceDate: null,
      bankName: "HSBC UK",
      currency: "GBP",
    };

    if (!content) return empty;

    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    const headerIdx = lines.findIndex((l) => l.trim() === "Date,Description,Amount");
    if (headerIdx === -1) return empty;

    const transactions = [];

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const parts = lines[i]!.split(",");
      if (parts.length < 3) continue;

      const rawDate = (parts[0] ?? "").trim();
      const description = (parts[1] ?? "").trim();
      const rawAmount = (parts[2] ?? "").trim();

      if (!rawDate || !description || !rawAmount) continue;

      const date = parseDateFR(rawDate);
      const amount = parseAmount(rawAmount);
      if (isNaN(amount) || amount === 0) continue;

      transactions.push({
        date,
        description,
        amount: Math.abs(amount),
        type: amount < 0 ? ("expense" as const) : ("income" as const),
      });
    }

    return { ...empty, transactions };
  },
} satisfies BankParser;
