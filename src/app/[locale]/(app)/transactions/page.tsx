import { searchTransactions, getAllAccounts, getCategorizationRules, getUncategorizedTransactions } from "@/lib/queries";
import { getUserDb, getDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { formatCurrency } from "@/lib/format";
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
import { getCoupleByUserId } from "@/lib/couple-queries";
import { TransactionCoupleToggle } from "@/components/transaction-couple-toggle";

export const dynamic = "force-dynamic";

function getDateLabel(dateKey: string, locale: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateKey === today) return "Aujourd'hui";
  if (dateKey === yesterday) return "Hier";
  const d = new Date(dateKey + "T00:00:00");
  return d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
}

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

  let couple: Awaited<ReturnType<typeof getCoupleByUserId>> = null;
  try {
    couple = await getCoupleByUserId(getDb(), userId);
  } catch {
    couple = null;
  }

  const txIds = transactions.map((tx) => tx.id);
  const txTagsMap = await getTransactionTagsBatchAction(txIds);

  const totalPages = Math.ceil(total / perPage);

  // Groupement des transactions par date — AC-4
  const txByDate = transactions.reduce<Record<string, typeof transactions>>((acc, tx) => {
    const dateKey = tx.date.slice(0, 10);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(tx);
    return acc;
  }, {});
  const sortedDates = Object.keys(txByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col pb-2 bg-[#F8F7FC]">

      {/* Header sticky */}
      <header className="sticky top-0 z-40 bg-[#F8F7FC]/95 backdrop-blur-md border-b border-[#EEEEEE]">
        <div className="px-4 py-4">
          <h1 className="text-[28px] font-bold tracking-tight text-[#212121]">Transactions</h1>
        </div>
      </header>

      {/* Filtres avancés (fonctionnalité préservée) */}
      <div className="px-4 pt-3">
        <TransactionSearch
          accounts={accounts}
          currentAccountId={accountId}
          currentSearch={search}
          currentSort={sort}
          tags={allTags}
          currentTagId={tagId}
        />
      </div>

      {/* Formulaire ajout */}
      <div className="mx-4 mt-3 mb-4 bg-white rounded-2xl border border-[#EEEEEE] shadow-[0_1px_3px_rgba(108,92,231,0.06)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#6C5CE7] text-[20px]">add_circle</span>
          <h2 className="font-bold text-[#212121] text-sm">Nouvelle transaction</h2>
        </div>
        <TransactionForm accounts={accounts} rules={rules} defaultAccountId={accountId} />
      </div>

      {/* Boutons action : Import CSV | Export Data | AI Scan — AC-3 */}
      <div className="flex gap-3 px-4 pb-4">
        {/* Import CSV — AC-7 : fonctionnalité import préservée */}
        <div className="flex-1">
          <ImportButton accounts={accounts} defaultAccountId={accountId} />
        </div>
        {/* Export Data */}
        <div className="flex-1">
          <ExportTransactions transactions={transactions} accounts={accounts} />
        </div>
        {/* AI Scan */}
        {aiAccess.allowed && (
          <div className="flex-1 h-12 rounded-2xl bg-[#F0EEFF] hover:bg-[#E5E1FF] transition-colors flex items-center justify-center gap-2 text-[#6C5CE7] text-sm font-bold">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <AutoCategorizeButton uncategorizedCount={uncategorized.length} />
          </div>
        )}
      </div>

      {/* Liste transactions — AC-4 : groupees par date */}
      {!accountId ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <span className="material-symbols-outlined text-[#757575] text-[48px] mb-3">filter_list</span>
          <p className="text-[#757575] text-sm">Selectionnez un compte pour voir les transactions</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
          <span className="material-symbols-outlined text-[#757575] text-[48px] mb-3">receipt_long</span>
          <p className="text-[#757575] text-sm">Aucune transaction trouvee</p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-6">
          {sortedDates.map((dateKey) => {
            const group = txByDate[dateKey];
            const dateLabel = getDateLabel(dateKey, locale);
            return (
              <div key={dateKey}>
                {/* Header date sticky — AC-4 */}
                <div className="sticky top-0 z-10 py-3 bg-[#F8F7FC]/95 backdrop-blur-sm px-2 mb-2">
                  <h2 className="text-base font-bold text-[#212121]">{dateLabel}</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {group.map((tx) => {
                    const isIncome = tx.type === "income";
                    const txTags: Tag[] = (txTagsMap[tx.id] ?? [])
                      .map((tagId: number) => allTags.find((t) => t.id === tagId))
                      .filter((t): t is Tag => t !== undefined);

                    return (
                      <div
                        key={tx.id}
                        className="relative overflow-hidden rounded-2xl shadow-[0_1px_3px_rgba(108,92,231,0.06)] bg-white border border-[#EEEEEE] transition-all hover:shadow-md"
                      >
                        <div className="p-4 flex items-center justify-between gap-4">
                          {/* Icône catégorie cercle coloré — AC-5 */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div
                              className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${
                                isIncome
                                  ? "bg-[#E6F9F3] text-[#00B894]"
                                  : "bg-[#F5F5F5] text-[#757575]"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[22px]">
                                {isIncome ? "arrow_circle_down" : "arrow_circle_up"}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <h3 className="font-bold text-base text-[#212121] truncate">
                                {tx.description || tx.category || "—"}
                              </h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                {tx.category && (
                                  <span className="text-sm text-[#757575] truncate">{tx.category}</span>
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
                          </div>

                          {/* Montant coloré + actions — AC-5 */}
                          <div className="shrink-0 text-right flex flex-col items-end gap-1">
                            <p
                              className={`font-extrabold text-lg tracking-tight ${
                                isIncome ? "text-[#00B894]" : "text-[#E17055]"
                              }`}
                            >
                              {isIncome ? "+" : "-"}{formatCurrency(Math.abs(tx.amount), "EUR", locale)}
                            </p>
                            <div className="flex items-center gap-1">
                              {tx.note && (
                                <span
                                  className="material-symbols-outlined text-[#757575] text-[18px]"
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
                              {couple !== null && (
                                <TransactionCoupleToggle
                                  txId={tx.id}
                                  isShared={(tx as unknown as Record<string, unknown>).is_couple_shared === 1}
                                  userId={userId}
                                />
                              )}
                              <EditTransactionDialog transaction={tx} accounts={accounts} rules={rules} />
                              <DeleteTransactionButton id={tx.id} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
