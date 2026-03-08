import type { BankParser, ParseResult, SuggestedMapping } from "./types";

export interface ColumnMapping {
  dateColumn: string;
  amountColumn?: string;
  debitColumn?: string;
  creditColumn?: string;
  descriptionColumn: string;
  separator: ";" | "," | "\t";
  dateFormat: "DD/MM/YYYY" | "YYYY-MM-DD" | "DD-MM-YYYY" | "DD-MMM-YYYY" | "DD.MM.YYYY" | "MM/DD/YYYY";
}

export interface GenericParseResult {
  needsMapping: true;
  headers: string[];
  preview: string[][];
  fingerprint: string;
}

interface ColumnScore {
  dateCol: number;
  amountCol: number;      // -1 si colonnes séparées débit/crédit
  labelCol: number;
  debitCol: number;       // -1 si colonne montant unifiée
  creditCol: number;      // -1 si colonne montant unifiée
  confidence: number;
}

interface GenericCsvParserType extends BankParser {
  parseWithMapping(content: string, mapping: ColumnMapping): ParseResult;
  detectHeaders(content: string): { headers: string[]; preview: string[][]; fingerprint: string };
}

// ---------------------------------------------------------------------------
// Mots-clés de scoring pour chaque type de colonne
// ---------------------------------------------------------------------------
const DATE_KEYWORDS = ["date", "dt", "jour", "day", "dated", "valeur"];
const AMOUNT_KEYWORDS = ["montant", "amount", "somme", "total"];
const LABEL_KEYWORDS = [
  "libellé", "libelle", "description", "details", "label", "memo",
  "opération", "operation", "intitulé", "intitule",
];

// Mots-clés spécifiques pour colonnes débit et crédit séparées
const DEBIT_KEYWORDS = ["débit", "debit", "sortie", "retrait", "withdrawal", "out"];
const CREDIT_KEYWORDS = ["crédit", "credit", "entrée", "versement", "deposit", "in"];

// Alias courants pour la détection de synonymes (partiel)
const DATE_PARTIAL = ["date", "dt", "jour", "day", "valeur"];
const AMOUNT_PARTIAL = ["montant", "amount", "somme", "total"];
const LABEL_PARTIAL = ["libellé", "libelle", "description", "details", "label", "memo", "opération", "operation", "intitulé", "intitule"];
const DEBIT_PARTIAL = ["débit", "debit", "sortie", "retrait", "withdrawal", "out"];
const CREDIT_PARTIAL = ["crédit", "credit", "entrée", "versement", "deposit", "in"];

// ---------------------------------------------------------------------------
// Utilitaires internes
// ---------------------------------------------------------------------------

function detectSeparator(line: string): ";" | "," | "\t" {
  const tabCount = (line.match(/\t/g) ?? []).length;
  const semiCount = (line.match(/;/g) ?? []).length;
  const commaCount = (line.match(/,/g) ?? []).length;
  if (tabCount >= semiCount && tabCount >= commaCount) return "\t";
  if (semiCount >= commaCount) return ";";
  return ",";
}

/** Exposé pour les tests */
export function detectSeparatorExported(line: string): ";" | "," | "\t" {
  return detectSeparator(line);
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

/**
 * Vérifie si une valeur ressemble à une date dans un format reconnu.
 */
function looksLikeDate(value: string): boolean {
  const v = value.trim();
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return true;
  // DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) return true;
  // DD-MM-YYYY (avec année 4 chiffres)
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(v)) return true;
  // DD.MM.YYYY
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(v)) return true;
  // DD-Mon-YYYY (ex: 15-Jan-2024)
  if (/^\d{1,2}-[A-Za-z]{3}-\d{4}$/.test(v)) return true;
  // MM/DD/YYYY (heuristique : même regex que DD/MM mais mois <= 12)
  return false;
}

/**
 * Vérifie si une valeur ressemble à un montant numérique.
 */
