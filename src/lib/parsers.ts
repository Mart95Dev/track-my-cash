import * as XLSX from "xlsx";

export interface ParsedTransaction {
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // positive = income, negative = expense
  type: "income" | "expense";
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  detectedBalance: number | null;
  detectedBalanceDate: string | null;
  bankName: string;
  currency: string;
}

// ============ BANQUE POPULAIRE (CSV ; ISO-8859-1) ============

export function parseBanquePopulaire(content: string): ParseResult {
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

  if (dataStart === -1) return { transactions: [], detectedBalance: balance, detectedBalanceDate: balanceDate, bankName: "Banque Populaire", currency: "EUR" };

  const transactions: ParsedTransaction[] = [];
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
        type: amount > 0 ? "income" : "expense",
      });
    }
  }

  return { transactions, detectedBalance: balance, detectedBalanceDate: balanceDate, bankName: "Banque Populaire", currency: "EUR" };
}

// ============ MCB MADAGASCAR (CSV , UTF-8, MGA) ============

export function parseMCB(content: string): ParseResult {
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

  if (dataStart === -1) return { transactions: [], detectedBalance: initialBalance, detectedBalanceDate: null, bankName: "MCB", currency: "MGA" };

  const transactions: ParsedTransaction[] = [];
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

    // Parse date DD-MMM-YYYY
    const dp = dateRaw.split("-");
    if (dp.length !== 3) continue;
    const day = dp[0].padStart(2, "0");
    const mon = MONTHS[dp[1]];
    if (!mon) continue;
    const year = dp[2];
    const date = `${year}-${mon}-${day}`;

    if (!isNaN(solde)) {
      lastBalance = solde;
      lastBalanceDate = date;
    }

    const amount = credit > 0 ? credit : debit;
    const type = credit > 0 ? "income" : "expense";

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

// ============ REVOLUT (Excel .xlsx) ============

export function parseRevolut(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown as unknown[][];

  if (data.length < 2) return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Revolut", currency: "EUR" };

  const headers = data[0] as string[];
  const dateIdx = headers.findIndex((h) => h && String(h).toLowerCase().includes("début"));
  const descIdx = headers.findIndex((h) => h === "Description");
  const montantIdx = headers.findIndex((h) => h === "Montant");
  const soldeIdx = headers.findIndex((h) => h === "Solde");

  if (dateIdx === -1 || montantIdx === -1) {
    // Try English headers
    const dateIdxEN = headers.findIndex((h) => h && String(h).toLowerCase().includes("started"));
    const descIdxEN = headers.findIndex((h) => h === "Description");
    const montantIdxEN = headers.findIndex((h) => h === "Amount");
    const soldeIdxEN = headers.findIndex((h) => h === "Balance");

    if (dateIdxEN === -1 || montantIdxEN === -1) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Revolut", currency: "EUR" };
    }

    return parseRevolutRows(data.slice(1), dateIdxEN, descIdxEN, montantIdxEN, soldeIdxEN);
  }

  return parseRevolutRows(data.slice(1), dateIdx, descIdx, montantIdx, soldeIdx);
}

function parseRevolutRows(
  rows: unknown[][],
  dateIdx: number,
  descIdx: number,
  montantIdx: number,
  soldeIdx: number
): ParseResult {
  const transactions: ParsedTransaction[] = [];
  let lastBalance: number | null = null;
  let lastBalanceDate: string | null = null;

  for (const row of rows) {
    if (!row || row.length <= Math.max(dateIdx, montantIdx)) continue;

    let date = row[dateIdx];
    const description = String(row[descIdx] ?? "").trim();
    const montant = parseFloat(String(row[montantIdx]));

    if (typeof date === "number") {
      // Excel serial date
      const baseDate = new Date(1899, 11, 30);
      const targetDate = new Date(baseDate.getTime() + date * 86400000);
      date = targetDate.toISOString().split("T")[0];
    } else if (typeof date === "string") {
      // Try to parse date string
      if (date.includes("/")) {
        date = parseDateFR(date);
      } else if (date.includes(" ")) {
        // "2026-02-01 10:30:00" format
        date = date.split(" ")[0];
      }
    }

    if (soldeIdx >= 0 && row[soldeIdx] != null) {
      const solde = parseFloat(String(row[soldeIdx]));
      if (!isNaN(solde)) {
        lastBalance = solde;
        lastBalanceDate = String(date);
      }
    }

    if (date && description && !isNaN(montant) && montant !== 0) {
      transactions.push({
        date: String(date),
        description,
        amount: Math.abs(montant),
        type: montant > 0 ? "income" : "expense",
      });
    }
  }

  return {
    transactions,
    detectedBalance: lastBalance,
    detectedBalanceDate: lastBalanceDate,
    bankName: "Revolut",
    currency: "EUR",
  };
}

// ============ AUTO-DETECT FORMAT ============

export function detectAndParse(content: string, filename: string): ParseResult {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".xlsx")) {
    const buffer = Buffer.from(content, "base64");
    return parseRevolut(buffer);
  }

  // MCB detection
  if (content.includes("Date de la transaction") || content.includes("Devise du compte MGA")) {
    return parseMCB(content);
  }

  // Banque Populaire detection
  if (content.includes("Montant(EUROS)") || content.includes("Solde (EUROS)")) {
    return parseBanquePopulaire(content);
  }

  // Try Banque Populaire as fallback (semicolon separated)
  if (content.includes(";")) {
    return parseBanquePopulaire(content);
  }

  return parseMCB(content);
}

// ============ HELPERS ============

function parseAmount(str: string): number {
  return parseFloat(
    str
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^0-9.\-]/g, "")
  );
}

function parseAmountMCB(str: string): number {
  if (!str) return 0;
  const cleaned = str.replace(/"/g, "").replace(/\s/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function parseDateFR(str: string): string {
  const parts = str.split("/");
  if (parts.length !== 3) return str;
  return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
