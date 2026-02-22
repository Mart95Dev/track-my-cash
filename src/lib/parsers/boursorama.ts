import type { BankParser, ParseResult } from "./types";

function parseBoursoramaAmount(str: string): number {
  // Gère "+2 500,00", "-45,30", "-23,50", "2500,00" (avec espaces milliers)
  const cleaned = str
    .replace(/^"|"$/g, "")       // retirer guillemets
    .replace(/\s/g, "")          // espaces milliers
    .replace(",", ".")           // virgule décimale → point
    .replace(/^\+/, "");         // signe + optionnel
  return parseFloat(cleaned);
}

function parseDDMMYYYY(str: string): string {
  const parts = str.split("/");
  if (parts.length === 3 && parts[2]!.length === 4) {
    return `${parts[2]}-${parts[1]!.padStart(2, "0")}-${parts[0]!.padStart(2, "0")}`;
  }
  return str;
}

export const boursoramaParser = {
  name: "Boursorama",

  canHandle(filename: string, content?: string): boolean {
    if (!filename.toLowerCase().endsWith(".csv")) return false;
    if (!content) return false;
    const header = content.split("\n")[0] ?? "";
    return header.includes("dateOp") && header.includes("dateVal") && header.includes("label");
  },

  parse(content: string | null, _buffer: Buffer | null): ParseResult {
    if (!content) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Boursorama", currency: "EUR" };
    }

    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    const headerIdx = lines.findIndex((l) => l.includes("dateOp") && l.includes("label"));
    if (headerIdx === -1) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Boursorama", currency: "EUR" };
    }

    const headers = lines[headerIdx]!.split(";").map((h) => h.trim().replace(/^"|"$/g, ""));
    const dateOpIdx = headers.findIndex((h) => h === "dateOp");
    const labelIdx = headers.findIndex((h) => h === "label");
    const amountIdx = headers.findIndex((h) => h === "amount");

    if (dateOpIdx === -1 || labelIdx === -1 || amountIdx === -1) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Boursorama", currency: "EUR" };
    }

    const transactions = [];

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const parts = lines[i]!.split(";");
      if (parts.length < 3) continue;

      const rawDate = (parts[dateOpIdx] ?? "").trim();
      const description = (parts[labelIdx] ?? "").replace(/^"|"$/g, "").trim();
      const rawAmount = (parts[amountIdx] ?? "").trim();

      if (!rawDate || !rawAmount) continue;

      const date = parseDDMMYYYY(rawDate);
      const amount = parseBoursoramaAmount(rawAmount);
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
      bankName: "Boursorama",
      currency: "EUR",
    };
  },
} satisfies BankParser;