function looksLikeAmount(value: string): boolean {
  const v = value.trim();
  // Supprimer espaces, parenth. comptables, symboles monnaie
  const cleaned = v.replace(/\s/g, "").replace(/^\((.+)\)$/, "-$1").replace(/[€$£]/g, "");
  // Remplacer virgule décimale ou milliers
  const normalized = cleaned.replace(/,/g, ".");
  return /^-?\d+(\.\d+)?$/.test(normalized) || /^-?\d{1,3}(\.\d{3})*(,\d+)?$/.test(v);
}

interface AllScores {
  date: number[];
  amount: number[];
  label: number[];
  debit: number[];
  credit: number[];
}

function scoreHeadersByName(headers: string[]): AllScores {
  const n = headers.length;
  const scores: AllScores = {
    date: new Array<number>(n).fill(0),
    amount: new Array<number>(n).fill(0),
    label: new Array<number>(n).fill(0),
    debit: new Array<number>(n).fill(0),
    credit: new Array<number>(n).fill(0),
  };

  for (let i = 0; i < n; i++) {
    const h = headers[i]!.toLowerCase().trim();

    if (DATE_KEYWORDS.includes(h)) scores.date[i]! += 50;
    else if (DATE_PARTIAL.some((k) => h.includes(k))) scores.date[i]! += 30;

    if (AMOUNT_KEYWORDS.includes(h)) scores.amount[i]! += 50;
    else if (AMOUNT_PARTIAL.some((k) => h.includes(k))) scores.amount[i]! += 30;

    if (LABEL_KEYWORDS.includes(h)) scores.label[i]! += 50;
    else if (LABEL_PARTIAL.some((k) => h.includes(k))) scores.label[i]! += 30;

    if (DEBIT_KEYWORDS.includes(h)) scores.debit[i]! += 50;
    else if (DEBIT_PARTIAL.some((k) => h.includes(k))) scores.debit[i]! += 30;

    if (CREDIT_KEYWORDS.includes(h)) scores.credit[i]! += 50;
    else if (CREDIT_PARTIAL.some((k) => h.includes(k))) scores.credit[i]! += 30;
  }

  return scores;
}

function scoreByDataSampling(scores: AllScores, headers: string[], firstRows: string[][]): void {
  const sampleRows = firstRows.slice(0, 3);
  const n = headers.length;

  for (let i = 0; i < n; i++) {
    let dateHits = 0;
    let amountHits = 0;
    for (const row of sampleRows) {
      const cell = row[i] ?? "";
      if (looksLikeDate(cell)) dateHits++;
      if (looksLikeAmount(cell)) amountHits++;
    }
    const total = sampleRows.length || 1;
    scores.date[i]! += Math.round((dateHits / total) * 30);
    scores.amount[i]! += Math.round((amountHits / total) * 30);
    scores.debit[i]! += Math.round((amountHits / total) * 15);
    scores.credit[i]! += Math.round((amountHits / total) * 15);
  }
}

