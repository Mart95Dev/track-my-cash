import { searchTransactions, getAllAccounts, getCategorizationRules } from "@/lib/queries";
import { getUserDb } from "@/lib/db";
import { getRequiredUserId } from "@/lib/auth-utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransactionForm } from "@/components/transaction-form";
import { DeleteTransactionButton } from "@/components/delete-transaction-button";
import { EditTransactionDialog } from "@/components/edit-transaction-dialog";
import { ImportButton } from "@/components/import-button";
import { TransactionSearch } from "@/components/transaction-search";
import { TransactionTagPopover } from "@/components/transaction-tag-popover";
import { Pagination } from "@/components/pagination";
import { ExportTransactions } from "@/components/export-transactions";
import { getTagsAction, getTransactionTagsBatchAction } from "@/app/actions/tag-actions";
import { getTranslations, getLocale } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowDownUp } from "lucide-react";

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
  const t = await getTranslations("transactions");
  const locale = await getLocale();

  const userId = await getRequiredUserId();
  const db = await getUserDb(userId);

  const [{ transactions, total }, accounts, rules, allTags] = await Promise.all([
    searchTransactions(db, { accountId, search, sort, page, perPage, tagId }),
    getAllAccounts(db),
    getCategorizationRules(db),
    getTagsAction(),
  ]);

  const txIds = transactions.map((tx) => tx.id);
  const txTagsMap = await getTransactionTagsBatchAction(txIds);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <ImportButton accounts={accounts} defaultAccountId={accountId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("newTransaction")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm accounts={accounts} rules={rules} defaultAccountId={accountId} />
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <TransactionSearch
          accounts={accounts}
          currentAccountId={accountId}
          currentSearch={search}
          currentSort={sort}
          tags={allTags}
          currentTagId={tagId}
        />
        <ExportTransactions transactions={transactions} />
      </div>

      <Card>
        <CardContent className="p-0">
          {!accountId ? (
            <p className="py-8 text-center text-muted-foreground">
              {t("selectAccount")}
            </p>
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={<ArrowDownUp className="h-12 w-12" />}
              title={t("emptyTitle")}
              description={t("emptyDescription")}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(tx.date, locale)}
                        </TableCell>
                        <TableCell>{tx.description || "—"}</TableCell>
                        <TableCell>
                          <span className="text-sm">{tx.category}</span>
                          {tx.subcategory && (
                            <span className="block text-xs text-muted-foreground">{tx.subcategory}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <TransactionTagPopover
                            transactionId={tx.id}
                            allTags={allTags}
                            initialTagIds={txTagsMap[tx.id] ?? []}
                          />
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium whitespace-nowrap ${
                            tx.type === "income"
                              ? "text-income"
                              : "text-expense"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatCurrency(tx.amount, "EUR", locale)}
                        </TableCell>
                        <TableCell className="flex gap-1">
                          <EditTransactionDialog transaction={tx} accounts={accounts} rules={rules} />
                          <DeleteTransactionButton id={tx.id} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{tx.description || tx.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tx.date, locale)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-medium ${
                            tx.type === "income"
                              ? "text-income"
                              : "text-expense"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatCurrency(tx.amount, "EUR", locale)}
                        </span>
                        <EditTransactionDialog transaction={tx} accounts={accounts} rules={rules} />
                        <DeleteTransactionButton id={tx.id} />
                      </div>
                    </div>
                    {(txTagsMap[tx.id]?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {(txTagsMap[tx.id] ?? []).map((tagIdVal) => {
                          const tag = allTags.find((tg) => tg.id === tagIdVal);
                          if (!tag) return null;
                          return (
                            <Badge
                              key={tag.id}
                              style={{ backgroundColor: tag.color, color: "#fff" }}
                              className="text-xs"
                            >
                              {tag.name}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
