/**
 * POST /api/mobile/transactions/bulk — Import en masse avec déduplication
 * STORY-059 — AC-6
 */
import {
  getMobileUserId,
  jsonOk,
  jsonError,
  handleCors,
} from "@/lib/mobile-auth";
import { getUserDb } from "@/lib/db";
import {
  checkDuplicates,
  bulkInsertTransactions,
} from "@/lib/queries/transaction-queries";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return handleCors();
}

interface BulkTransactionItem {
  type: "income" | "expense";
  amount: number;
  date: string;
  category: string;
  subcategory?: string;
  description: string;
  import_hash: string;
}

interface BulkImportBody {
  account_id?: number;
  transactions?: BulkTransactionItem[];
}

export async function POST(req: Request) {
  try {
    const userId = await getMobileUserId(req);
    const db = await getUserDb(userId);

    const body = (await req.json()) as BulkImportBody;
    const { account_id, transactions } = body;

    if (!account_id) {
      return jsonError(400, "Champ requis : account_id");
    }

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return jsonError(400, "Champ requis : transactions (tableau non vide)");
    }

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      if (!tx.type || !tx.amount || !tx.date || !tx.import_hash) {
        return jsonError(400, `Transaction [${i}] : champs requis type, amount, date, import_hash`);
      }
      if (tx.type !== "income" && tx.type !== "expense") {
        return jsonError(400, `Transaction [${i}] : type doit être 'income' ou 'expense'`);
      }
    }

    // Vérifier les doublons via import_hash
    const hashes = transactions.map((tx) => tx.import_hash);
    const existingHashes = await checkDuplicates(db, hashes);

    const newTransactions = transactions.filter(
      (tx) => !existingHashes.has(tx.import_hash)
    );
    const duplicates = transactions.length - newTransactions.length;

    if (newTransactions.length === 0) {
      return jsonOk({ imported: 0, duplicates });
    }

    const toInsert = newTransactions.map((tx) => ({
      account_id,
      type: tx.type,
      amount: tx.amount,
      date: tx.date,
      category: tx.category ?? "Autre",
      subcategory: tx.subcategory ?? "",
      description: tx.description ?? "",
      import_hash: tx.import_hash,
    }));

    const imported = await bulkInsertTransactions(db, toInsert);

    return jsonOk({ imported, duplicates });
  } catch (err) {
    if (err instanceof Response) return err;
    return jsonError(500, "Erreur interne");
  }
}
