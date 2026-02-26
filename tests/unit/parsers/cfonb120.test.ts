import { describe, it, expect } from "vitest";
import { cfonb120Parser } from "@/lib/parsers/cfonb120";
import type { ParseResult } from "@/lib/parsers/types";

// ─── Helpers pour construire des lignes CFONB 120 ─────────────────────────────

/**
 * Construit une ligne CFONB 120 de longueur exactement 120 caractères.
 * Le padding se fait avec des espaces.
 */
function padLine(s: string): string {
  if (s.length >= 120) return s.slice(0, 120);
  return s + " ".repeat(120 - s.length);
}

/**
 * Construit une ligne de mouvement (code 04) au format CFONB 120.
 *
 * Positions (1-indexed) :
 *   1-2   : code enregistrement ("04")
 *   3-7   : code banque (5 chars)
 *   8-14  : code guichet (7 chars)
 *   15-26 : numéro de compte (12 chars)
 *   27-29 : code opération (3 chars)
 *   30-37 : date opération JJMMAAAA (8 chars)
 *   38-45 : date valeur  JJMMAAAA (8 chars)
 *   46-54 : code interne (9 chars)
 *   55-79 : libellé (25 chars)
 *   80-94 : montant en centimes (15 digits), signe '+' ou '-' en position 95
 *   95    : signe du montant ('+' crédit / '-' débit)
 *   96-104: référence (9 chars)
 *   105-108: indice rejet (4 chars)
 *   109-120: réservé (12 chars)
 *
 * NOTE : Cette implémentation utilise une convention simplifiée pour les tests :
 *   - montant = positions 80-94 (15 chars, chiffres)
 *   - signe   = position 95 ('+' ou '-')
 */
function buildLine04(
  bankCode: string,       // 5 chars
  guichet: string,        // 7 chars
  account: string,        // 12 chars
  codeOp: string,         // 3 chars
  dateOp: string,         // JJMMAAAA
  dateVal: string,        // JJMMAAAA
  label: string,          // 25 chars max
  amountCentimes: number, // valeur absolue en centimes
  sign: "+" | "-"         // '+' crédit / '-' débit
): string {
  const code = "04";
  const bank = bankCode.padEnd(5, " ").slice(0, 5);
  const gui = guichet.padEnd(7, " ").slice(0, 7);
  const acc = account.padEnd(12, " ").slice(0, 12);
  const op = codeOp.padEnd(3, " ").slice(0, 3);
  const dop = dateOp.slice(0, 8);
  const dval = dateVal.slice(0, 8);
  const codeInternal = "         "; // 9 espaces
  const lib = label.padEnd(25, " ").slice(0, 25);
  const amt = String(amountCentimes).padStart(15, "0");
  const ref = "         "; // 9 espaces
  const reject = "    ";    // 4 espaces
  const reserved = "            "; // 12 espaces

  const raw =
    code + bank + gui + acc + op + dop + dval + codeInternal + lib + amt + sign + ref + reject + reserved;

  return padLine(raw);
}

/**
 * Construit une ligne de solde (code 07) au format CFONB 120.
 * Zone montant identique à la ligne 04.
 */
function buildLine07(
  bankCode: string,
  guichet: string,
  account: string,
  date: string,
  amountCentimes: number,
  sign: "+" | "-"
): string {
  const code = "07";
  const bank = bankCode.padEnd(5, " ").slice(0, 5);
  const gui = guichet.padEnd(7, " ").slice(0, 7);
  const acc = account.padEnd(12, " ").slice(0, 12);
  const op = "   "; // 3 espaces
  const dop = date.slice(0, 8);
  const dval = date.slice(0, 8);
  const codeInternal = "         "; // 9 espaces
  const lib = "SOLDE                    "; // 25 chars
  const amt = String(amountCentimes).padStart(15, "0");
  const ref = "         ";
  const reject = "    ";
  const reserved = "            ";

  const raw =
    code + bank + gui + acc + op + dop + dval + codeInternal + lib + amt + sign + ref + reject + reserved;

  return padLine(raw);
}

/**
 * Construit une ligne d'en-tête (code 01) au format CFONB 120.
 */
