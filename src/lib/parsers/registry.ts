import { banquePopulaireParser } from "./banque-populaire";
import { bnpParser } from "./bnp-paribas";
import { caisseEpargneParser } from "./caisse-epargne";
import { creditAgricoleParser } from "./credit-agricole";
import { mcbCsvParser } from "./mcb-csv";
import { mcbPdfParser } from "./mcb-pdf";
import { n26Parser } from "./n26";
import { revolutParser } from "./revolut";
import { societeGeneraleParser } from "./societe-generale";
import { wiseParser } from "./wise";
import type { BankParser, ParseResult } from "./types";

const parsers: BankParser[] = [
  mcbPdfParser,              // PDF en premier (extension spécifique)
  revolutParser,             // XLSX en second
  mcbCsvParser,              // MCB CSV
  n26Parser,                 // N26 : "Payee" + "Transaction type" + "Amount"
  wiseParser,                // Wise : "TransferWise ID"
  caisseEpargneParser,       // Caisse d'Épargne : "Numéro" + "Date opération"
  societeGeneraleParser,     // Société Générale : "Référence" + "Débit euros" (avant CA)
  creditAgricoleParser,      // Crédit Agricole : "Débit euros" (plus générique, après SG)
  bnpParser,                 // BNP Paribas : "Libellé simplifié" ou "Montant en euros"
  banquePopulaireParser,     // Fallback BP / CSV générique
];

export async function detectAndParseFile(
  filename: string,
  content: string | null,
  buffer: Buffer | null
): Promise<ParseResult> {
  for (const parser of parsers) {
    if (parser.canHandle(filename, content ?? undefined, buffer ?? undefined)) {
      return await parser.parse(content, buffer);
    }
  }
  // Fallback
  return await banquePopulaireParser.parse(content, buffer);
}

export { parsers };
