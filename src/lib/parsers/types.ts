export interface ParsedTransaction {
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // positive = income, negative = expense
  type: "income" | "expense";
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  detectedBalance: number | null;
  detectedBalanceDate: string | null;
  bankName: string;
  currency: string;
}

export interface BankParser {
  name: string;
  /** Retourne true si ce parser peut traiter ce fichier */
  canHandle(filename: string, content?: string, buffer?: Buffer): boolean;
  /** Parse le fichier et retourne les transactions */
  parse(content: string | null, buffer: Buffer | null): ParseResult | Promise<ParseResult>;
}
