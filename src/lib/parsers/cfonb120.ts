import type { BankParser, ParseResult, ParsedTransaction } from "./types";

// ─── Constantes de structure CFONB 120 ──────────────────────────────────────
//
// Positions 0-indexed (slice) d'une ligne de 120 caractères.
//
// Code enregistrement : [0, 2)
// Code banque         : [2, 7)
// Code guichet        : [7, 14)
// Numéro de compte    : [14, 26)
// Code opération      : [26, 29)
// Date opération      : [29, 37)   → JJMMAAAA
// Date valeur         : [37, 45)   → JJMMAAAA
// Code interne        : [45, 54)
// Libellé             : [54, 79)   → 25 chars
// Montant en centimes : [79, 94)   → 15 digits
// Signe               : [94, 95)   → '+' crédit / '-' débit
// Référence           : [95, 104)
// Indice rejet        : [104, 108)
// Réservé             : [108, 120)

const CFONB_LINE_LENGTH = 120;

const POS = {
  code:       [0,  2]  as [number, number],
  dateOp:     [29, 37] as [number, number],
  label:      [54, 79] as [number, number],
  amountRaw:  [79, 94] as [number, number],
  sign:       [94, 95] as [number, number],
} as const;

// ─── Utilitaires ─────────────────────────────────────────────────────────────

/**
 * Extrait un champ d'une ligne CFONB 120 et le trim.
 */
function field(line: string, start: number, end: number): string {
  return line.slice(start, end).trim();
}

/**
 * Convertit une date CFONB (JJMMAAAA) en format ISO (AAAA-MM-JJ).
 * Retourne null si la date est invalide.
 */
function parseCfonbDate(raw: string): string | null {
  // raw = JJMMAAAA (8 chars)
  if (raw.length < 8) return null;
  const dd = raw.slice(0, 2);
  const mm = raw.slice(2, 4);
  const yyyy = raw.slice(4, 8);
  if (!dd || !mm || !yyyy) return null;
  if (isNaN(Number(dd)) || isNaN(Number(mm)) || isNaN(Number(yyyy))) return null;
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Convertit un montant CFONB (centimes en chaîne + signe) en nombre décimal.
 * - amountRaw  : 15 digits en centimes (ex: "000000000015000" → 15000 centimes)
 * - sign       : '+' ou '-'
 * Retourne le montant en euros (divise par 100).
 * Crédit (+) → valeur positive, Débit (-) → valeur négative.
 */
function parseCfonbAmount(amountRaw: string, sign: string): number | null {
  const digits = amountRaw.trim();
  if (!digits || digits.length === 0) return null;

  const centimes = parseInt(digits, 10);
  if (isNaN(centimes)) return null;

  const euros = centimes / 100;
  // Spec CFONB : '-' ou 'D' (Débit) → négatif ; '+' ou tout autre → positif
  return (sign === "-" || sign === "D") ? -euros : euros;
}

// ─── Parsing d'une ligne de mouvement (code 04) ───────────────────────────────

function parseLine04(line: string): ParsedTransaction | null {
  const dateRaw = field(line, POS.dateOp[0], POS.dateOp[1]);
  const date = parseCfonbDate(dateRaw);
  if (!date) return null;

  const labelRaw = field(line, POS.label[0], POS.label[1]);
  const description = labelRaw || "Transaction CFONB";

  const amountRaw = line.slice(POS.amountRaw[0], POS.amountRaw[1]);
  const sign = line.slice(POS.sign[0], POS.sign[1]);
  const amount = parseCfonbAmount(amountRaw, sign);
  if (amount === null) return null;

  const type: "income" | "expense" = amount >= 0 ? "income" : "expense";

  return { date, description, amount, type };
}

// ─── Parsing d'une ligne de solde (code 07) ───────────────────────────────────

interface BalanceResult {
  balance: number;
  balanceDate: string | null;
}

function parseLine07(line: string): BalanceResult | null {
  const dateRaw = field(line, POS.dateOp[0], POS.dateOp[1]);
  const balanceDate = parseCfonbDate(dateRaw);

  const amountRaw = line.slice(POS.amountRaw[0], POS.amountRaw[1]);
  const sign = line.slice(POS.sign[0], POS.sign[1]);
  const balance = parseCfonbAmount(amountRaw, sign);
  if (balance === null) return null;

  return { balance, balanceDate };
}

// ─── Parsing principal ────────────────────────────────────────────────────────

function parseCfonb120Content(content: string): ParseResult {
  const transactions: ParsedTransaction[] = [];
  let detectedBalance: number | null = null;
  let detectedBalanceDate: string | null = null;

  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    // Tolérance ±2 pour CR/LF éventuels non consommés
    const line = rawLine.replace(/\r/g, "");
    if (line.length < CFONB_LINE_LENGTH - 2 || line.length > CFONB_LINE_LENGTH + 2) {
      continue;
    }

    // Normaliser à exactement 120 chars (pad si nécessaire)
    const normalizedLine = line.length === CFONB_LINE_LENGTH
      ? line
      : line.padEnd(CFONB_LINE_LENGTH, " ").slice(0, CFONB_LINE_LENGTH);

    const recordCode = normalizedLine.slice(POS.code[0], POS.code[1]);

    if (recordCode === "04") {
      const tx = parseLine04(normalizedLine);
      if (tx) {
        transactions.push(tx);
      }
    } else if (recordCode === "07") {
      const balResult = parseLine07(normalizedLine);
      if (balResult !== null && detectedBalance === null) {
        detectedBalance = balResult.balance;
        detectedBalanceDate = balResult.balanceDate;
      }
    }
    // Les lignes 01 (en-tête) et autres codes sont ignorées
  }

  return {
    transactions,
    detectedBalance,
    detectedBalanceDate,
    bankName: "CFONB 120",
    currency: "EUR",
  };
}

// ─── Détection CFONB ─────────────────────────────────────────────────────────

/**
 * Vérifie si le contenu contient au moins une ligne de 120 chars
 * commençant par '04' ou '07' (structure CFONB 120).
 */
function contentIsCfonb120(content: string): boolean {
  const lines = content.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.replace(/\r/g, "");
    if (line.length >= 118 && line.length <= 122) {
      const code = line.slice(0, 2);
      if (code === "04" || code === "07" || code === "01") {
        return true;
      }
    }
  }
  return false;
}

// ─── Export du parser ─────────────────────────────────────────────────────────

export const cfonb120Parser: BankParser = {
  name: "CFONB 120",

  canHandle(filename: string, content?: string): boolean {
    const lower = filename.toLowerCase();

    // Extension .cfonb → priorité absolue
    if (lower.endsWith(".cfonb")) return true;

    // Pour les autres extensions, vérifier le contenu
    // Exclure explicitement les extensions incompatibles
    if (
      lower.endsWith(".csv") ||
      lower.endsWith(".xml") ||
      lower.endsWith(".xlsx") ||
      lower.endsWith(".xls") ||
      lower.endsWith(".ofx") ||
      lower.endsWith(".qfx") ||
      lower.endsWith(".sta") ||
      lower.endsWith(".mt940") ||
      lower.endsWith(".pdf")
    ) {
      return false;
    }

    if (!content) return false;

    return contentIsCfonb120(content);
  },

  parse(content: string | null, _buffer: Buffer | null): ParseResult {
    const empty: ParseResult = {
      transactions: [],
      detectedBalance: null,
      detectedBalanceDate: null,
      bankName: "CFONB 120",
      currency: "EUR",
    };

    if (!content) return empty;

    try {
      return parseCfonb120Content(content);
    } catch {
      // Résistance aux fichiers malformés
      return empty;
    }
  },
};