function selectBestColumns(scores: AllScores): ColumnScore {
  const bestDateIdx = scores.date.indexOf(Math.max(...scores.date));

  const bestDebitIdx = scores.debit.indexOf(Math.max(...scores.debit));
  const bestCreditIdx = scores.credit.indexOf(Math.max(...scores.credit));
  const debitMaxScore = scores.debit[bestDebitIdx] ?? 0;
  const creditMaxScore = scores.credit[bestCreditIdx] ?? 0;

  const hasSeparateDebitCredit =
    debitMaxScore >= 30 &&
    creditMaxScore >= 30 &&
    bestDebitIdx !== bestCreditIdx &&
    bestDebitIdx !== bestDateIdx &&
    bestCreditIdx !== bestDateIdx;

  let bestAmountIdx: number;
  let finalDebitIdx: number;
  let finalCreditIdx: number;

  if (hasSeparateDebitCredit) {
    bestAmountIdx = -1;
    finalDebitIdx = bestDebitIdx;
    finalCreditIdx = bestCreditIdx;
  } else {
    bestAmountIdx = scores.amount.indexOf(Math.max(...scores.amount));
    finalDebitIdx = -1;
    finalCreditIdx = -1;
  }

  // Pour le libellé, éviter les colonnes déjà prises
  const labelScoresCopy = [...scores.label];
  labelScoresCopy[bestDateIdx] = -1;
  if (hasSeparateDebitCredit) {
    labelScoresCopy[finalDebitIdx] = -1;
    if (finalCreditIdx !== finalDebitIdx) labelScoresCopy[finalCreditIdx] = -1;
  } else if (bestAmountIdx >= 0 && bestAmountIdx !== bestDateIdx) {
    labelScoresCopy[bestAmountIdx] = -1;
  }
  const bestLabelIdx = labelScoresCopy.indexOf(Math.max(...labelScoresCopy));

  const dateScore = scores.date[bestDateIdx] ?? 0;
  const labelScore = scores.label[bestLabelIdx] ?? 0;

  let confidence: number;
  if (hasSeparateDebitCredit) {
    const maxPossible = 80;
    const debitScore = scores.debit[finalDebitIdx] ?? 0;
    const creditScore = scores.credit[finalCreditIdx] ?? 0;
    confidence = Math.min(
      100,
      Math.round(((dateScore + debitScore + creditScore + labelScore) / (4 * maxPossible)) * 100) + 20,
    );
  } else {
    const amountScore = scores.amount[bestAmountIdx >= 0 ? bestAmountIdx : 0] ?? 0;
    const maxPossible = 80;
    confidence = Math.min(
      100,
      Math.round(((dateScore + amountScore + labelScore) / (3 * maxPossible)) * 100),
    );
  }

  return {
    dateCol: bestDateIdx,
    amountCol: bestAmountIdx,
    labelCol: bestLabelIdx,
    debitCol: finalDebitIdx,
    creditCol: finalCreditIdx,
    confidence,
  };
}

/**
 * Calcule un score de colonne pour chaque type (date, amount, label, debit, credit).
 * Score par nom de header + validation sur les premières lignes.
 * Si debitCol >= 0 && creditCol >= 0 : format bancaire séparé, amountCol = -1.
 * Retourne confidence 0-100.
 */
function detectColumns(headers: string[], firstRows: string[][]): ColumnScore {
  const scores = scoreHeadersByName(headers);
  scoreByDataSampling(scores, headers, firstRows);
  return selectBestColumns(scores);
}

/** Exposé pour les tests */
export function detectColumnsExported(headers: string[], firstRows: string[][]): ColumnScore {
  return detectColumns(headers, firstRows);
}

// ---------------------------------------------------------------------------
// Parsing des dates — formats supportés
// ---------------------------------------------------------------------------

const MONTH_MAP: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

/**
 * Auto-détecte le format d'une date et la convertit en YYYY-MM-DD.
 */
function parseAutoDate(str: string): string {
  const s = str.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const parts = s.split("/");
    return `${parts[2]}-${parts[1]!.padStart(2, "0")}-${parts[0]!.padStart(2, "0")}`;
  }

  // DD-MM-YYYY (année 4 chiffres)
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) {
    const parts = s.split("-");
    return `${parts[2]}-${parts[1]!.padStart(2, "0")}-${parts[0]!.padStart(2, "0")}`;
  }

  // DD.MM.YYYY
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(s)) {
    const parts = s.split(".");
    return `${parts[2]}-${parts[1]!.padStart(2, "0")}-${parts[0]!.padStart(2, "0")}`;
  }

  // DD-Mon-YYYY (ex: 15-Jan-2024)
  if (/^\d{1,2}-[A-Za-z]{3}-\d{4}$/.test(s)) {
    const parts = s.split("-");
    const mm = MONTH_MAP[parts[1]!.toLowerCase().slice(0, 3)] ?? "01";
    return `${parts[2]}-${mm}-${parts[0]!.padStart(2, "0")}`;
  }

  return s;
}

function parseDateGeneric(str: string, format: ColumnMapping["dateFormat"]): string {
  // Si le format est auto-détecté (via parseAutoDate), déléguer
  return parseAutoDate(str);
}

// ---------------------------------------------------------------------------
// Parsing des montants — formats variés
// ---------------------------------------------------------------------------

