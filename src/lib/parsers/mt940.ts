import type { BankParser, ParseResult, ParsedTransaction } from "./types";

// ─── Utilitaires de parsing MT940 ────────────────────────────────────────────

/**
 * Convertit une date MT940 au format YYMMDD → YYYY-MM-DD
 * Ex: "240115" → "2024-01-15"
 */
function parseMt940Date(yymmdd: string): string | null {
  if (yymmdd.length !== 6) return null;
  const year = parseInt(yymmdd.substring(0, 2), 10);
  const month = yymmdd.substring(2, 4);
  const day = yymmdd.substring(4, 6);

  if (isNaN(year)) return null;

  // Heuristique : années 00–29 → 2000–2029, 30–99 → 1930–1999
  const fullYear = year < 30 ? 2000 + year : 1900 + year;

  return `${fullYear}-${month}-${day}`;
}

/**
 * Convertit un montant MT940 (virgule décimale) en nombre flottant
 * Ex: "50,00" → 50.00 | "1 234,56" → 1234.56
 */
function parseMt940Amount(raw: string): number | null {
  // Supprimer les espaces milliers, remplacer virgule par point
  const normalized = raw.replace(/\s/g, "").replace(",", ".");
  const value = parseFloat(normalized);
  return isNaN(value) ? null : value;
}

/**
 * Extrait la devise depuis un champ solde MT940 (ex: "C240101EUR1500,00")
 * Cherche 3 lettres majuscules après YYMMDD (6 chiffres)
 */
function extractCurrency(balanceField: string): string | null {
  // Format: [C|D]YYMMDDISOAMT → iso est 3 lettres
  const match = /^[CD]\d{6}([A-Z]{3})/.exec(balanceField);
  return match ? match[1] : null;
}

// ─── Parsing du solde (:60F:, :62F:, :62M:) ──────────────────────────────────

interface BalanceParseResult {
  balance: number | null;
  balanceDate: string | null;
  currency: string | null;
}

/**
 * Parse un champ solde MT940.
 * Format : [C|D]YYMMDDCCCAMOUNT
 * Ex: "C240120EUR1600,00"
 */
function parseBalanceField(field: string): BalanceParseResult {
  const trimmed = field.trim();
  if (!trimmed) return { balance: null, balanceDate: null, currency: null };

  // Premier caractère : C (crédit) ou D (débit)
  const sign = trimmed[0];
  if (sign !== "C" && sign !== "D") {
    return { balance: null, balanceDate: null, currency: null };
  }

  // Caractères 1-6 : date YYMMDD
  const dateStr = trimmed.substring(1, 7);
  const balanceDate = parseMt940Date(dateStr);

  // Caractères 7-9 : devise ISO (3 lettres)
  const currency = trimmed.substring(7, 10);

  // Reste : montant
  const amountRaw = trimmed.substring(10);
  const amountAbs = parseMt940Amount(amountRaw);

  if (amountAbs === null || !balanceDate) {
    return { balance: null, balanceDate: null, currency: currency || null };
  }

  const balance = sign === "D" ? -amountAbs : amountAbs;

  return { balance, balanceDate, currency };
}

// ─── Parsing de la ligne transaction (:61:) ───────────────────────────────────

interface StatementLineResult {
  date: string | null;
  amount: number | null;
  type: "income" | "expense" | null;
}

/**
 * Parse une ligne de transaction MT940 (:61: field value).
 * Format : YYMMDD[MMDD][C|D|RC|RD]AMOUNT[NTYPEReference]
 *
 * - Les 6 premiers chiffres = date de valeur (YYMMDD)
 * - Les 4 suivants (optionnels) = date de comptabilisation (MMDD)
 * - Ensuite : sens (DR/D/CR/C/RD/RC) — les variantes R signifient "reverse"
 * - Ensuite : montant (virgule décimale)
 * - Ensuite : type de transaction (4 chars) + référence — ignorés
 *
 * Ex: "2401150115DR50,00NTRFNONREF"
 */
function parseStatementLine(line: string): StatementLineResult {
  const empty: StatementLineResult = { date: null, amount: null, type: null };
  const trimmed = line.trim();
  if (!trimmed || trimmed.length < 10) return empty;

  // Date de valeur : 6 premiers chiffres
  const datePart = trimmed.substring(0, 6);
  if (!/^\d{6}$/.test(datePart)) return empty;
  const date = parseMt940Date(datePart);
  if (!date) return empty;

  let rest = trimmed.substring(6);

  // Optionnel : date de comptabilisation (4 chiffres MMDD)
  if (/^\d{4}/.test(rest)) {
    rest = rest.substring(4);
  }

  // Sens : DR, D, CR, C, RD, RC
  let isDebit: boolean;
  if (rest.startsWith("DR") || rest.startsWith("RD")) {
    isDebit = true;
    rest = rest.startsWith("DR") ? rest.substring(2) : rest.substring(2);
  } else if (rest.startsWith("CR") || rest.startsWith("RC")) {
    isDebit = false;
    rest = rest.startsWith("CR") ? rest.substring(2) : rest.substring(2);
  } else if (rest.startsWith("D")) {
    isDebit = true;
    rest = rest.substring(1);
  } else if (rest.startsWith("C")) {
    isDebit = false;
    rest = rest.substring(1);
  } else {
    return empty;
  }

  // Montant : tout ce qui précède les lettres du type de transaction
  // Le montant s'arrête à la première lettre majuscule (type NTRF, etc.)
  const amountMatch = /^([\d,\s]+)/.exec(rest);
  if (!amountMatch) return empty;

  const amountAbs = parseMt940Amount(amountMatch[1]);
  if (amountAbs === null) return empty;

  const amount = isDebit ? -amountAbs : amountAbs;
  const type: "income" | "expense" = isDebit ? "expense" : "income";

  return { date, amount, type };
}

