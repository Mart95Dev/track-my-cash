import type { BankParser, ParseResult } from "./types";

export interface ColumnMapping {
  dateColumn: string;
  amountColumn?: string;
  debitColumn?: string;
  creditColumn?: string;
  descriptionColumn: string;
  separator: ";" | "," | "\t";
  dateFormat: "DD/MM/YYYY" | "YYYY-MM-DD" | "DD-MM-YYYY" | "DD-MMM-YYYY";
}

export interface GenericParseResult {
  needsMapping: true;
  headers: string[];
  preview: string[][];
  fingerprint: string;
}

interface GenericCsvParserType extends BankParser {
  parseWithMapping(content: string, mapping: ColumnMapping): ParseResult;
  detectHeaders(content: string): { headers: string[]; preview: string[][]; fingerprint: string };
}

function detectSeparator(line: string): ";" | "," | "\t" {
  const tabCount = (line.match(/\t/g) ?? []).length;
  const semiCount = (line.match(/;/g) ?? []).length;
  const commaCount = (line.match(/,/g) ?? []).length;
  if (tabCount >= semiCount && tabCount >= commaCount) return "\t";
  if (semiCount >= commaCount) return ";";
  return ",";
}

function computeFingerprint(headers: string[]): string {
  const str = headers.join("|").toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(16);
}

function parseDateGeneric(str: string, format: ColumnMapping["dateFormat"]): string {
  const s = str.trim();
  if (format === "YYYY-MM-DD") return s;
  if (format === "DD/MM/YYYY") {
    const parts = s.split("/");
    if (parts.length === 3) return `${parts[2]}-${parts[1]!.padStart(2, "0")}-${parts[0]!.padStart(2, "0")}`;
  }
  if (format === "DD-MM-YYYY") {
    const parts = s.split("-");
    if (parts.length === 3 && parts[2]!.length === 4) {
      return `${parts[2]}-${parts[1]!.padStart(2, "0")}-${parts[0]!.padStart(2, "0")}`;
    }
  }
  if (format === "DD-MMM-YYYY") {
    const months: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };
    const parts = s.split("-");
    if (parts.length === 3) {
      const mm = months[parts[1]!.toLowerCase().slice(0, 3)] ?? "01";
      return `${parts[2]}-${mm}-${parts[0]!.padStart(2, "0")}`;
    }
  }
  return s;
}

export const genericCsvParser: GenericCsvParserType = {
  name: "CSV générique",

  canHandle(filename: string): boolean {
    return filename.toLowerCase().endsWith(".csv");
  },

  parse(_content: string | null, _buffer: Buffer | null): ParseResult {
    return {
      transactions: [],
      detectedBalance: null,
      detectedBalanceDate: null,
      bankName: "CSV générique",
      currency: "EUR",
    };
  },

  detectHeaders(content: string): { headers: string[]; preview: string[][]; fingerprint: string } {
    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length === 0) return { headers: [], preview: [], fingerprint: "empty" };

    const firstLine = lines[0]!;
    const sep = detectSeparator(firstLine);
    const headers = firstLine.split(sep).map((h) => h.replace(/^"|"$/g, "").trim());

    const preview: string[][] = [];
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      preview.push(lines[i]!.split(sep).map((cell) => cell.replace(/^"|"$/g, "").trim()));
    }

    return { headers, preview, fingerprint: computeFingerprint(headers) };
  },

  parseWithMapping(content: string, mapping: ColumnMapping): ParseResult {
    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "CSV générique", currency: "EUR" };
    }

    const sep = mapping.separator;
    const rawHeaders = lines[0]!.split(sep).map((h) => h.replace(/^"|"$/g, "").trim());
    const colIdx = (col: string) => rawHeaders.indexOf(col);

    const dateIdx = colIdx(mapping.dateColumn);
    const descIdx = colIdx(mapping.descriptionColumn);
    const amountIdx = mapping.amountColumn ? colIdx(mapping.amountColumn) : -1;
    const debitIdx = mapping.debitColumn ? colIdx(mapping.debitColumn) : -1;
    const creditIdx = mapping.creditColumn ? colIdx(mapping.creditColumn) : -1;

    const transactions = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i]!.split(sep).map((c) => c.replace(/^"|"$/g, "").trim());

      const rawDate = dateIdx >= 0 ? (cells[dateIdx] ?? "") : "";
      const description = descIdx >= 0 ? (cells[descIdx] ?? "") : "";

      if (!rawDate || !description) continue;

      const date = parseDateGeneric(rawDate, mapping.dateFormat);

      let amount: number;
      let type: "income" | "expense";

      if (amountIdx >= 0) {
        const rawAmount = (cells[amountIdx] ?? "").replace(/\s/g, "").replace(",", ".");
        const parsed = parseFloat(rawAmount);
        if (isNaN(parsed) || parsed === 0) continue;
        amount = Math.abs(parsed);
        type = parsed < 0 ? "expense" : "income";
      } else if (debitIdx >= 0 || creditIdx >= 0) {
        const rawDebit = debitIdx >= 0 ? (cells[debitIdx] ?? "").replace(/\s/g, "").replace(",", ".") : "";
        const rawCredit = creditIdx >= 0 ? (cells[creditIdx] ?? "").replace(/\s/g, "").replace(",", ".") : "";
        const debit = rawDebit ? parseFloat(rawDebit) : 0;
        const credit = rawCredit ? parseFloat(rawCredit) : 0;

        if (!isNaN(debit) && debit > 0) {
          amount = debit;
          type = "expense";
        } else if (!isNaN(credit) && credit > 0) {
          amount = credit;
          type = "income";
        } else {
          continue;
        }
      } else {
        continue;
      }

      transactions.push({ date, description, amount, type });
    }

    return {
      transactions,
      detectedBalance: null,
      detectedBalanceDate: null,
      bankName: "CSV générique",
      currency: "EUR",
    };
  },
};
