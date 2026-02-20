import type { BankParser, ParseResult } from "./types";
import { parseDateFR, parseAmount } from "./utils";

function parseBanquePopulaireContent(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  let balance: number | null = null;
  let balanceDate: string | null = null;

  // Parse header
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    if (line.startsWith("Solde")) {
      const parts = line.split(";");
      if (parts.length >= 2) {
        balance = parseAmount(parts[1]);
      }
    }
    if (line.startsWith("Date")) {
      const parts = line.split(";");
      if (parts.length >= 2 && parts[1].includes("/")) {
        balanceDate = parseDateFR(parts[1].trim());
      }
    }
  }

  // Find data header
  let dataStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^Date;Libell/i)) {
      dataStart = i + 1;
      break;
    }
  }

  if (dataStart === -1) {
    return {
      transactions: [],
      detectedBalance: balance,
      detectedBalanceDate: balanceDate,
      bankName: "Banque Populaire",
      currency: "EUR",
    };
  }

  const transactions = [];
  for (let i = dataStart; i < lines.length; i++) {
    const parts = lines[i].split(";");
    if (parts.length < 3) continue;

    const date = parseDateFR(parts[0].trim());
    const description = parts[1].replace(/^"|"$/g, "").trim();
    const amount = parseAmount(parts[2]);

    if (date && description && !isNaN(amount) && amount !== 0) {
      transactions.push({
        date,
        description,
        amount: Math.abs(amount),
        type: (amount > 0 ? "income" : "expense") as "income" | "expense",
      });
    }
  }

  return {
    transactions,
    detectedBalance: balance,
    detectedBalanceDate: balanceDate,
    bankName: "Banque Populaire",
    currency: "EUR",
  };
}

export const banquePopulaireParser: BankParser = {
  name: "Banque Populaire",
  canHandle(filename, content) {
    if (!content) return false;
    return (
      content.includes("Montant(EUROS)") ||
      content.includes("Solde (EUROS)") ||
      (filename.endsWith(".csv") && content.includes(";"))
    );
  },
  parse(content) {
    if (!content) throw new Error("Contenu requis pour le parser Banque Populaire");
    return parseBanquePopulaireContent(content);
  },
};
