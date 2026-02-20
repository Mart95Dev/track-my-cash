"use server";

import { parseBanquePopulaire, parseMCB, parseRevolut, parseMCBPdf } from "@/lib/parsers";
import {
  generateImportHash,
  checkDuplicates,
  bulkInsertTransactions,
  autoCategorize,
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

  if (filename.endsWith(".pdf")) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      parseResult = parseMCBPdf(buffer);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Erreur lors de la lecture du PDF" };
    }
  } else if (filename.endsWith(".xlsx")) {
    const buffer = Buffer.from(await file.arrayBuffer());
    parseResult = parseRevolut(buffer);
  } else {
    const arrayBuffer = await file.arrayBuffer();
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

  const transactionsWithHash = parseResult.transactions.map((t) => ({
    ...t,
    import_hash: generateImportHash(t.date, t.description, t.amount * (t.type === "expense" ? -1 : 1)),
  }));

  const existingHashes = await checkDuplicates(transactionsWithHash.map((t) => t.import_hash));
  const newTransactions = transactionsWithHash.filter((t) => !existingHashes.has(t.import_hash));
  const duplicateCount = transactionsWithHash.length - newTransactions.length;

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
  const toInsert = await Promise.all(
    transactions.map(async (t) => ({
      account_id: accountId,
      type: t.type,
      amount: t.amount,
      date: t.date,
      category: await autoCategorize(t.description),
      description: t.description,
      import_hash: t.import_hash,
    }))
  );

  const count = await bulkInsertTransactions(toInsert);
  revalidatePath("/");
  revalidatePath("/transactions");
  return { success: true, imported: count };
}