// ─── Extraction des champs balisés MT940 ─────────────────────────────────────

interface Mt940Field {
  tag: string;
  value: string;
}

/**
 * Extrait tous les champs balisés d'un message MT940.
 * Chaque champ commence par :XX: ou :XXX: et se termine au prochain champ.
 * Gère les valeurs multi-lignes.
 */
function extractMt940Fields(content: string): Mt940Field[] {
  const fields: Mt940Field[] = [];
  // Regex pour capturer :TAG: et tout ce qui suit jusqu'au prochain :TAG:
  const tagRegex = /:([0-9A-Z]{2,3}):([\s\S]*?)(?=:[0-9A-Z]{2,3}:|$)/g;

  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(content)) !== null) {
    const tag = match[1].trim();
    const value = match[2].trim();
    if (tag && value) {
      fields.push({ tag, value });
    }
  }

  return fields;
}

// ─── Parser principal MT940 ───────────────────────────────────────────────────

function parseMt940Content(content: string): ParseResult {
  const transactions: ParsedTransaction[] = [];
  let currency = "EUR";
  let detectedBalance: number | null = null;
  let detectedBalanceDate: string | null = null;

  const fields = extractMt940Fields(content);

  // Première passe : extraire devise depuis :60F: ou :62F:
  for (const field of fields) {
    if (field.tag === "60F" || field.tag === "60M") {
      const curr = extractCurrency(field.value);
      if (curr) currency = curr;
      break;
    }
  }

  // Deuxième passe : extraire solde de clôture depuis :62F: ou :62M:
  for (const field of fields) {
    if ((field.tag === "62F" || field.tag === "62M") && detectedBalance === null) {
      const balResult = parseBalanceField(field.value);
      if (balResult.balance !== null) {
        detectedBalance = balResult.balance;
        detectedBalanceDate = balResult.balanceDate;
        if (balResult.currency) currency = balResult.currency;
      }
    }
  }

  // Troisième passe : extraire les transactions (:61: + :86: suivant)
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];

    if (field.tag !== "61") continue;

    const lineResult = parseStatementLine(field.value);
    if (lineResult.date === null || lineResult.amount === null || lineResult.type === null) {
      continue;
    }

    // Chercher le :86: suivant immédiatement pour la description
    let description = "";
    if (i + 1 < fields.length && fields[i + 1].tag === "86") {
      description = fields[i + 1].value.trim();
    }

    // Description par défaut si :86: absent
    if (!description) {
      description = `Transaction ${lineResult.type} ${Math.abs(lineResult.amount)}`;
    }

    transactions.push({
      date: lineResult.date,
      description,
      amount: lineResult.amount,
      type: lineResult.type,
    });
  }

  return {
    transactions,
    detectedBalance,
    detectedBalanceDate,
    bankName: "MT940 (SWIFT)",
    currency,
  };
}

// ─── Export du parser ─────────────────────────────────────────────────────────

export const mt940Parser: BankParser = {
  name: "MT940 (SWIFT)",

  canHandle(filename: string, content?: string): boolean {
    const lowerFilename = filename.toLowerCase();

    // Détection par extension (.sta ou .mt940)
    if (lowerFilename.endsWith(".sta") || lowerFilename.endsWith(".mt940")) {
      return true;
    }

    // Détection par contenu : présence de :20: ET :61: (marqueurs obligatoires MT940)
    if (content && content.includes(":20:") && content.includes(":61:")) {
      return true;
    }

    return false;
  },

  parse(content: string | null, _buffer: Buffer | null): ParseResult {
    if (!content || content.trim() === "") {
      return {
        transactions: [],
        detectedBalance: null,
        detectedBalanceDate: null,
        bankName: "MT940 (SWIFT)",
        currency: "EUR",
      };
    }

    try {
      return parseMt940Content(content);
    } catch {
      // Résistance aux fichiers malformés — retourne résultat vide sans crash
      return {
        transactions: [],
        detectedBalance: null,
        detectedBalanceDate: null,
        bankName: "MT940 (SWIFT)",
        currency: "EUR",
      };
    }
  },
};