/**
 * Parse un montant dans différents formats :
 * - "1 234,56" (FR)
 * - "1,234.56" (EN)
 * - "-50.00"
 * - "(50.00)" (comptable négatif)
 */
function parseAmountGeneric(raw: string): number {
  let s = raw.trim();

  // Format comptable (50.00) → -50.00
  const accountingMatch = /^\(([^)]+)\)$/.exec(s);
  if (accountingMatch) {
    s = `-${accountingMatch[1]!}`;
  }

  // Supprimer espaces et symboles monétaires
  s = s.replace(/\s/g, "").replace(/[€$£]/g, "");

  // Détecter format FR : virgule comme décimale, point/espace comme milliers
  // Ex: "1 234,56" après trim/remove-space → "1234,56"
  // Ex: "1.234,56" → "1234.56"
  if (/^\-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
    // "1.234,56" → supprimer points milliers, remplacer virgule
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/,\d{1,2}$/.test(s) && !s.includes(".")) {
    // "1234,56" → "1234.56"
    s = s.replace(",", ".");
  } else if (/,\d{3}/.test(s) && /\.\d{2}$/.test(s)) {
    // "1,234.56" (EN) → supprimer virgule milliers
    s = s.replace(",", "");
  } else {
    // Fallback : supprimer toute virgule et remplacer par point
    s = s.replace(",", ".");
  }

  return parseFloat(s);
}

// ---------------------------------------------------------------------------
// Splitting CSV avec gestion des guillemets
// ---------------------------------------------------------------------------

function splitCsvLine(line: string, sep: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i]!;
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === sep && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ---------------------------------------------------------------------------
// Parsing principal par index de colonnes (auto-détecté)
// ---------------------------------------------------------------------------

function parseByColumnIndex(
  lines: string[],
  sep: string,
  dateIdx: number,
  amountIdx: number,
  labelIdx: number,
): ParseResult["transactions"] {
  const transactions: ParseResult["transactions"] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]!, sep);

    const rawDate = dateIdx >= 0 ? (cells[dateIdx] ?? "") : "";
    const description = labelIdx >= 0 ? (cells[labelIdx] ?? "") : "";

    if (!rawDate || !description) continue;

    const date = parseAutoDate(rawDate);
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) continue;

    const rawAmount = amountIdx >= 0 ? (cells[amountIdx] ?? "") : "";
    if (!rawAmount) continue;

    const parsed = parseAmountGeneric(rawAmount);
    if (isNaN(parsed) || parsed === 0) continue;

    const amount = Math.abs(parsed);
    const type: "income" | "expense" = parsed < 0 ? "expense" : "income";

    transactions.push({ date, description, amount, type });
  }

  return transactions;
}

// ---------------------------------------------------------------------------
// Parsing par colonnes débit/crédit séparées
// ---------------------------------------------------------------------------

function parseByDebitCredit(
  lines: string[],
  sep: string,
  dateIdx: number,
  debitIdx: number,
  creditIdx: number,
  labelIdx: number,
): ParseResult["transactions"] {
  const transactions: ParseResult["transactions"] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]!, sep);

    const rawDate = dateIdx >= 0 ? (cells[dateIdx] ?? "") : "";
    const description = labelIdx >= 0 ? (cells[labelIdx] ?? "") : "";

    if (!rawDate || !description) continue;

    const date = parseAutoDate(rawDate);
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) continue;

    const rawDebit = debitIdx >= 0 ? (cells[debitIdx] ?? "").trim() : "";
    const rawCredit = creditIdx >= 0 ? (cells[creditIdx] ?? "").trim() : "";

    let amount: number;
    let type: "income" | "expense";

    if (rawDebit) {
      const debit = parseAmountGeneric(rawDebit);
      if (isNaN(debit) || debit === 0) continue;
      amount = Math.abs(debit);
      type = "expense";
    } else if (rawCredit) {
      const credit = parseAmountGeneric(rawCredit);
      if (isNaN(credit) || credit === 0) continue;
      amount = Math.abs(credit);
      type = "income";
    } else {
      continue;
    }

    transactions.push({ date, description, amount, type });
  }

  return transactions;
}

