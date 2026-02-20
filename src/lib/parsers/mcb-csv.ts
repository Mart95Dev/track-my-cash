import type { BankParser, ParseResult } from "./types";
import { parseAmountMCB, parseCSVLine } from "./utils";

function parseMCBContent(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  let initialBalance: number | null = null;
  let lastBalance: number | null = null;
  let lastBalanceDate: string | null = null;

  const MONTHS: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };

  // Parse header for initial balance
  for (let i = 0; i < Math.min(25, lines.length); i++) {
    const line = lines[i];
    const initMatch = line.match(/Solde.*initial.*?([\d\s]+,\d{2})/i);
    if (initMatch) {
      initialBalance = parseAmountMCB(initMatch[1]);
    }
  }

  // Find data header
  let dataStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("Date de la transaction")) {
      dataStart = i + 1;
      break;
    }
  }

  if (dataStart === -1) {
    return {
      transactions: [],
      detectedBalance: initialBalance,
      detectedBalanceDate: null,
      bankName: "MCB",
      currency: "MGA",
    };
  }

  const transactions = [];
  for (let i = dataStart; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV with quoted fields
    const parts = parseCSVLine(line);
    if (parts.length < 7) continue;

    const dateRaw = parts[0].trim();
    const description = parts[3].trim();
    const debit = parseAmountMCB(parts[4]);
    const credit = parseAmountMCB(parts[5]);
    const solde = parseAmountMCB(parts[6]);

    // Parse date : DD-MM-YYYY (numérique) ou DD-MMM-YYYY (abréviation)
    const dp = dateRaw.split("-");
    if (dp.length !== 3) continue;
    const day = dp[0].padStart(2, "0");
    const year = dp[2];
    let mon: string;
    if (/^\d+$/.test(dp[1])) {
      mon = dp[1].padStart(2, "0");
    } else {
      mon = MONTHS[dp[1]];
      if (!mon) continue;
    }
    const date = `${year}-${mon}-${day}`;

    // Conserver le solde le plus récent (le fichier peut être trié du plus récent au plus ancien)
    if (!isNaN(solde) && (!lastBalanceDate || date > lastBalanceDate)) {
      lastBalance = solde;
      lastBalanceDate = date;
    }

    const amount = credit > 0 ? credit : debit;
    const type: "income" | "expense" = credit > 0 ? "income" : "expense";

    if (description && amount > 0) {
      transactions.push({ date, description, amount, type });
    }
  }

  return {
    transactions,
    detectedBalance: lastBalance ?? initialBalance,
    detectedBalanceDate: lastBalanceDate,
    bankName: "MCB",
    currency: "MGA",
  };
}

export const mcbCsvParser: BankParser = {
  name: "MCB",
  canHandle(_filename, content) {
    if (!content) return false;
    return (
      content.includes("Date de la transaction") ||
      content.includes("Devise du compte MGA")
    );
  },
  parse(content) {
    if (!content) throw new Error("Contenu requis pour le parser MCB CSV");
    return parseMCBContent(content);
  },
};
