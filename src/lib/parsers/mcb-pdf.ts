import { PDFParse } from "pdf-parse";
import type { BankParser, ParseResult, ParsedTransaction } from "./types";
import { parseFRAmount, parseDateFR } from "./utils";

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

export const mcbPdfParser: BankParser = {
  name: "MCB PDF",
  canHandle(filename) {
    return filename.toLowerCase().endsWith(".pdf");
  },
  async parse(_content, buffer) {
    if (!buffer) throw new Error("Buffer requis pour PDF");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text;
    if (!text || text.trim().length === 0) {
      throw new Error("Le PDF semble vide ou protégé par mot de passe.");
    }
    return parseMCBPdfText(text);
  },
};
