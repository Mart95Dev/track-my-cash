"use server";

import { parseBanquePopulaire, parseMCB, parseRevolut } from "@/lib/parsers";
import {
  generateImportHash,
  checkDuplicates,
  bulkInsertTransactions,
} from "@/lib/queries";
import { revalidatePath } from "next/cache";

export async function importFileAction(formData: FormData) {
  const file = formData.get("file") as File;
  const accountId = parseInt(formData.get("accountId") as string);

  if (!file || !accountId) {
    return { error: "Fichier et compte requis" };
  }

  const filename = file.name.toLowerCase();
  let parseResult;

  if (filename.endsWith(".xlsx")) {
    const buffer = Buffer.from(await file.arrayBuffer());
    parseResult = parseRevolut(buffer);
  } else {
    // CSV - detect encoding
    const arrayBuffer = await file.arrayBuffer();
    // Try UTF-8 first, then ISO-8859-1
    let content = new TextDecoder("utf-8").decode(arrayBuffer);
    if (content.includes("�") || content.includes("Num")) {
      content = new TextDecoder("iso-8859-1").decode(arrayBuffer);
    }

    if (content.includes("Date de la transaction") || content.includes("Devise du compte MGA")) {
      parseResult = parseMCB(content);
    } else {
      parseResult = parseBanquePopulaire(content);
    }
  }

  if (parseResult.transactions.length === 0) {
    return { error: "Aucune transaction trouvée dans le fichier" };
  }

  // Generate hashes and check duplicates
  const transactionsWithHash = parseResult.transactions.map((t) => ({
    ...t,
    import_hash: generateImportHash(t.date, t.description, t.amount * (t.type === "expense" ? -1 : 1)),
  }));

  const existingHashes = checkDuplicates(transactionsWithHash.map((t) => t.import_hash));
  const newTransactions = transactionsWithHash.filter((t) => !existingHashes.has(t.import_hash));
  const duplicateCount = transactionsWithHash.length - newTransactions.length;

  // Return preview data for user confirmation
  return {
    success: true,
    preview: {
      bankName: parseResult.bankName,
      currency: parseResult.currency,
      detectedBalance: parseResult.detectedBalance,
      detectedBalanceDate: parseResult.detectedBalanceDate,
      totalCount: parseResult.transactions.length,
      newCount: newTransactions.length,
      duplicateCount,
      transactions: newTransactions.map((t) => ({
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        import_hash: t.import_hash,
      })),
    },
  };
}

export async function confirmImportAction(
  accountId: number,
  transactions: {
    date: string;
    description: string;
    amount: number;
    type: "income" | "expense";
    import_hash: string;
  }[]
) {
  const toInsert = transactions.map((t) => ({
    account_id: accountId,
    type: t.type,
    amount: t.amount,
    date: t.date,
    category: t.type === "income" ? "Autre revenu" : "Autre dépense",
    description: t.description,
    import_hash: t.import_hash,
  }));

  const count = bulkInsertTransactions(toInsert);
  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true, imported: count };
}