function buildLine01(bankCode: string, guichet: string, account: string): string {
  const code = "01";
  const bank = bankCode.padEnd(5, " ").slice(0, 5);
  const gui = guichet.padEnd(7, " ").slice(0, 7);
  const acc = account.padEnd(12, " ").slice(0, 12);
  const rest = " ".repeat(120 - 2 - 5 - 7 - 12);
  return padLine(code + bank + gui + acc + rest);
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

// Fichier CFONB complet avec en-tête, 2 mouvements, solde
const BANK = "30004";
const GUI = "0000014";
const ACC = "123456789012";

const LINE_01 = buildLine01(BANK, GUI, ACC);
const LINE_04_CREDIT = buildLine04(BANK, GUI, ACC, "VIR", "01012024", "01012024", "SALAIRE JANVIER 2024", 15000, "+");
const LINE_04_DEBIT = buildLine04(BANK, GUI, ACC, "CHQ", "05012024", "05012024", "FACTURE EDF", 5000, "-");
const LINE_07 = buildLine07(BANK, GUI, ACC, "31012024", 145000, "+");

const CFONB_FULL = [LINE_01, LINE_04_CREDIT, LINE_04_DEBIT, LINE_07].join("\n");

// Fichier avec seulement une transaction crédit
const CFONB_CREDIT_ONLY = [LINE_04_CREDIT].join("\n");

// Fichier avec seulement une transaction débit
const CFONB_DEBIT_ONLY = [LINE_04_DEBIT].join("\n");

// Fichier malformé
const CFONB_MALFORMED = `This is not a valid CFONB file
random content here
nothing useful`;

// Fichier CSV normal pour canHandle false
const CSV_NORMAL = `Date;Libelle;Montant
2024-01-15;VIREMENT;100.00
2024-01-16;PRELEVEMENT;-50.00`;

// Fichier XML pour canHandle false
const XML_NORMAL = `<?xml version="1.0"?><root><data>test</data></root>`;

// ─── TU-122-1 : canHandle ─────────────────────────────────────────────────────

describe("TU-122-1 — cfonb120Parser.canHandle : détection correcte", () => {
  it("retourne true pour extension .cfonb", () => {
    expect(cfonb120Parser.canHandle("releve.cfonb")).toBe(true);
  });

  it("retourne true pour extension .CFONB (majuscules)", () => {
    expect(cfonb120Parser.canHandle("RELEVE.CFONB")).toBe(true);
  });

  it("retourne true pour contenu avec lignes 120 chars et code 04", () => {
    expect(cfonb120Parser.canHandle("releve.txt", CFONB_FULL)).toBe(true);
  });

  it("retourne true pour contenu avec seulement une ligne 04 de 120 chars", () => {
    expect(cfonb120Parser.canHandle("export.txt", LINE_04_CREDIT)).toBe(true);
  });

  it("retourne false pour un CSV normal", () => {
    expect(cfonb120Parser.canHandle("releve.csv", CSV_NORMAL)).toBe(false);
  });

  it("retourne false pour un fichier XML", () => {
    expect(cfonb120Parser.canHandle("data.xml", XML_NORMAL)).toBe(false);
  });

  it("retourne false pour contenu malformé sans structure CFONB", () => {
    expect(cfonb120Parser.canHandle("notes.txt", CFONB_MALFORMED)).toBe(false);
  });

  it("retourne false pour extension .csv même avec contenu CFONB valide", () => {
    // L'extension CSV prime si le contenu n'est pas forcément CFONB
    expect(cfonb120Parser.canHandle("releve.csv", LINE_04_CREDIT)).toBe(false);
  });
});

// ─── TU-122-2 : parse transaction crédit ─────────────────────────────────────

describe("TU-122-2 — parse transaction crédit (SALAIRE)", () => {
  it("amount = 150.00 pour montant 15000 centimes avec signe +", () => {
    const result = cfonb120Parser.parse(CFONB_CREDIT_ONLY, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].amount).toBe(150.00);
  });

  it("type = income pour signe +", () => {
    const result = cfonb120Parser.parse(CFONB_CREDIT_ONLY, null) as ParseResult;
    expect(result.transactions[0].type).toBe("income");
  });

  it("parse le fichier complet avec 2 transactions", () => {
    const result = cfonb120Parser.parse(CFONB_FULL, null) as ParseResult;
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0]).toMatchObject({
      amount: 150.00,
      type: "income",
    });
  });
});

// ─── TU-122-3 : parse transaction débit ──────────────────────────────────────

describe("TU-122-3 — parse transaction débit (FACTURE)", () => {
  it("amount = -50.00 pour montant 5000 centimes avec signe -", () => {
    const result = cfonb120Parser.parse(CFONB_DEBIT_ONLY, null) as ParseResult;
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].amount).toBe(-50.00);
  });

  it("type = expense pour signe -", () => {
    const result = cfonb120Parser.parse(CFONB_DEBIT_ONLY, null) as ParseResult;
    expect(result.transactions[0].type).toBe("expense");
  });

  it("parse la transaction débit depuis le fichier complet", () => {
    const result = cfonb120Parser.parse(CFONB_FULL, null) as ParseResult;
    expect(result.transactions[1]).toMatchObject({
      amount: -50.00,
      type: "expense",
    });
  });
});

