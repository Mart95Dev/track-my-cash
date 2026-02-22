"use server";

import { detectAndParseFile, genericCsvParser } from "@/lib/parsers";
import type { ColumnMapping, ParseResult } from "@/lib/parsers";
import {
  generateImportHash,
  checkDuplicates,
  bulkInsertTransactions,
  getCategorizationRules,
  getSetting,
  setSetting,
  updateAccountBalance,
} from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId, getRequiredSession } from "@/lib/auth-utils";
import { checkAndSendLowBalanceAlert } from "@/lib/alert-service";
import { detectAndNotifyAnomalies } from "@/lib/anomaly-service";
import { canImportFormat } from "@/lib/subscription-utils";
import { revalidatePath } from "next/cache";

// Applique les règles de catégorisation — retourne { category: catégorie large, subcategory: pattern }
function applyRules(
  description: string,
  rules: { pattern: string; category: string }[]
): { category: string; subcategory: string } {
  for (const rule of rules) {
    try {
      if (new RegExp(rule.pattern, "i").test(description)) return { category: rule.category, subcategory: rule.pattern };
    } catch {
      if (description.toLowerCase().includes(rule.pattern.toLowerCase())) return { category: rule.category, subcategory: rule.pattern };
    }
  }
  return { category: "Autre", subcategory: "" };
}

export async function importFileAction(formData: FormData) {
  const file = formData.get("file") as File;
  const accountId = parseInt(formData.get("accountId") as string);

  if (!file || !accountId) {
    return { error: "Fichier et compte requis" };
  }

  // Guard format d'import (avant toute lecture lourde)
  const userId = await getRequiredUserId();
  const formatCheck = await canImportFormat(userId, file.name);
  if (!formatCheck.allowed) {
    return { error: formatCheck.reason };
  }

  const filename = file.name.toLowerCase();

  let csvContent: string | null = null;
  let rawParseResult;

  try {
    const isPdf = filename.endsWith(".pdf");
    const isXlsx = filename.endsWith(".xlsx");

    if (isPdf || isXlsx) {
      const buffer = Buffer.from(await file.arrayBuffer());
      rawParseResult = await detectAndParseFile(filename, null, buffer);
    } else {
      const arrayBuffer = await file.arrayBuffer();
      let content = new TextDecoder("utf-8").decode(arrayBuffer);
      if (content.includes("\ufffd") || content.includes("Num")) {
        content = new TextDecoder("iso-8859-1").decode(arrayBuffer);
      }
      csvContent = content;
      rawParseResult = await detectAndParseFile(filename, content, null);
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur lors de la lecture du fichier" };
  }

  // CSV non reconnu → vérifier si un mapping sauvegardé existe, sinon demander à l'utilisateur
  let parseResult: ParseResult;
  if ("needsMapping" in rawParseResult && rawParseResult.needsMapping) {
    const db = await getUserDb(userId);
    const savedMapping = await getSetting(db, `csv_mapping_${rawParseResult.fingerprint}`);
    if (savedMapping) {
      const mapping: ColumnMapping = JSON.parse(savedMapping);
      parseResult = genericCsvParser.parseWithMapping(csvContent ?? "", mapping);
    } else {
      return {
        needsMapping: true as const,
        headers: rawParseResult.headers,
        preview: rawParseResult.preview,
        fingerprint: rawParseResult.fingerprint,
        content: csvContent ?? "",
      };
    }
  } else {
    parseResult = rawParseResult as ParseResult;
  }

  if (parseResult.transactions.length === 0) {
    return { error: "Aucune transaction trouvée dans le fichier" };
  }

  const db = await getUserDb(userId);

  // Récupération des règles une seule fois pour toutes les transactions
  const rules = await getCategorizationRules(db);

  const transactionsWithHash = parseResult.transactions.map((t) => {
    const { category, subcategory } = applyRules(t.description, rules);
    return {
      ...t,
      import_hash: generateImportHash(t.date, t.description, t.amount * (t.type === "expense" ? -1 : 1)),
      category,
      subcategory,
    };
  });

  const existingHashes = await checkDuplicates(db, transactionsWithHash.map((t) => t.import_hash));
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
      rules: rules.map((r) => ({ pattern: r.pattern, category: r.category })),
      transactions: newTransactions.map((t) => ({
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        import_hash: t.import_hash,
        category: t.category,
        subcategory: t.subcategory,
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
    subcategory: string;
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
    subcategory: t.subcategory,
    description: t.description,
    import_hash: t.import_hash,
  }));

  const session = await getRequiredSession();
  const userId = session.user.id;
  const db = await getUserDb(userId);
  const count = await bulkInsertTransactions(db, toInsert);

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

    await updateAccountBalance(db, accountId, newBalance, newBalanceDate);
    balanceUpdated = true;
  }

  // Fire-and-forget — ne bloque pas l'import
  checkAndSendLowBalanceAlert(db, accountId, session.user.email).catch(() => {});
  detectAndNotifyAnomalies(db, accountId, transactions).catch(() => {});
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/comptes");
  return { success: true, imported: count, balanceUpdated, newBalance, newBalanceDate };
}

export async function importWithMappingAction(
  accountId: number,
  content: string,
  mapping: ColumnMapping,
  fingerprint: string,
  saveMapping: boolean
) {
  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);

  if (saveMapping) {
    await setSetting(db, `csv_mapping_${fingerprint}`, JSON.stringify(mapping));
  }

  const parseResult = genericCsvParser.parseWithMapping(content, mapping);

  if (parseResult.transactions.length === 0) {
    return { error: "Aucune transaction trouvée avec ce mapping" };
  }

  const rules = await getCategorizationRules(db);

  const transactionsWithHash = parseResult.transactions.map((t) => {
    const { category, subcategory } = applyRules(t.description, rules);
    return {
      ...t,
      import_hash: generateImportHash(t.date, t.description, t.amount * (t.type === "expense" ? -1 : 1)),
      category,
      subcategory,
    };
  });

  const existingHashes = await checkDuplicates(db, transactionsWithHash.map((t) => t.import_hash));
  const newTransactions = transactionsWithHash.filter((t) => !existingHashes.has(t.import_hash));
  const duplicateCount = transactionsWithHash.length - newTransactions.length;

  return {
    success: true,
    preview: {
      bankName: parseResult.bankName,
      currency: parseResult.currency,
      detectedBalance: null,
      detectedBalanceDate: null,
      totalCount: parseResult.transactions.length,
      newCount: newTransactions.length,
      duplicateCount,
      rules: rules.map((r) => ({ pattern: r.pattern, category: r.category })),
      transactions: newTransactions.map((t) => ({
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        import_hash: t.import_hash,
        category: t.category,
        subcategory: t.subcategory,
      })),
    },
  };
}
