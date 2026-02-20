import * as XLSX from "xlsx";
import { execFileSync } from "child_process";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { randomBytes } from "crypto";

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

  // XLSX peut lire les caractères accentués en mojibake (UTF-8 interprété Latin-1)
  // On corrige les en-têtes avant de chercher les colonnes
  const headers = (data[0] as string[]).map((h) => (h ? fixMojibake(String(h)) : h));

  const dateIdx = headers.findIndex((h) => h && String(h).toLowerCase().includes("début"));
  const descIdx = headers.findIndex((h) => h === "Description");
  const montantIdx = headers.findIndex((h) => h === "Montant");
  const soldeIdx = headers.findIndex((h) => h === "Solde");
  const deviseIdx = headers.findIndex((h) => h === "Devise");
  const etatIdx = headers.findIndex((h) => h && String(h).toLowerCase().replace(/[eé]/g, "e").includes("etat"));

  if (dateIdx !== -1 && montantIdx !== -1) {
    return parseRevolutRows(data.slice(1), dateIdx, descIdx, montantIdx, soldeIdx, deviseIdx, etatIdx);
  }

  // Fallback : en-têtes anglaises
  const dateIdxEN = headers.findIndex((h) => h && String(h).toLowerCase().includes("started"));
  const descIdxEN = headers.findIndex((h) => h === "Description");
  const montantIdxEN = headers.findIndex((h) => h === "Amount");
  const soldeIdxEN = headers.findIndex((h) => h === "Balance");
  const deviseIdxEN = headers.findIndex((h) => h === "Currency");
  const etatIdxEN = headers.findIndex((h) => h === "State");

  if (dateIdxEN === -1 || montantIdxEN === -1) {
    return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Revolut", currency: "EUR" };
  }

  return parseRevolutRows(data.slice(1), dateIdxEN, descIdxEN, montantIdxEN, soldeIdxEN, deviseIdxEN, etatIdxEN);
}

