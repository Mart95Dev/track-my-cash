import type { BankParser, ParseResult, ParsedTransaction } from "./types";

// ─── Utilitaires d'extraction XML par regex ───────────────────────────────────

/**
 * Extrait le contenu textuel d'une balise XML (sans attributs).
 * Supporte les balises simples : <Tag>contenu</Tag>
 */
function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}

/**
 * Extrait la valeur d'un attribut dans une balise.
 * Ex: extractAttribute('<Amt Ccy="EUR">50.00</Amt>', "Amt", "Ccy") → "EUR"
 */
function extractAttribute(xml: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"[^>]*>`, "i");
  const match = regex.exec(xml);
  return match ? match[1].trim() : null;
}

/**
 * Extrait tous les blocs délimités par <tag>...</tag> (non-imbriqués).
 * Pour les blocs potentiellement multi-lignes.
 */
function extractAllBlocks(xml: string, tag: string): string[] {
  const blocks: string[] = [];
  const openTag = `<${tag}`;
  const closeTag = `</${tag}>`;

  let startIdx = 0;
  while (true) {
    const openIdx = xml.indexOf(openTag, startIdx);
    if (openIdx === -1) break;

    // Trouver la fin du tag ouvrant (peut avoir des attributs)
    const openEnd = xml.indexOf(">", openIdx);
    if (openEnd === -1) break;

    const closeIdx = xml.indexOf(closeTag, openEnd);
    if (closeIdx === -1) break;

    blocks.push(xml.substring(openIdx, closeIdx + closeTag.length));
    startIdx = closeIdx + closeTag.length;
  }
  return blocks;
}

/**
 * Extrait le premier bloc délimité par <tag>...</tag>.
 */
function extractFirstBlock(xml: string, tag: string): string | null {
  const blocks = extractAllBlocks(xml, tag);
  return blocks.length > 0 ? blocks[0] : null;
}

// ─── Parsing d'une entrée <Ntry> ─────────────────────────────────────────────

interface NtryParseAttempt {
  transaction: ParsedTransaction | null;
  currency: string | null;
}

function parseNtry(ntryBlock: string): NtryParseAttempt {
  // Montant
  const amtRaw = extractTag(ntryBlock, "Amt");
  const currency = extractAttribute(ntryBlock, "Amt", "Ccy");

  if (!amtRaw) return { transaction: null, currency };

  const amountParsed = parseFloat(amtRaw);
  if (isNaN(amountParsed) || amountParsed === 0) return { transaction: null, currency };

  // Sens DBIT / CRDT
  const cdtDbtInd = extractTag(ntryBlock, "CdtDbtInd");
  if (!cdtDbtInd) return { transaction: null, currency };

  const isDebit = cdtDbtInd.toUpperCase() === "DBIT";
  const type: "income" | "expense" = isDebit ? "expense" : "income";
  const amount = Math.abs(amountParsed);

  // Date de comptabilisation depuis <BookgDt><Dt>
  const bookgDtBlock = extractFirstBlock(ntryBlock, "BookgDt");
  let date: string | null = null;
  if (bookgDtBlock) {
    date = extractTag(bookgDtBlock, "Dt");
  }
  if (!date) {
    // Fallback sur <ValDt><Dt>
    const valDtBlock = extractFirstBlock(ntryBlock, "ValDt");
    if (valDtBlock) {
      date = extractTag(valDtBlock, "Dt");
    }
  }
  if (!date) return { transaction: null, currency };

  // Libellé : priorité à <Ustrd> dans NtryDtls, sinon <AddtlNtryInf>
  let description = "";

  const ntryDtlsBlock = extractFirstBlock(ntryBlock, "NtryDtls");
  if (ntryDtlsBlock) {
    const txDtlsBlock = extractFirstBlock(ntryDtlsBlock, "TxDtls");
    if (txDtlsBlock) {
      const rmtInfBlock = extractFirstBlock(txDtlsBlock, "RmtInf");
      if (rmtInfBlock) {
        const ustrd = extractTag(rmtInfBlock, "Ustrd");
        if (ustrd) description = ustrd;
      }
    }
    if (!description) {
      // Essai direct dans NtryDtls
      const ustrd = extractTag(ntryDtlsBlock, "Ustrd");
      if (ustrd) description = ustrd;
    }
  }

  if (!description) {
    // Fallback sur AddtlNtryInf (info additionnelle de l'entrée)
    const addtl = extractTag(ntryBlock, "AddtlNtryInf");
    if (addtl) description = addtl;
  }

  if (!description) {
    description = `Transaction ${type} ${amount}`;
  }

  return {
    transaction: { date, description, amount, type },
    currency,
  };
}

