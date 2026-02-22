import type { BankParser, ParseResult } from "./types";

function parseFrenchAmount(str: string): number {
  // Gère "+2 500,00", "-45,30", "2500,00"
  return parseFloat(str.replace(/\s/g, "").replace(",", ".").replace(/^\+/, ""));
}

function parseDDMMYYYY(str: string): string {
  // Convertit "DD/MM/YYYY" en "YYYY-MM-DD"
  const parts = str.split("/");
  if (parts.length === 3 && parts[2]!.length === 4) {
    return `${parts[2]}-${parts[1]!.padStart(2, "0")}-${parts[0]!.padStart(2, "0")}`;
  }
  return str;
}

export const ingParser = {
  name: "ING Direct",

  canHandle(filename: string, content?: string): boolean {
    if (!filename.toLowerCase().endsWith(".csv")) return false;
    if (!content) return false;
    const header = content.split("\n")[0] ?? "";
    // Détection : en-tête tabulé avec Date et Libellé
    return header.includes("\t") && header.includes("Libellé") && header.includes("Date");
  },

  parse(content: string | null, _buffer: Buffer | null): ParseResult {
    if (!content) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "ING Direct", currency: "EUR" };
    }

    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    const headerIdx = lines.findIndex((l) => l.includes("\t") && l.includes("Libellé"));
    if (headerIdx === -1) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "ING Direct", currency: "EUR" };
    }

    const headers = lines[headerIdx]!.split("\t").map((h) => h.trim());
    const dateIdx = headers.findIndex((h) => h === "Date");
    const labelIdx = headers.findIndex((h) => h === "Libellé");
    const amountIdx = headers.findIndex((h) => h === "Montant");
    const balanceIdx = headers.findIndex((h) => h === "Solde");

    if (dateIdx === -1 || labelIdx === -1 || amountIdx === -1) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "ING Direct", currency: "EUR" };
    }

    const transactions = [];
    let detectedBalance: number | null = null;
    let detectedBalanceDate: string | null = null;

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const parts = lines[i]!.split("\t");
      if (parts.length < 3) continue;

      const rawDate = (parts[dateIdx] ?? "").trim();
      const description = (parts[labelIdx] ?? "").replace(/^"|"$/g, "").trim();
      const rawAmount = (parts[amountIdx] ?? "").replace(/^"|"$/g, "").trim();

      if (!rawDate || !rawAmount) continue;

      const date = parseDDMMYYYY(rawDate);
      const amount = parseFrenchAmount(rawAmount);
      if (isNaN(amount) || amount === 0) continue;

      // Solde de la première ligne (ligne la plus récente)
      if (detectedBalance === null && balanceIdx >= 0) {
        const rawBalance = (parts[balanceIdx] ?? "").replace(/^"|"$/g, "").trim();
        if (rawBalance) {
          const bal = parseFrenchAmount(rawBalance);
          if (!isNaN(bal)) {
            detectedBalance = bal;
            detectedBalanceDate = date;
          }
        }
      }

      transactions.push({
        date,
        description,
        amount: Math.abs(amount),
        type: amount < 0 ? ("expense" as const) : ("income" as const),
      });
    }

    return {
      transactions,
      detectedBalance,
      detectedBalanceDate,
      bankName: "ING Direct",
      currency: "EUR",
    };
  },
} satisfies BankParser;
