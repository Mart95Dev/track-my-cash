import { banquePopulaireParser } from "./banque-populaire";
import { bnpParser } from "./bnp-paribas";
import { boursoramaParser } from "./boursorama";
import { caisseEpargneParser } from "./caisse-epargne";
import { camt053Parser } from "./camt053";
import { cfonb120Parser } from "./cfonb120";
import { creditAgricoleParser } from "./credit-agricole";
import { mt940Parser } from "./mt940";
import { ofxParser } from "./ofx";
import { genericCsvParser } from "./generic-csv";
import type { GenericParseResult } from "./generic-csv";
import { hsbcParser } from "./hsbc";
import { ingParser } from "./ing";
import { mcbCsvParser } from "./mcb-csv";
import { mcbPdfParser } from "./mcb-pdf";
import { monzoParser } from "./monzo";
import { n26Parser } from "./n26";
import { revolutParser } from "./revolut";
import { societeGeneraleParser } from "./societe-generale";
import { wiseParser } from "./wise";
import type { BankParser, ParseResult } from "./types";

const parsers: BankParser[] = [
  mcbPdfParser,              // PDF en premier (extension spécifique)
  revolutParser,             // XLSX en second
  camt053Parser,             // CAMT.053 XML ISO 20022 (avant parsers CSV)
  mt940Parser,               // MT940 SWIFT texte legacy (avant parsers CSV)
  ofxParser,                 // OFX/QFX (Open Financial Exchange v1 SGML + v2 XML)
  cfonb120Parser,            // CFONB 120 (format interbancaire français longueur fixe)
  mcbCsvParser,              // MCB CSV
  n26Parser,                 // N26 : "Payee" + "Transaction type" + "Amount"
  wiseParser,                // Wise : "TransferWise ID"
  hsbcParser,                // HSBC UK : "Date,Description,Amount"
  monzoParser,               // Monzo : "Transaction ID" + "Amount" + "Currency"
  boursoramaParser,          // Boursorama : "dateOp;dateVal;label"
  ingParser,                 // ING Direct : CSV tabulé "Date\tLibellé"
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