// ---------------------------------------------------------------------------
// Parser principal
// ---------------------------------------------------------------------------

export const genericCsvParser: GenericCsvParserType = {
  name: "CSV générique",

  canHandle(filename: string): boolean {
    return filename.toLowerCase().endsWith(".csv");
  },

  /**
   * Parse automatiquement si confidence >= 70.
   * Sinon retourne transactions=[] avec suggestedMapping.
   */
  parse(content: string | null, _buffer: Buffer | null): ParseResult {
    const emptyResult: ParseResult = {
      transactions: [],
      detectedBalance: null,
      detectedBalanceDate: null,
      bankName: "CSV générique",
      currency: "EUR",
    };

    if (!content || !content.trim()) return emptyResult;

    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return emptyResult;

    const firstLine = lines[0]!;
    const sep = detectSeparator(firstLine);
    const headers = splitCsvLine(firstLine, sep);

    // Construire preview (premières lignes de données)
    const preview: string[][] = [];
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      preview.push(splitCsvLine(lines[i]!, sep));
    }

    const score = detectColumns(headers, preview);

    if (score.confidence >= 70) {
      let transactions: ParseResult["transactions"];
      if (score.debitCol >= 0 && score.creditCol >= 0) {
        transactions = parseByDebitCredit(
          lines,
          sep,
          score.dateCol,
          score.debitCol,
          score.creditCol,
          score.labelCol,
        );
      } else {
        transactions = parseByColumnIndex(
          lines,
          sep,
          score.dateCol,
          score.amountCol,
          score.labelCol,
        );
      }
      return {
        transactions,
        detectedBalance: null,
        detectedBalanceDate: null,
        bankName: "CSV auto-détecté",
        currency: "EUR",
      };
    }

    // Confidence insuffisante : retourner suggestedMapping
    const suggestedMapping: SuggestedMapping = {
      dateCol: score.dateCol,
      amountCol: score.amountCol,
      labelCol: score.labelCol,
      confidence: score.confidence,
      ...(score.debitCol >= 0 ? { debitCol: score.debitCol } : {}),
      ...(score.creditCol >= 0 ? { creditCol: score.creditCol } : {}),
    };

    return {
      ...emptyResult,
      suggestedMapping,
    };
  },

  detectHeaders(content: string): { headers: string[]; preview: string[][]; fingerprint: string } {
    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length === 0) return { headers: [], preview: [], fingerprint: "empty" };

    const firstLine = lines[0]!;
    const sep = detectSeparator(firstLine);
    const headers = splitCsvLine(firstLine, sep);

    const preview: string[][] = [];
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      preview.push(splitCsvLine(lines[i]!, sep));
    }

    return { headers, preview, fingerprint: computeFingerprint(headers) };
  },

  parseWithMapping(content: string, mapping: ColumnMapping): ParseResult {
    const lines = content.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "CSV générique", currency: "EUR" };
    }

    const sep = mapping.separator;
    const rawHeaders = splitCsvLine(lines[0]!, sep);
    const colIdx = (col: string) => rawHeaders.indexOf(col);

    const dateIdx = colIdx(mapping.dateColumn);
    const descIdx = colIdx(mapping.descriptionColumn);
    const amountIdx = mapping.amountColumn ? colIdx(mapping.amountColumn) : -1;
    const debitIdx = mapping.debitColumn ? colIdx(mapping.debitColumn) : -1;
    const creditIdx = mapping.creditColumn ? colIdx(mapping.creditColumn) : -1;

    const transactions: ParseResult["transactions"] = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = splitCsvLine(lines[i]!, sep);

      const rawDate = dateIdx >= 0 ? (cells[dateIdx] ?? "") : "";
      const description = descIdx >= 0 ? (cells[descIdx] ?? "") : "";

      if (!rawDate || !description) continue;

      const date = parseDateGeneric(rawDate, mapping.dateFormat);

      let amount: number;
      let type: "income" | "expense";

      if (amountIdx >= 0) {
        const rawAmount = cells[amountIdx] ?? "";
        const parsed = parseAmountGeneric(rawAmount);
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