function parseRevolutRows(
  rows: unknown[][],
  dateIdx: number,
  descIdx: number,
  montantIdx: number,
  soldeIdx: number,
  deviseIdx: number = -1,
  etatIdx: number = -1
): ParseResult {
  const transactions: ParsedTransaction[] = [];
  let lastBalance: number | null = null;
  let lastBalanceDate: string | null = null;
  let currency = "EUR";

  for (const row of rows) {
    if (!row || row.length <= Math.max(dateIdx, montantIdx)) continue;

    // Lire le statut de l'opération
    const etat = etatIdx >= 0 ? fixMojibake(String(row[etatIdx] ?? "")).trim().toUpperCase() : "";

    // Ignorer les opérations annulées/refusées (RENVOYÉ, ANNULÉ, FAILED, REVERTED…)
    if (etat && (etat.includes("RENVOY") || etat.includes("ANNUL") || etat === "FAILED" || etat === "REVERTED")) {
      continue;
    }

    let date = row[dateIdx];
    const description = fixMojibake(String(row[descIdx] ?? "").trim());
    const montant = parseFloat(String(row[montantIdx]));

    if (deviseIdx >= 0 && row[deviseIdx]) {
      currency = String(row[deviseIdx]).trim();
    }

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

    // N'utiliser le Solde que pour les transactions confirmées (pas EN ATTENTE)
    // Le solde des lignes EN ATTENTE n'inclut pas toutes les opérations en cours
    const isCompleted = !etat || etat === "TERMINÉ" || etat === "COMPLETED" || etat === "COMPLETE";
    if (isCompleted && soldeIdx >= 0 && row[soldeIdx] != null) {
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
    currency,
  };
}

// ============ MCB MADAGASCAR (PDF relevé officiel, via pdftotext -layout) ============

export function parseMCBPdf(buffer: Buffer): ParseResult {
  const tmpPath = `/tmp/mcb-${randomBytes(8).toString("hex")}.pdf`;
  try {
    writeFileSync(tmpPath, buffer);
    const pdftotextPath = findPdftotext();
    const text = execFileSync(pdftotextPath, ["-layout", "-nopgbrk", tmpPath, "-"], {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
    if (!text || text.trim().length === 0) {
      throw new Error("Le PDF semble vide ou protégé par mot de passe.");
    }
    return parseMCBPdfText(text);
  } finally {
    try { unlinkSync(tmpPath); } catch { /* ignore */ }
  }
}

function findPdftotext(): string {
  const candidates = [
    "/opt/homebrew/bin/pdftotext",
    "/usr/local/bin/pdftotext",
    "/usr/bin/pdftotext",
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  throw new Error("pdftotext non trouvé. Installez poppler : brew install poppler");
}

function parseMCBPdfText(text: string): ParseResult {
  const lines = text.split(/\r?\n/);
  const transactions: ParsedTransaction[] = [];

  // Montants format français : "696 043,18" ou "3 776 976,17"
  const AMOUNT_RE = /\d+(?:\s\d{3})*,\d{2}/g;
  // Ligne de transaction : 1-5 espaces + DD/MM/YYYY + spaces + DD/MM/YYYY + description+montants
  const TX_LINE_RE = /^\s{1,5}(\d{2}\/\d{2}\/\d{4})\s+\d{2}\/\d{2}\/\d{4}\s+(.*)/;

  let prevSolde: number | null = null;
  let currentDate: string | null = null;
  let descParts: string[] = [];
  let currentSolde: number | null = null;

  function flush() {
    if (!currentDate || currentSolde === null) return;
    const description = descParts.join(" ").trim();
    if (prevSolde !== null) {
      const diff = currentSolde - prevSolde;
      const amount = Math.round(Math.abs(diff) * 100) / 100;
      const type: "income" | "expense" = diff > 0 ? "income" : "expense";
      if (amount > 0.005 && description) {
        transactions.push({ date: currentDate, description, amount, type });
      }
    }
    prevSolde = currentSolde;
    currentDate = null;
    descParts = [];
    currentSolde = null;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Séparateur de page : flush pour éviter que l'en-tête de la page suivante
    // ne soit ajouté à la description de la dernière transaction
    if (/En cas de désaccord/i.test(trimmed)) {
      flush();
      continue;
    }

    // "Solde Précédent" → solde initial avant le 1er mouvement
    if (/Solde Pr[eé]c[eé]dent/i.test(trimmed)) {
      flush();
      const amounts = [...trimmed.matchAll(AMOUNT_RE)];
      if (amounts.length > 0) {
        prevSolde = parseFRAmount(amounts[amounts.length - 1][0]);
      }
      continue;
    }

    // "Solde Encours" → solde final (fin de relevé)
    if (/Solde Encours/i.test(trimmed)) {
      flush();
      const amounts = [...trimmed.matchAll(AMOUNT_RE)];
      if (amounts.length > 0) {
        prevSolde = parseFRAmount(amounts[amounts.length - 1][0]);
      }
      continue;
    }

    // Ligne de transaction (débute par une date)
    const txMatch = line.match(TX_LINE_RE);
    if (txMatch) {
      flush();
      const [, dateRaw, rest] = txMatch;
      currentDate = parseDateFR(dateRaw);
      const amounts = [...rest.matchAll(AMOUNT_RE)];
      if (amounts.length > 0) {
        currentSolde = parseFRAmount(amounts[amounts.length - 1][0]);
        const firstAmountPos = rest.indexOf(amounts[0][0]);
        const descText = rest.substring(0, firstAmountPos).trim();
        descParts = descText ? [descText] : [];
      } else {
        descParts = rest.trim() ? [rest.trim()] : [];
      }
      continue;
    }

    // Ligne de suite de description (grand retrait, pas de date, pas un en-tête)
    if (currentDate && line.match(/^\s{20,}/) && !isPdfHeaderOrFooter(trimmed)) {
      const amounts = [...trimmed.matchAll(AMOUNT_RE)];
      const descEnd = amounts.length > 0 ? trimmed.indexOf(amounts[0][0]) : trimmed.length;
      const descText = trimmed.substring(0, descEnd).trim();
      if (descText) descParts.push(descText);
    }
  }

  flush();

  const lastTx = transactions[transactions.length - 1];
  return {
    transactions,
    detectedBalance: prevSolde,
    detectedBalanceDate: lastTx?.date ?? null,
    bankName: "MCB",
    currency: "MGA",
  };
}

function isPdfHeaderOrFooter(trimmed: string): boolean {
  return (
    trimmed.startsWith("Date de") ||
    /^l.op[eé]ration/.test(trimmed) ||
    trimmed === "valeur" ||
    trimmed.startsWith("(-)") ||
    trimmed.startsWith("Compte a vue") ||
    trimmed.startsWith("Numéro de compte") ||
    trimmed.startsWith("Devise") ||
    trimmed.startsWith("Période") ||
    trimmed.startsWith("Mode D") ||
    trimmed.startsWith("RIB") ||
    trimmed.startsWith("Pour tout changement") ||
    trimmed.startsWith("LOT ") ||
    trimmed.startsWith("MR ") ||
    /^\d{3}\s/.test(trimmed) || // ex. "601 TOLIARA"
    trimmed === "MADAGASCAR"
  );
}

function parseFRAmount(str: string): number {
  return parseFloat(str.replace(/\s/g, "").replace(",", "."));
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

// Corrige le mojibake : octets UTF-8 interprétés en Latin-1 par certains lecteurs XLSX
function fixMojibake(str: string): string {
  try {
    const bytes = Uint8Array.from(str, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return str;
  }
}

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