// ─── TU-122-4 : parse le libellé ─────────────────────────────────────────────

describe("TU-122-4 — parse le libellé (positions 55-79, trimé)", () => {
  it("extrait le libellé 'SALAIRE JANVIER 2024' depuis la ligne crédit", () => {
    const result = cfonb120Parser.parse(CFONB_CREDIT_ONLY, null) as ParseResult;
    expect(result.transactions[0].description).toBe("SALAIRE JANVIER 2024");
  });

  it("extrait le libellé 'FACTURE EDF' depuis la ligne débit", () => {
    const result = cfonb120Parser.parse(CFONB_DEBIT_ONLY, null) as ParseResult;
    expect(result.transactions[0].description).toBe("FACTURE EDF");
  });

  it("le libellé est trimé (pas d'espaces superflus)", () => {
    const result = cfonb120Parser.parse(CFONB_CREDIT_ONLY, null) as ParseResult;
    expect(result.transactions[0].description).toBe(
      result.transactions[0].description.trim()
    );
  });
});

// ─── TU-122-5 : parse la date (JJMMAAAA → ISO YYYY-MM-DD) ───────────────────

describe("TU-122-5 — parse la date (JJMMAAAA → YYYY-MM-DD)", () => {
  it("convertit 01012024 en 2024-01-01", () => {
    const result = cfonb120Parser.parse(CFONB_CREDIT_ONLY, null) as ParseResult;
    expect(result.transactions[0].date).toBe("2024-01-01");
  });

  it("convertit 05012024 en 2024-01-05", () => {
    const result = cfonb120Parser.parse(CFONB_DEBIT_ONLY, null) as ParseResult;
    expect(result.transactions[0].date).toBe("2024-01-05");
  });

  it("la date est au format YYYY-MM-DD (regex)", () => {
    const result = cfonb120Parser.parse(CFONB_FULL, null) as ParseResult;
    for (const tx of result.transactions) {
      expect(tx.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

// ─── TU-122-6 : parse le solde depuis ligne 07 ───────────────────────────────

describe("TU-122-6 — parse le solde depuis ligne code 07", () => {
  it("extrait detectedBalance = 1450.00 depuis ligne 07 (145000 centimes)", () => {
    const result = cfonb120Parser.parse(CFONB_FULL, null) as ParseResult;
    expect(result.detectedBalance).toBe(1450.00);
  });

  it("retourne null pour detectedBalance si pas de ligne 07", () => {
    const result = cfonb120Parser.parse(CFONB_CREDIT_ONLY, null) as ParseResult;
    expect(result.detectedBalance).toBeNull();
  });

  it("extrait la date du solde depuis la ligne 07", () => {
    const result = cfonb120Parser.parse(CFONB_FULL, null) as ParseResult;
    expect(result.detectedBalanceDate).toBe("2024-01-31");
  });
});

// ─── TU-122-7 : fichier malformé → tableau vide ──────────────────────────────

describe("TU-122-7 — fichier malformé → tableau vide, pas de crash", () => {
  it("retourne un tableau vide pour un contenu non-CFONB", () => {
    const result = cfonb120Parser.parse(CFONB_MALFORMED, null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
  });

  it("retourne null pour detectedBalance si pas de structure CFONB", () => {
    const result = cfonb120Parser.parse(CFONB_MALFORMED, null) as ParseResult;
    expect(result.detectedBalance).toBeNull();
  });

  it("retourne un tableau vide pour contenu null (pas de crash)", () => {
    const result = cfonb120Parser.parse(null, null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
  });

  it("retourne un tableau vide pour contenu vide string (pas de crash)", () => {
    const result = cfonb120Parser.parse("", null) as ParseResult;
    expect(result.transactions).toHaveLength(0);
  });

  it("bankName = 'CFONB 120'", () => {
    const result = cfonb120Parser.parse(CFONB_FULL, null) as ParseResult;
    expect(result.bankName).toBe("CFONB 120");
  });

  it("currency = 'EUR'", () => {
    const result = cfonb120Parser.parse(CFONB_FULL, null) as ParseResult;
    expect(result.currency).toBe("EUR");
  });
});

// ─── Tests supplémentaires : solde négatif ───────────────────────────────────

describe("Solde négatif (ligne 07 avec signe -)", () => {
  it("solde négatif si signe - dans ligne 07", () => {
    const line07Neg = buildLine07(BANK, GUI, ACC, "31012024", 50000, "-");
    const content = [LINE_04_DEBIT, line07Neg].join("\n");
    const result = cfonb120Parser.parse(content, null) as ParseResult;
    expect(result.detectedBalance).toBe(-500.00);
  });
});
