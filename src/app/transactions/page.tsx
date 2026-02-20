import { searchTransactions, getAllAccounts, getCategorizationRules } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Pagination } from "@/components/pagination";
import { ExportTransactions } from "@/components/export-transactions";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string; q?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const accountId = params.accountId ? parseInt(params.accountId) : undefined;
  const search = params.q || undefined;
  const sort = params.sort || "date_desc";
  const page = params.page ? parseInt(params.page) : 1;
  const perPage = 20;

  const [{ transactions, total }, accounts, rules] = await Promise.all([
    searchTransactions({ accountId, search, sort, page, perPage }),
    getAllAccounts(),
    getCategorizationRules(),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <ImportButton accounts={accounts} defaultAccountId={accountId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle transaction</CardTitle>
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
        />
        <ExportTransactions transactions={transactions} />
      </div>

      <Card>
        <CardContent className="p-0">
          {!accountId ? (
            <p className="py-8 text-center text-muted-foreground">
              Sélectionnez un compte pour voir ses transactions
            </p>
          ) : transactions.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Aucune transaction
            </p>
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
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(tx.date)}
                        </TableCell>
                        <TableCell>{tx.description || "—"}</TableCell>
                        <TableCell>{tx.category}</TableCell>
                        <TableCell
                          className={`text-right font-medium whitespace-nowrap ${
                            tx.type === "income"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatCurrency(tx.amount)}
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
                  <div key={tx.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{tx.description || tx.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-medium ${
                          tx.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </span>
                      <EditTransactionDialog transaction={tx} accounts={accounts} rules={rules} />
                      <DeleteTransactionButton id={tx.id} />
                    </div>
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
