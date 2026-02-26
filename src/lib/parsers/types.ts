export interface ParsedTransaction {
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // positive = income, negative = expense
  type: "income" | "expense";
}

export interface SuggestedMapping {
  dateCol: number;
  amountCol: number;
  labelCol: number;
  confidence: number;
  debitCol?: number;
  creditCol?: number;
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  detectedBalance: number | null;
  detectedBalanceDate: string | null;
  bankName: string;
  currency: string;
  /** Présent quand le parser générique CSV n'a pas pu détecter les colonnes avec assurance (confidence < 70) */
  suggestedMapping?: SuggestedMapping;
}

export interface BankParser {
  name: string;
  /** Retourne true si ce parser peut traiter ce fichier */
  canHandle(filename: string, content?: string, buffer?: Buffer): boolean;
  /** Parse le fichier et retourne les transactions */
  parse(content: string | null, buffer: Buffer | null): ParseResult | Promise<ParseResult>;
}
