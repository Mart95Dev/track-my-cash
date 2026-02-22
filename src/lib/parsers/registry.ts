import { banquePopulaireParser } from "./banque-populaire";
import { bnpParser } from "./bnp-paribas";
import { caisseEpargneParser } from "./caisse-epargne";
import { creditAgricoleParser } from "./credit-agricole";
import { genericCsvParser } from "./generic-csv";
import type { GenericParseResult } from "./generic-csv";
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
  banquePopulaireParser,     // Banque Populaire
  genericCsvParser,          // CSV générique — catch-all (doit être EN DERNIER)
];

export async function detectAndParseFile(
  filename: string,
  content: string | null,
  buffer: Buffer | null
): Promise<ParseResult | GenericParseResult> {
  for (const parser of parsers) {
    if (parser.canHandle(filename, content ?? undefined, buffer ?? undefined)) {
      if (parser.name === "CSV générique") {
        return { needsMapping: true as const, ...genericCsvParser.detectHeaders(content ?? "") };
      }
      return await parser.parse(content, buffer);
    }
  }
  // Aucun parser — retourne résultat vide
  return { transactions: [], detectedBalance: null, detectedBalanceDate: null, bankName: "Inconnu", currency: "EUR" };
}

export { parsers };
