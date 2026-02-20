import * as XLSX from "xlsx";
import type { BankParser, ParseResult, ParsedTransaction } from "./types";
import { fixMojibake, parseDateFR } from "./utils";

function parseRevolutRows(
  rows: unknown[][],
  dateIdx: number,
  descIdx: number,
  montantIdx: number,
  soldeIdx: number,
  deviseIdx: number = -1,
  etatIdx: number = -1
): ParseResult {
  const transactions: ParsedTransaction[] = [];
  let lastBalance: number | null = null;
  let lastBalanceDate: string | null = null;
  let currency = "EUR";

  for (const row of rows) {
    if (!row || row.length <= Math.max(dateIdx, montantIdx)) continue;

    // Lire le statut de l'opération
    const etat = etatIdx >= 0 ? fixMojibake(String(row[etatIdx] ?? "")).trim().toUpperCase() : "";

    // Ignorer les opérations annulées/refusées (RENVOYÉ, ANNULÉ, FAILED, REVERTED…)
    if (etat && (etat.includes("RENVOY") || etat.includes("ANNUL") || etat === "FAILED" || etat === "REVERTED")) {
      continue;
    }

    let date: string | number | unknown = row[dateIdx];
    const description = fixMojibake(String(row[descIdx] ?? "").trim());
    const montant = parseFloat(String(row[montantIdx]));

    if (deviseIdx >= 0 && row[deviseIdx]) {
      currency = String(row[deviseIdx]).trim();
    }

    if (typeof date === "number") {
      // Excel serial date
      const baseDate = new Date(1899, 11, 30);
      const targetDate = new Date(baseDate.getTime() + date * 86400000);
      date = targetDate.toISOString().split("T")[0];
    } else if (typeof date === "string") {
      if (date.includes("/")) {
        date = parseDateFR(date);
      } else if (date.includes(" ")) {
        // "2026-02-01 10:30:00" format
        date = date.split(" ")[0];
      }
    }

    // N'utiliser le Solde que pour les transactions confirmées (pas EN ATTENTE)
    const isCompleted = !etat || etat === "TERMINÉ" || etat === "COMPLETED" || etat === "COMPLETE";
    if (isCompleted && soldeIdx >= 0 && row[soldeIdx] != null) {
      const solde = parseFloat(String(row[soldeIdx]));
      if (!isNaN(solde)) {
        lastBalance = solde;
        lastBalanceDate = String(date);
      }
    }

    if (date && description && !isNaN(montant) && montant !== 0) {
      transactions.push({
        date: String(date),
        description,
        amount: Math.abs(montant),
        type: montant > 0 ? "income" : "expense",
      });
    }
  }

  return {
    transactions,
    detectedBalance: lastBalance,
    detectedBalanceDate: lastBalanceDate,
    bankName: "Revolut",
    currency,
  };
}

function parseRevolutBuffer(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

  if (data.length < 2) {
    return {
      transactions: [],
      detectedBalance: null,
      detectedBalanceDate: null,
      bankName: "Revolut",
      currency: "EUR",
    };
  }

  // XLSX peut lire les caractères accentués en mojibake (UTF-8 interprété Latin-1)
  const headers = (data[0] as string[]).map((h) => (h ? fixMojibake(String(h)) : h));

  const dateIdx = headers.findIndex((h) => h && String(h).toLowerCase().includes("début"));
  const descIdx = headers.findIndex((h) => h === "Description");
  const montantIdx = headers.findIndex((h) => h === "Montant");
  const soldeIdx = headers.findIndex((h) => h === "Solde");
  const deviseIdx = headers.findIndex((h) => h === "Devise");
  const etatIdx = headers.findIndex((h) => h && String(h).toLowerCase().replace(/[eé]/g, "e").includes("etat"));

  if (dateIdx !== -1 && montantIdx !== -1) {
    return parseRevolutRows(data.slice(1), dateIdx, descIdx, montantIdx, soldeIdx, deviseIdx, etatIdx);
  }

  // Fallback : en-têtes anglaises
  const dateIdxEN = headers.findIndex((h) => h && String(h).toLowerCase().includes("started"));
  const descIdxEN = headers.findIndex((h) => h === "Description");
  const montantIdxEN = headers.findIndex((h) => h === "Amount");
  const soldeIdxEN = headers.findIndex((h) => h === "Balance");
  const deviseIdxEN = headers.findIndex((h) => h === "Currency");
  const etatIdxEN = headers.findIndex((h) => h === "State");

  if (dateIdxEN === -1 || montantIdxEN === -1) {
    return {
      transactions: [],
      detectedBalance: null,
      detectedBalanceDate: null,
      bankName: "Revolut",
      currency: "EUR",
    };
  }

  return parseRevolutRows(data.slice(1), dateIdxEN, descIdxEN, montantIdxEN, soldeIdxEN, deviseIdxEN, etatIdxEN);
}

export const revolutParser: BankParser = {
  name: "Revolut",
  canHandle(filename) {
    return filename.toLowerCase().endsWith(".xlsx");
  },
  parse(_content, buffer) {
    if (!buffer) throw new Error("Buffer requis pour XLSX");
    return parseRevolutBuffer(buffer);
  },
};