// ─── Parsing du solde <Bal> ───────────────────────────────────────────────────

interface BalParseResult {
  balance: number | null;
  balanceDate: string | null;
}

function parseClbdBalance(stmtBlock: string): BalParseResult {
  const balBlocks = extractAllBlocks(stmtBlock, "Bal");

  for (const balBlock of balBlocks) {
    // Vérifier code CLBD
    const cdBlock = extractFirstBlock(balBlock, "CdOrPrtry");
    if (!cdBlock) continue;

    const code = extractTag(cdBlock, "Cd");
    if (!code || code.toUpperCase() !== "CLBD") continue;

    // Montant
    const amtRaw = extractTag(balBlock, "Amt");
    if (!amtRaw) continue;

    const balance = parseFloat(amtRaw);
    if (isNaN(balance)) continue;

    // Date du solde depuis <Dt><Dt>
    const dtBlock = extractFirstBlock(balBlock, "Dt");
    let balanceDate: string | null = null;
    if (dtBlock) {
      balanceDate = extractTag(dtBlock, "Dt");
    }

    return { balance, balanceDate };
  }

  return { balance: null, balanceDate: null };
}

// ─── Parser CAMT.053 principal ────────────────────────────────────────────────

function parseCamt053Content(content: string): ParseResult {
  const transactions: ParsedTransaction[] = [];
  let currency = "EUR";
  let detectedBalance: number | null = null;
  let detectedBalanceDate: string | null = null;

  // Extraire le bloc Stmt (peut contenir plusieurs dans un seul BkToCstmrStmt)
  const stmtBlocks = extractAllBlocks(content, "Stmt");

  for (const stmtBlock of stmtBlocks) {
    // Solde de clôture CLBD
    const balResult = parseClbdBalance(stmtBlock);
    if (balResult.balance !== null && detectedBalance === null) {
      detectedBalance = balResult.balance;
      detectedBalanceDate = balResult.balanceDate;
    }

    // Transactions Ntry
    const ntryBlocks = extractAllBlocks(stmtBlock, "Ntry");

    for (const ntryBlock of ntryBlocks) {
      const { transaction, currency: ntryCurrency } = parseNtry(ntryBlock);

      if (ntryCurrency) {
        currency = ntryCurrency;
      }

      if (transaction) {
        transactions.push(transaction);
      }
    }
  }

  return {
    transactions,
    detectedBalance,
    detectedBalanceDate,
    bankName: "CAMT.053 (ISO 20022)",
    currency,
  };
}

// ─── Export du parser ─────────────────────────────────────────────────────────

export const camt053Parser: BankParser = {
  name: "CAMT.053 (ISO 20022)",

  canHandle(filename: string, content?: string): boolean {
    // Vérification de l'extension
    if (!filename.toLowerCase().endsWith(".xml")) return false;

    if (!content) return false;

    // Détection par présence de la balise BkToCstmrStmt
    if (content.includes("BkToCstmrStmt")) return true;

    // Détection par présence du namespace CAMT.053
    if (content.includes("camt.053")) return true;

    return false;
  },

  parse(content: string | null, _buffer: Buffer | null): ParseResult {
    if (!content) {
      return {
        transactions: [],
        detectedBalance: null,
        detectedBalanceDate: null,
        bankName: "CAMT.053 (ISO 20022)",
        currency: "EUR",
      };
    }

    try {
      return parseCamt053Content(content);
    } catch {
      // Résistance aux fichiers malformés
      return {
        transactions: [],
        detectedBalance: null,
        detectedBalanceDate: null,
        bankName: "CAMT.053 (ISO 20022)",
        currency: "EUR",
      };
    }
  },
};
