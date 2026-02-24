import { searchTransactions, getAllAccounts, getCategorizationRules, getUncategorizedTransactions } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { TransactionForm } from "@/components/transaction-form";
import { DeleteTransactionButton } from "@/components/delete-transaction-button";
import { EditTransactionDialog } from "@/components/edit-transaction-dialog";
import { ImportButton } from "@/components/import-button";
import { TransactionSearch } from "@/components/transaction-search";
import { TransactionTagPopover } from "@/components/transaction-tag-popover";
import { Pagination } from "@/components/pagination";
import { ExportTransactions } from "@/components/export-transactions";
import { AutoCategorizeButton } from "@/components/auto-categorize-button";
import { canUseAI } from "@/lib/subscription-utils";
import { getTagsAction, getTransactionTagsBatchAction } from "@/app/actions/tag-actions";
import type { Tag } from "@/app/actions/tag-actions";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string; q?: string; sort?: string; page?: string; tagId?: string }>;
}) {
  const params = await searchParams;
  const accountId = params.accountId ? parseInt(params.accountId) : undefined;
  const search = params.q || undefined;
  const sort = params.sort || "date_desc";
  const page = params.page ? parseInt(params.page) : 1;
  const tagId = params.tagId ? parseInt(params.tagId) : undefined;
  const perPage = 20;
  const locale = await getLocale();

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);

  const [{ transactions, total }, accounts, rules, allTags, uncategorized, aiAccess] = await Promise.all([
    searchTransactions(db, { accountId, search, sort, page, perPage, tagId }),
    getAllAccounts(db),
    getCategorizationRules(db),
    getTagsAction(),
    getUncategorizedTransactions(db, 50),
    canUseAI(userId),
  ]);

  const txIds = transactions.map((tx) => tx.id);
  const txTagsMap = await getTransactionTagsBatchAction(txIds);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="flex flex-col pb-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-text-main">Transactions</h1>
        <ImportButton accounts={accounts} defaultAccountId={accountId} />
      </div>

      {/* Formulaire ajout */}
      <div className="mx-4 mb-4 bg-white rounded-2xl border border-slate-100 shadow-soft p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
          <h2 className="font-bold text-text-main text-sm">Nouvelle transaction</h2>
        </div>
        <TransactionForm accounts={accounts} rules={rules} defaultAccountId={accountId} />
      </div>

      {/* Barre recherche + filtres */}
      <TransactionSearch
        accounts={accounts}
        currentAccountId={accountId}
        currentSearch={search}
        currentSort={sort}
        tags={allTags}
        currentTagId={tagId}
      />

      {/* Boutons action */}
      <div className="flex items-center gap-2 px-4 mb-4 overflow-x-auto no-scrollbar">
        <ExportTransactions transactions={transactions} accounts={accounts} />
        {aiAccess.allowed && (
          <AutoCategorizeButton uncategorizedCount={uncategorized.length} />
        )}
      </div>

      {/* Liste transactions */}
      {!accountId ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <span className="material-symbols-outlined text-text-muted text-[48px] mb-3">filter_list</span>
          <p className="text-text-muted text-sm">Sélectionnez un compte pour voir les transactions</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <span className="material-symbols-outlined text-text-muted text-[48px] mb-3">receipt_long</span>
          <p className="text-text-muted text-sm">Aucune transaction trouvée</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-4">
          {transactions.map((tx) => {
            const isIncome = tx.type === "income";
            const txTags: Tag[] = (txTagsMap[tx.id] ?? [])
              .map((tagId: number) => allTags.find((t) => t.id === tagId))
              .filter((t): t is Tag => t !== undefined);

            // Extraire mois et jour pour le bloc date Stitch
            const dateObj = new Date(tx.date);
            const dayNum = dateObj.getDate();
            const monthShort = dateObj.toLocaleDateString(locale, { month: "short" });

            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 flex items-center justify-between gap-4"
              >
                {/* Bloc date style Stitch */}
                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-slate-100 shrink-0 text-slate-500">
                  <span className="text-[10px] uppercase font-bold tracking-wider">{monthShort}</span>
                  <span className="text-lg font-bold leading-none">{dayNum}</span>
                </div>

                {/* Infos transaction */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <p className="font-bold text-text-main truncate">
                    {tx.description || tx.category || "—"}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {tx.category && (
                      <span className="inline-flex items-center rounded-md bg-indigo-50 text-primary px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-primary/10">
                        {tx.category}{tx.subcategory ? ` · ${tx.subcategory}` : ""}
                      </span>
                    )}
                    {txTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-xs font-medium rounded-full px-2 py-0.5"
                        style={{
                          backgroundColor: tag.color + "20",
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Montant + actions */}
                <div className="shrink-0 text-right flex flex-col items-end gap-1">
                  <p className={`font-bold text-lg ${isIncome ? "text-success" : "text-danger"}`}>
                    {isIncome ? "+" : "-"}{formatCurrency(Math.abs(tx.amount), "EUR", locale)}
                  </p>
                  <div className="flex items-center gap-1">
                    {tx.note && (
                      <span
                        className="material-symbols-outlined text-text-muted text-[18px]"
                        title={tx.note}
                      >
                        sticky_note
                      </span>
                    )}
                    <TransactionTagPopover
                      transactionId={tx.id}
                      allTags={allTags}
                      initialTagIds={txTagsMap[tx.id] ?? []}
                    />
                    <EditTransactionDialog transaction={tx} accounts={accounts} rules={rules} />
                    <DeleteTransactionButton id={tx.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
