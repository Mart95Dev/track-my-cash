import type { BankParser, ParseResult, ParsedTransaction } from "./types";

// ─── Utilitaires de parsing OFX ───────────────────────────────────────────────

/**
 * Convertit une date OFX en ISO YYYY-MM-DD.
 * Formats supportés :
 *   - 20240115120000 → "2024-01-15"
 *   - 20240115       → "2024-01-15"
 */
function parseOfxDate(raw: string): string | null {
  const cleaned = raw.trim();
  if (cleaned.length < 8) return null;

  const year = cleaned.substring(0, 4);
  const month = cleaned.substring(4, 6);
  const day = cleaned.substring(6, 8);

  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day)) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Extrait la valeur textuelle d'une balise OFX (SGML ou XML).
 * Support les balises sans fermeture (SGML) et avec fermeture (XML).
 * Ex: <TRNAMT>-50.00</TRNAMT> → "-50.00"
 * Ex: <TRNAMT>-50.00\n<NEXT> → "-50.00" (SGML sans fermeture)
 */
function extractOfxTag(content: string, tag: string): string | null {
  // Tentative XML : balise avec fermeture
  const xmlRegex = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i");
  const xmlMatch = xmlRegex.exec(content);
  if (xmlMatch) {
    return xmlMatch[1].trim();
  }

  // Tentative SGML : valeur jusqu'au prochain < (sans balise de fermeture)
  const sgmlRegex = new RegExp(`<${tag}>([^<]+)`, "i");
  const sgmlMatch = sgmlRegex.exec(content);
  if (sgmlMatch) {
    return sgmlMatch[1].trim();
  }

  return null;
}

/**
 * Extrait tous les blocs <STMTTRN>...</STMTTRN> depuis le contenu OFX.
 * Gère les deux formats :
 *   - SGML : sans fermeture de balises internes, bloc délimité par </STMTTRN>
 *   - XML  : balises bien formées
 */
function extractStmtTrnBlocks(content: string): string[] {
  const blocks: string[] = [];
  const openTag = "<STMTTRN>";
  const closeTag = "</STMTTRN>";

  // Normaliser la casse pour la recherche (OFX est case-insensitive)
  const upperContent = content.toUpperCase();
  const upperOpen = openTag.toUpperCase();
  const upperClose = closeTag.toUpperCase();

  let startIdx = 0;
  while (true) {
    const openIdx = upperContent.indexOf(upperOpen, startIdx);
    if (openIdx === -1) break;

    const closeIdx = upperContent.indexOf(upperClose, openIdx + upperOpen.length);
    if (closeIdx === -1) break;

    // Extraire le bloc depuis le contenu original (préserve la casse des valeurs)
    blocks.push(content.substring(openIdx, closeIdx + closeTag.length));
    startIdx = closeIdx + closeTag.length;
  }

  return blocks;
}

/**
 * Parse un bloc <STMTTRN>...</STMTTRN> en ParsedTransaction.
 */
function parseStmtTrn(block: string): ParsedTransaction | null {
  // Montant
  const amtRaw = extractOfxTag(block, "TRNAMT");
  if (!amtRaw) return null;

  const amount = parseFloat(amtRaw.replace(",", "."));
  if (isNaN(amount)) return null;

  const type: "income" | "expense" = amount < 0 ? "expense" : "income";

  // Date depuis DTPOSTED
  const dateRaw = extractOfxTag(block, "DTPOSTED");
  if (!dateRaw) return null;

  const date = parseOfxDate(dateRaw);
  if (!date) return null;

  // Libellé : NAME + optionnel MEMO
  const name = extractOfxTag(block, "NAME");
  const memo = extractOfxTag(block, "MEMO");

  let description = name ?? "";
  if (memo && memo.trim()) {
    description = description ? `${description} — ${memo.trim()}` : memo.trim();
  }

  if (!description) {
    description = `Transaction ${type} ${Math.abs(amount)}`;
  }

  return { date, description, amount, type };
}

// ─── Parser principal OFX ─────────────────────────────────────────────────────

function parseOfxContent(content: string): ParseResult {
  const transactions: ParsedTransaction[] = [];
  let detectedBalance: number | null = null;
  let detectedBalanceDate: string | null = null;

  // Devise depuis CURDEF
  const curdefRaw = extractOfxTag(content, "CURDEF");
  const currency = curdefRaw && curdefRaw.length === 3 ? curdefRaw.toUpperCase() : "EUR";

  // Extraire tous les blocs STMTTRN
  const blocks = extractStmtTrnBlocks(content);
  for (const block of blocks) {
    const transaction = parseStmtTrn(block);
    if (transaction) {
      transactions.push(transaction);
    }
  }

  // Solde depuis LEDGERBAL > BALAMT
  // Extraire le bloc LEDGERBAL d'abord, puis BALAMT à l'intérieur
  const upperContent = content.toUpperCase();
  const ledgerOpenIdx = upperContent.indexOf("<LEDGERBAL>");
  const ledgerCloseIdx = upperContent.indexOf("</LEDGERBAL>");

  if (ledgerOpenIdx !== -1) {
    const endIdx = ledgerCloseIdx !== -1 ? ledgerCloseIdx + "</LEDGERBAL>".length : content.length;
    const ledgerBlock = content.substring(ledgerOpenIdx, endIdx);
    const balamtRaw = extractOfxTag(ledgerBlock, "BALAMT");
    if (balamtRaw) {
      const balance = parseFloat(balamtRaw.replace(",", "."));
      if (!isNaN(balance)) {
        detectedBalance = balance;
      }
    }

    // Date du solde depuis DTASOF
    const dtasofRaw = extractOfxTag(ledgerBlock, "DTASOF");
    if (dtasofRaw) {
      detectedBalanceDate = parseOfxDate(dtasofRaw);
    }
  }

  return {
    transactions,
    detectedBalance,
    detectedBalanceDate,
    bankName: "OFX/QFX",
    currency,
  };
}

// ─── Export du parser ─────────────────────────────────────────────────────────

export const ofxParser: BankParser = {
  name: "OFX/QFX",

  canHandle(filename: string, content?: string): boolean {
    const lowerFilename = filename.toLowerCase();

    // Détection par extension .ofx ou .qfx
    if (lowerFilename.endsWith(".ofx") || lowerFilename.endsWith(".qfx")) {
      return true;
    }

    // Détection par contenu : header SGML OFX v1
    if (content && content.includes("OFXHEADER")) {
      return true;
    }

    // Détection par contenu : balise <OFX> (XML OFX v2)
    if (content && /<OFX[\s>]/i.test(content)) {
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
        bankName: "OFX/QFX",
        currency: "EUR",
      };
    }

    try {
      return parseOfxContent(content);
    } catch {
      // Résistance aux fichiers malformés — retourne résultat vide sans crash
      return {
        transactions: [],
        detectedBalance: null,
        detectedBalanceDate: null,
        bankName: "OFX/QFX",
        currency: "EUR",
      };
    }
  },
};
