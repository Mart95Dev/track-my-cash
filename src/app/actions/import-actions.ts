"use server";

import { parseBanquePopulaire, parseMCB, parseRevolut, parseMCBPdf } from "@/lib/parsers";
import {
  generateImportHash,
  checkDuplicates,
  bulkInsertTransactions,
  getCategorizationRules,
  updateAccountBalance,
} from "@/lib/queries";
import { revalidatePath } from "next/cache";

// Applique les règles de catégorisation — retourne le pattern (sous-catégorie précise)
function applyRules(
  description: string,
  rules: { pattern: string; category: string }[]
): string {
  for (const rule of rules) {
    try {
      if (new RegExp(rule.pattern, "i").test(description)) return rule.pattern;
    } catch {
      if (description.toLowerCase().includes(rule.pattern.toLowerCase())) return rule.pattern;
    }
  }
  return "Autre";
}

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
    if (content.includes("") || content.includes("Num")) {
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

  // Récupération des règles une seule fois pour toutes les transactions
  const rules = await getCategorizationRules();
  // Patterns groupés par catégorie large pour le select de l'import
  const availableCategories = [...rules.map((r) => r.pattern)].sort();
  if (!availableCategories.includes("Autre")) availableCategories.push("Autre");

  const transactionsWithHash = parseResult.transactions.map((t) => ({
    ...t,
    import_hash: generateImportHash(t.date, t.description, t.amount * (t.type === "expense" ? -1 : 1)),
    category: applyRules(t.description, rules),
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
      availableCategories,
      transactions: newTransactions.map((t) => ({
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        import_hash: t.import_hash,
        category: t.category,
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
    category: string;
  }[],
  detectedBalance: number | null = null,
  detectedBalanceDate: string | null = null
) {
  // Les catégories sont déjà déterminées côté client (sélection utilisateur ou auto)
  const toInsert = transactions.map((t) => ({
    account_id: accountId,
    type: t.type,
    amount: t.amount,
    date: t.date,
    category: t.category,
    description: t.description,
    import_hash: t.import_hash,
  }));

  const count = await bulkInsertTransactions(toInsert);

  // Mise à jour du solde de référence si le relevé fournit un solde détecté.
  // balance_date = lendemain de la dernière tx pour éviter le double comptage.
  let balanceUpdated = false;
  let newBalance: number | null = null;
  let newBalanceDate: string | null = null;

  if (detectedBalance !== null && detectedBalanceDate !== null) {
    const allDates = transactions.map((t) => t.date);
    const latestTxDate =
      allDates.length > 0
        ? allDates.reduce((max, d) => (d > max ? d : max), detectedBalanceDate)
        : detectedBalanceDate;

    const nextDay = new Date(latestTxDate);
    nextDay.setDate(nextDay.getDate() + 1);
    newBalanceDate = nextDay.toISOString().split("T")[0];
    newBalance = detectedBalance;

    await updateAccountBalance(accountId, newBalance, newBalanceDate);
    balanceUpdated = true;
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/comptes");
  return { success: true, imported: count, balanceUpdated, newBalance, newBalanceDate };
}
