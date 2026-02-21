import { banquePopulaireParser } from "./banque-populaire";
import { creditAgricoleParser } from "./credit-agricole";
import { mcbCsvParser } from "./mcb-csv";
import { mcbPdfParser } from "./mcb-pdf";
import { revolutParser } from "./revolut";
import type { BankParser, ParseResult } from "./types";

const parsers: BankParser[] = [
  mcbPdfParser,           // PDF en premier (extension spécifique)
  revolutParser,          // XLSX en second
  mcbCsvParser,           // MCB CSV
  creditAgricoleParser,   // Crédit Agricole CSV (avant BP car headers distincts)
  banquePopulaireParser,  // Fallback BP / CSV générique
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
